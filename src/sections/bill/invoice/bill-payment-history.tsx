import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
// api
import { useGetBillPaymentsQuery } from 'src/redux/services/billsApi';
// utils
import { fCurrency } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

const PAYMENT_METHOD_CONFIG = {
  CASH: { label: 'Efectivo', icon: 'solar:wallet-money-bold', color: 'success' },
  TRANSFER: { label: 'Transferencia', icon: 'solar:card-transfer-bold', color: 'info' },
  CARD: { label: 'Tarjeta', icon: 'solar:card-bold', color: 'primary' },
  OTHER: { label: 'Otro', icon: 'solar:money-bag-bold', color: 'default' }
};

// ----------------------------------------------------------------------

export default function BillPaymentHistory({ billId, canAddPayment, onAddPayment }) {
  const { data: payments = [], isLoading } = useGetBillPaymentsQuery(billId);

  if (isLoading) {
    return (
      <Card sx={{ p: 3, mt: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Historial de Pagos
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight={200}
          sx={{ color: 'text.secondary' }}
        >
          <Iconify icon="solar:wallet-money-bold" width={64} sx={{ mb: 2, opacity: 0.5 }} />
          <Typography variant="body2" sx={{ mb: 2 }}>
            No hay pagos registrados
          </Typography>
          {canAddPayment && (
            <Button variant="contained" startIcon={<Iconify icon="solar:wallet-money-bold" />} onClick={onAddPayment}>
              Registrar Primer Pago
            </Button>
          )}
        </Box>
      </Card>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || '0'), 0);

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6">Historial de Pagos</Typography>
          <Chip label={`${payments.length} ${payments.length === 1 ? 'pago' : 'pagos'}`} color="primary" />
        </Stack>
        {canAddPayment && (
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={onAddPayment} size="small">
            Agregar Pago
          </Button>
        )}
      </Stack>

      <TableContainer sx={{ overflow: 'unset' }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Referencia</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>{' '}
          <TableBody>
            {payments.map((payment) => (
              <PaymentTableRow key={payment.id} payment={payment} />
            ))}

            <TableRow>
              <TableCell colSpan={3} />
              <TableCell align="right">
                <Typography variant="subtitle1">Total Pagado:</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle1" color="success.main">
                  {fCurrency(totalPaid)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

BillPaymentHistory.propTypes = {
  billId: PropTypes.string.isRequired,
  canAddPayment: PropTypes.bool,
  onAddPayment: PropTypes.func
};

// ----------------------------------------------------------------------

function PaymentTableRow({ payment }) {
  const { enqueueSnackbar } = useSnackbar();
  const popover = usePopover();
  const confirm = useBoolean(false);

  const methodConfig = PAYMENT_METHOD_CONFIG[payment.method] || PAYMENT_METHOD_CONFIG.OTHER;

  const handleDeletePayment = useCallback(async () => {
    try {
      // TODO: Implement delete payment API call when available
      enqueueSnackbar('Funcionalidad de eliminar pago en desarrollo', { variant: 'info' });
      confirm.onFalse();
    } catch (error) {
      console.error('Error deleting payment:', error);
      enqueueSnackbar('Error al eliminar el pago', { variant: 'error' });
    }
  }, [enqueueSnackbar, confirm]);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <Typography variant="body2">{fDate(payment.payment_date, 'dd/MM/yyyy')}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {fDate(payment.created_at, 'dd/MM/yyyy HH:mm')}
          </Typography>
        </TableCell>

        <TableCell>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon={methodConfig.icon} width={20} />
            <Chip label={methodConfig.label} size="small" color={methodConfig.color as any} />
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {payment.reference || '-'}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Typography variant="subtitle2">{fCurrency(parseFloat(payment.amount))}</Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {payment.notes || '-'}
          </Typography>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 160 }}>
        <MenuItem
          onClick={() => {
            enqueueSnackbar('Funcionalidad de ver detalles en desarrollo', { variant: 'info' });
            popover.onClose();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Ver Detalles
        </MenuItem>

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Eliminar
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar Pago"
        content="¿Está seguro de que desea eliminar este pago? Esta acción no se puede deshacer."
        action={
          <Button variant="contained" color="error" onClick={handleDeletePayment}>
            Eliminar
          </Button>
        }
      />
    </>
  );
}

PaymentTableRow.propTypes = {
  payment: PropTypes.object.isRequired
};

BillPaymentHistory.propTypes = {
  billId: PropTypes.string.isRequired,
  canAddPayment: PropTypes.bool,
  onAddPayment: PropTypes.func
};
