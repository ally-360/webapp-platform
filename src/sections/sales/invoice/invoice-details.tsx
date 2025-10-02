import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// _mock
import { INVOICE_STATUS_OPTIONS } from 'src/_mock';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
//
import InvoiceToolbar from './invoice-toolbar';
import InvoicePaymentHistory from './invoice-payment-history';
import InvoicePaymentDialog from './invoice-payment-dialog';

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  }
}));

// ----------------------------------------------------------------------

export default function InvoiceDetails({ invoice }) {
  const [currentStatus, setCurrentStatus] = useState(invoice?.status || 'DRAFT');
  const paymentDialog = useBoolean(false);

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);

  // Return loading state if invoice is not loaded
  if (!invoice) {
    return (
      <Card sx={{ pt: 5, px: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <Typography>Cargando factura...</Typography>
        </Box>
      </Card>
    );
  }

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(parseFloat(invoice.subtotal || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Impuestos</TableCell>
        <TableCell width={120}>{fCurrency(parseFloat(invoice.taxes_total || '0'))}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(parseFloat(invoice.total_amount || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Pagado</TableCell>
        <TableCell width={120} sx={{ color: 'success.main', typography: 'body2' }}>
          {fCurrency(parseFloat(invoice.paid_amount || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1', color: 'error.main' }}>Saldo Pendiente</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1', color: 'error.main' }}>
          {fCurrency(parseFloat(invoice.balance_due || '0'))}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderFooter = (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant="subtitle2">NOTAS</Typography>

        <Typography variant="body2">{invoice.notes || 'Gracias por su compra.'}</Typography>
      </Grid>

      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant="subtitle2">¿Tienes alguna pregunta?</Typography>

        <Typography variant="body2">soporte@ally360.co</Typography>
      </Grid>
    </Grid>
  );

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Box sx={{ overflow: 'auto' }}>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell width={40}>#</TableCell>

              <TableCell sx={{ typography: 'subtitle2' }}>Descripción</TableCell>

              <TableCell>Cant.</TableCell>

              <TableCell align="right">Precio Unit.</TableCell>

              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(invoice.line_items || []).map((row, index) => (
              <TableRow key={row.id || index}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 560 }}>
                    <Typography variant="subtitle2">{row.name}</Typography>

                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      {row.sku}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>{row.quantity}</TableCell>

                <TableCell align="right">{fCurrency(parseFloat(row.unit_price))}</TableCell>

                <TableCell align="right">{fCurrency(parseFloat(row.line_total))}</TableCell>
              </TableRow>
            ))}

            {renderTotal}
          </TableBody>
        </Table>
      </Box>
    </TableContainer>
  );

  return (
    <>
      <InvoiceToolbar
        invoice={invoice}
        currentStatus={currentStatus || ''}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
        onAddPayment={paymentDialog.onTrue}
      />

      <Card sx={{ pt: 5, px: 5 }}>
        <Box
          rowGap={5}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)'
          }}
        >
          <Box component="img" alt="logo" src="/logo/logoFondoTransparentesvg.svg" sx={{ width: 48, height: 48 }} />

          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Label
              variant="soft"
              color={
                (currentStatus === 'PAID' && 'success') ||
                (currentStatus === 'OPEN' && 'warning') ||
                (currentStatus === 'VOID' && 'error') ||
                (currentStatus === 'DRAFT' && 'info') ||
                'default'
              }
            >
              {currentStatus}
            </Label>

            <Typography variant="h6">{invoice.number}</Typography>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Cliente
            </Typography>
            {invoice.customer?.name}
            <br />
            {invoice.customer?.email}
            <br />
            {invoice.customer?.id_type}: {invoice.customer?.id_number}
            <br />
            {invoice.customer?.billing_address?.address}
            <br />
            {invoice.customer?.billing_address?.city}, {invoice.customer?.billing_address?.country}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Fecha de Creación
            </Typography>
            {fDate(invoice.issue_date, 'dd/MM/yyyy')}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Fecha de Vencimiento
            </Typography>
            {fDate(invoice.due_date, 'dd/MM/yyyy')}
          </Stack>
        </Box>

        {renderList}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        {renderFooter}
      </Card>

      {/* Payment History */}
      <Box sx={{ mt: 3 }}>
        <InvoicePaymentHistory invoiceId={invoice.id} />
      </Box>

      {/* Payment Dialog */}
      <InvoicePaymentDialog open={paymentDialog.value} onClose={paymentDialog.onFalse} invoice={invoice} />
    </>
  );
}

InvoiceDetails.propTypes = {
  invoice: PropTypes.object
};
