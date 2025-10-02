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
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
//
import BillToolbar from './bill-toolbar';
import BillPaymentDialog from './bill-payment-dialog';
import BillPaymentHistory from './bill-payment-history';

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

export default function BillDetails({ bill }) {
  const [currentStatus, setCurrentStatus] = useState(bill?.status?.toLowerCase() || 'draft');
  const paymentDialog = useBoolean(false);

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);

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
          {fCurrency(parseFloat(bill?.subtotal || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Impuestos</TableCell>
        <TableCell width={120}>{fCurrency(parseFloat(bill?.taxes_total || '0'))}</TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Pagado</TableCell>
        <TableCell width={120} sx={{ color: 'success.main', typography: 'body2' }}>
          {fCurrency(parseFloat(bill?.paid_amount || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Saldo Pendiente</TableCell>
        <TableCell width={120} sx={{ color: 'warning.main', typography: 'body2' }}>
          {fCurrency(parseFloat(bill?.total_amount || '0') - parseFloat(bill?.paid_amount || '0'))}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(parseFloat(bill?.total_amount || '0'))}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderFooter = (
    <Grid container>
      <Grid xs={12} md={9} sx={{ py: 3 }}>
        <Typography variant="subtitle2">NOTAS</Typography>

        <Typography variant="body2">{bill?.notes || 'Sin notas adicionales'}</Typography>
      </Grid>

      <Grid xs={12} md={3} sx={{ py: 3, textAlign: 'right' }}>
        <Typography variant="subtitle2">¿Alguna pregunta?</Typography>

        <Typography variant="body2">support@ally360.co</Typography>
      </Grid>
    </Grid>
  );

  const renderList = (
    <TableContainer sx={{ overflow: 'unset', mt: 5 }}>
      <Table sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <TableCell width={40}>#</TableCell>

            <TableCell sx={{ typography: 'subtitle2' }}>Producto</TableCell>

            <TableCell>Cantidad</TableCell>

            <TableCell align="right">Precio Unit.</TableCell>

            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {bill?.line_items?.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="subtitle2">{item.name || `Producto ${index + 1}`}</Typography>

                  {item.product_id && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                      ID: {item.product_id}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>{Math.round(parseFloat(item.quantity || '0'))}</TableCell>

              <TableCell align="right">{fCurrency(parseFloat(item.unit_price || '0'))}</TableCell>

              <TableCell align="right">{fCurrency(parseFloat(item.line_total || '0'))}</TableCell>
            </TableRow>
          ))}

          {renderTotal}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const STATUS_OPTIONS = [
    { value: 'draft', label: 'Borrador' },
    { value: 'open', label: 'Abierta' },
    { value: 'partial', label: 'Parcial' },
    { value: 'paid', label: 'Pagada' },
    { value: 'void', label: 'Anulada' }
  ];

  return (
    <>
      <BillToolbar
        invoice={bill}
        currentStatus={currentStatus}
        onChangeStatus={handleChangeStatus}
        statusOptions={STATUS_OPTIONS}
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
                (currentStatus === 'paid' && 'success') ||
                (currentStatus === 'open' && 'info') ||
                (currentStatus === 'partial' && 'warning') ||
                (currentStatus === 'draft' && 'warning') ||
                (currentStatus === 'void' && 'error') ||
                'default'
              }
            >
              {currentStatus === 'paid' && 'Pagada'}
              {currentStatus === 'open' && 'Abierta'}
              {currentStatus === 'partial' && 'Parcial'}
              {currentStatus === 'draft' && 'Borrador'}
              {currentStatus === 'void' && 'Anulada'}
            </Label>

            <Typography variant="h6">{bill?.number || 'N/A'}</Typography>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Factura de
            </Typography>
            Mi Empresa
            <br />
            {/* Aquí puedes agregar más info de la empresa si está disponible */}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Proveedor
            </Typography>
            {bill?.supplier?.name || 'Sin proveedor'}
            <br />
            {bill?.supplier?.id_number && (
              <>
                {bill.supplier.id_type}: {bill.supplier.id_number}
                <br />
              </>
            )}
            {bill?.supplier?.email && (
              <>
                {bill.supplier.email}
                <br />
              </>
            )}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Fecha de Emisión
            </Typography>
            {fDate(bill?.issue_date, 'dd/MM/yyyy')}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Fecha de Vencimiento
            </Typography>
            {fDate(bill?.due_date, 'dd/MM/yyyy')}
          </Stack>
        </Box>

        {renderList}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        {renderFooter}
      </Card>

      {/* Payment History */}
      {bill?.id && <BillPaymentHistory billId={bill.id} />}

      {/* Payment Dialog */}
      <BillPaymentDialog open={paymentDialog.value} onClose={paymentDialog.onFalse} bill={bill} />
    </>
  );
}

BillDetails.propTypes = {
  bill: PropTypes.object
};
