import PropTypes from 'prop-types';
// @mui
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  Stack
} from '@mui/material';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
// redux
import { useGetInvoicePaymentsQuery } from 'src/redux/services/salesInvoicesApi';

// ----------------------------------------------------------------------

const PAYMENT_METHOD_CONFIG: Record<
  string,
  { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: string }
> = {
  cash: { label: 'Efectivo', color: 'success', icon: 'mdi:cash' },
  transfer: { label: 'Transferencia', color: 'info', icon: 'mdi:bank-transfer' },
  card: { label: 'Tarjeta', color: 'primary', icon: 'mdi:credit-card' },
  check: { label: 'Cheque', color: 'warning', icon: 'mdi:checkbook' },
  other: { label: 'Otro', color: 'default', icon: 'mdi:cash-multiple' }
};

// ----------------------------------------------------------------------

export default function InvoicePaymentHistory({ invoiceId }) {
  const { data: payments = [], isLoading, error } = useGetInvoicePaymentsQuery(invoiceId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Historial de Pagos" />
        <Box sx={{ p: 3 }}>
          <LoadingScreen />
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title="Historial de Pagos" />
        <Box sx={{ p: 3 }}>
          <Typography color="error">Error al cargar el historial de pagos</Typography>
        </Box>
      </Card>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);

  return (
    <Card>
      <CardHeader
        title="Historial de Pagos"
        subheader={
          payments.length > 0 ? (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {payments.length} {payments.length === 1 ? 'pago registrado' : 'pagos registrados'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                •
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight="bold">
                Total pagado: {fCurrency(totalPaid)}
              </Typography>
            </Stack>
          ) : (
            'No hay pagos registrados'
          )
        }
      />

      {payments.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Iconify icon="solar:bill-cross-bold-duotone" width={48} sx={{ mb: 2, color: 'text.disabled' }} />
          <Typography color="text.secondary">No hay pagos registrados para esta factura</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell>Notas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment, index) => {
                const methodConfig = PAYMENT_METHOD_CONFIG[payment.method] || PAYMENT_METHOD_CONFIG.other;

                return (
                  <TableRow key={payment.id || index} hover>
                    <TableCell>
                      <Typography variant="body2">{fDate(payment.payment_date, 'dd/MM/yyyy')}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reg: {fDate(payment.created_at, 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon={methodConfig.icon} width={20} />
                        <Chip label={methodConfig.label} size="small" color={methodConfig.color} />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {payment.reference || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="subtitle2" color="success.main">
                        {fCurrency(parseFloat(payment.amount))}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 250 }}>
                        {payment.notes || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}

InvoicePaymentHistory.propTypes = {
  invoiceId: PropTypes.string.isRequired
};
