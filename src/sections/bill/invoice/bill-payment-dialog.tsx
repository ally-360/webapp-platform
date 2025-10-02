import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import { useMemo } from 'react';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
// date pickers
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// hooks
import { useSnackbar } from 'src/components/snackbar';
// api
import { useAddBillPaymentMutation } from 'src/redux/services/billsApi';
// utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'check', label: 'Cheque' },
  { value: 'other', label: 'Otro' }
];

// ----------------------------------------------------------------------

export default function BillPaymentDialog({ open, onClose, bill }) {
  const { enqueueSnackbar } = useSnackbar();
  const [addPayment, { isLoading }] = useAddBillPaymentMutation();

  const balanceDue = useMemo(
    () => parseFloat(bill?.total_amount || '0') - parseFloat(bill?.paid_amount || '0'),
    [bill?.total_amount, bill?.paid_amount]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      amount: '',
      payment_date: new Date(),
      payment_method: 'cash',
      notes: ''
    }
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const amount = parseFloat(data.amount);

      if (amount <= 0) {
        enqueueSnackbar('El monto debe ser mayor a 0', { variant: 'error' });
        return;
      }

      if (amount > balanceDue) {
        enqueueSnackbar(`El monto no puede exceder el saldo pendiente (${fCurrency(balanceDue)})`, {
          variant: 'error'
        });
        return;
      }

      await addPayment({
        billId: bill.id,
        payment: {
          amount,
          payment_date: data.payment_date.toISOString().split('T')[0],
          payment_method: data.payment_method as 'cash' | 'transfer' | 'card' | 'check' | 'other',
          notes: data.notes || undefined
        }
      }).unwrap();

      enqueueSnackbar('Pago registrado exitosamente', { variant: 'success' });
      reset();
      onClose();
    } catch (error) {
      console.error('Error adding payment:', error);
      enqueueSnackbar('Error al registrar el pago', { variant: 'error' });
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Registrar Pago</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Alert severity="info">
            Saldo pendiente: <strong>{fCurrency(balanceDue)}</strong>
          </Alert>

          <Controller
            name="amount"
            control={control}
            rules={{
              required: 'El monto es requerido',
              validate: (value) => {
                const num = parseFloat(value);
                if (Number.isNaN(num) || num <= 0) return 'Ingrese un monto válido';
                if (num > balanceDue) return `No puede exceder ${fCurrency(balanceDue)}`;
                return true;
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Monto"
                type="number"
                fullWidth
                error={!!errors.amount}
                helperText={errors.amount?.message}
                inputProps={{ step: '0.01', min: '0' }}
              />
            )}
          />

          <Controller
            name="payment_date"
            control={control}
            rules={{ required: 'La fecha es requerida' }}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Fecha de Pago"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.payment_date,
                    helperText: errors.payment_date?.message
                  }
                }}
              />
            )}
          />

          <Controller
            name="payment_method"
            control={control}
            rules={{ required: 'El método de pago es requerido' }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Método de Pago"
                fullWidth
                error={!!errors.payment_method}
                helperText={errors.payment_method?.message}
              >
                {PAYMENT_METHODS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="notes"
            control={control}
            render={({ field }) => <TextField {...field} label="Notas (opcional)" multiline rows={3} fullWidth />}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <LoadingButton onClick={handleClose} disabled={isLoading}>
          Cancelar
        </LoadingButton>
        <LoadingButton variant="contained" onClick={onSubmit} loading={isLoading}>
          Registrar Pago
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

BillPaymentDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  bill: PropTypes.object
};
