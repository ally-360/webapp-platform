import { useState, useEffect, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import TableContainer from '@mui/material/TableContainer';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
// utils
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { LoadingScreen } from 'src/components/loading-screen';
import EmptyContent from 'src/components/empty-content';
// redux
import { useGetPendingInvoicesByCustomerQuery } from 'src/redux/services/salesInvoicesApi';

// ----------------------------------------------------------------------

type Props = {
  customerId?: string;
  paymentAmount: number;
  onInvoicesChange?: (selectedInvoices: InvoiceAllocation[]) => void;
};

export interface InvoiceAllocation {
  invoice_id: string;
  invoice_number: string;
  invoice_total: number;
  balance_due: number;
  amount_applied: number;
}

// ----------------------------------------------------------------------

export default function PaymentInvoiceSelector({ customerId, paymentAmount, onInvoicesChange }: Props) {
  const [selectedInvoices, setSelectedInvoices] = useState<InvoiceAllocation[]>([]);

  // Obtener facturas pendientes del cliente usando el endpoint específico
  const { data: invoicesData, isLoading } = useGetPendingInvoicesByCustomerQuery(
    {
      customer_id: customerId!,
      page: 1,
      size: 100
    },
    {
      skip: !customerId
    }
  );

  const pendingInvoices = useMemo(
    () =>
      invoicesData?.invoices?.map((inv) => {
        const totalAmount = parseFloat(inv.total_amount) || 0;
        const balanceDue = parseFloat(inv.balance_due) || totalAmount; // Si no hay balance_due, usar total_amount

        return {
          invoice_id: inv.id,
          invoice_number: inv.number,
          invoice_date: inv.issue_date,
          invoice_total: totalAmount,
          balance_due: balanceDue,
          amount_applied: 0
        };
      }) || [],
    [invoicesData]
  );

  const totalAllocated = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + (inv.amount_applied || 0), 0),
    [selectedInvoices]
  );

  const remainingAmount = useMemo(() => Number(paymentAmount) - totalAllocated, [paymentAmount, totalAllocated]);

  useEffect(() => {
    if (onInvoicesChange) {
      onInvoicesChange(selectedInvoices);
    }
  }, [selectedInvoices, onInvoicesChange]);

  const handleToggleInvoice = (invoice: any) => {
    const isSelected = selectedInvoices.some((inv) => inv.invoice_id === invoice.invoice_id);

    if (isSelected) {
      setSelectedInvoices((prev) => prev.filter((inv) => inv.invoice_id !== invoice.invoice_id));
    } else {
      // Auto-aplicar el mínimo entre saldo pendiente y monto disponible
      const autoAmount = Math.min(invoice.balance_due, remainingAmount);
      console.log('Toggle invoice:', {
        invoice_number: invoice.invoice_number,
        balance_due: invoice.balance_due,
        remainingAmount,
        autoAmount
      });
      setSelectedInvoices((prev) => [
        ...prev,
        {
          ...invoice,
          amount_applied: autoAmount
        }
      ]);
    }
  };

  const handleAmountChange = (invoiceId: string, newAmount: number) => {
    console.log('Amount change:', { invoiceId, newAmount });
    setSelectedInvoices((prev) =>
      prev.map((inv) => {
        if (inv.invoice_id === invoiceId) {
          const clampedAmount = Math.max(0, Math.min(newAmount, inv.balance_due));
          console.log('Updated amount:', { invoice_id: inv.invoice_id, clampedAmount });
          return { ...inv, amount_applied: clampedAmount };
        }
        return inv;
      })
    );
  };

  if (!customerId) {
    return (
      <Card sx={{ p: 3 }}>
        <EmptyContent
          title="Seleccione un cliente"
          description="Primero debe seleccionar un cliente para ver sus facturas pendientes"
          imgUrl="/assets/icons/empty/ic_content.svg"
        />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card sx={{ p: 3 }}>
        <LoadingScreen />
      </Card>
    );
  }

  if (!pendingInvoices.length) {
    return (
      <Card sx={{ p: 3 }}>
        <EmptyContent
          title="Sin facturas pendientes"
          description="Este cliente no tiene facturas pendientes de pago"
          imgUrl="/assets/icons/empty/ic_invoice.svg"
        />
      </Card>
    );
  }

  return (
    <Card>
      <Stack spacing={2} sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Facturas Pendientes</Typography>
          <Chip label={`${selectedInvoices.length} seleccionadas`} color="primary" />
        </Stack>

        {/* Resumen de asignación */}
        <Stack
          spacing={1}
          sx={{
            p: 2,
            bgcolor: 'background.neutral',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Monto del pago:
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {fCurrency(paymentAmount)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Total asignado:
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={totalAllocated > paymentAmount ? 'error.main' : 'primary.main'}
            >
              {fCurrency(totalAllocated)}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Disponible:
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={remainingAmount < 0 ? 'error.main' : 'success.main'}>
              {fCurrency(remainingAmount)}
            </Typography>
          </Stack>
        </Stack>

        {/* Validaciones */}
        {totalAllocated > paymentAmount && (
          <Alert severity="error" icon={<Iconify icon="solar:danger-bold" />}>
            <strong>Error:</strong> El total asignado ({fCurrency(totalAllocated)}) excede el monto del pago (
            {fCurrency(paymentAmount)}). Ajuste los montos aplicados a las facturas.
          </Alert>
        )}

        {selectedInvoices.length === 0 && paymentAmount > 0 && (
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            <strong>Seleccione facturas:</strong> Marque las casillas de las facturas que desea pagar en la tabla
            inferior. El monto se asignará automáticamente al seleccionar cada factura.
          </Alert>
        )}

        {selectedInvoices.length > 0 && remainingAmount > 0 && (
          <Alert severity="warning" icon={<Iconify icon="solar:notification-bold" />}>
            Aún quedan <strong>{fCurrency(remainingAmount)}</strong> sin asignar. Puede agregar más facturas o dejar
            este monto como crédito disponible.
          </Alert>
        )}

        {selectedInvoices.length > 0 && remainingAmount === 0 && totalAllocated === paymentAmount && (
          <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold" />}>
            ✓ Perfecto! El pago ha sido asignado completamente a {selectedInvoices.length} factura(s).
          </Alert>
        )}
      </Stack>

      {/* Tabla de facturas */}
      <TableContainer>
        <Scrollbar>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">Sel.</TableCell>
                <TableCell>N° Factura</TableCell>
                <TableCell>Fecha Emisión</TableCell>
                <TableCell align="right">Total Factura</TableCell>
                <TableCell align="right">Saldo Pendiente</TableCell>
                <TableCell align="right" sx={{ minWidth: 180 }}>
                  Monto a Aplicar
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pendingInvoices.map((invoice) => {
                const isSelected = selectedInvoices.some((inv) => inv.invoice_id === invoice.invoice_id);
                const selectedInvoice = selectedInvoices.find((inv) => inv.invoice_id === invoice.invoice_id);

                return (
                  <TableRow
                    key={invoice.invoice_id}
                    hover
                    sx={{
                      bgcolor: isSelected ? 'action.selected' : 'inherit',
                      '&:hover': {
                        bgcolor: isSelected ? 'action.selected' : 'action.hover'
                      }
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected} onChange={() => handleToggleInvoice(invoice)} color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {invoice.invoice_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {fDate(invoice.invoice_date)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">{fCurrency(invoice.invoice_total)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={fCurrency(invoice.balance_due)}
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {isSelected ? (
                        <TextField
                          type="number"
                          size="small"
                          value={selectedInvoice?.amount_applied || 0}
                          onChange={(e) => handleAmountChange(invoice.invoice_id, parseFloat(e.target.value) || 0)}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>$</Typography>
                          }}
                          sx={{
                            width: 160,
                            '& input': {
                              textAlign: 'right',
                              fontWeight: 'bold'
                            }
                          }}
                          inputProps={{
                            min: 0,
                            max: invoice.balance_due,
                            step: 0.01
                          }}
                          helperText={
                            selectedInvoice && selectedInvoice.amount_applied > 0
                              ? `Máx: ${fCurrency(invoice.balance_due)}`
                              : ''
                          }
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled" fontStyle="italic">
                          Seleccione para asignar
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}
