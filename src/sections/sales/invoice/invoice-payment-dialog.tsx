import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from 'src/utils/format-number';
// redux
import { useAddInvoicePaymentMutation } from 'src/redux/services/salesInvoicesApi';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'check', label: 'Cheque' },
  { value: 'other', label: 'Otro' }
];

// ----------------------------------------------------------------------

export default function InvoicePaymentDialog({ open, onClose, invoice }) {
  const { enqueueSnackbar } = useSnackbar();
  const [addPayment, { isLoading }] = useAddInvoicePaymentMutation();

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      amount: '',
      method: 'cash',
      reference: '',
      payment_date: new Date(),
      notes: ''
    }
  });

  const amountValue = watch('amount');
  const balanceDue = parseFloat(invoice?.balance_due || '0');
  const amountNumber = parseFloat(amountValue) || 0;
  const remainingBalance = balanceDue - amountNumber;

  const onSubmit = async (data) => {
    try {
      // Validar que el monto no sea mayor al saldo pendiente
      if (amountNumber > balanceDue) {
        enqueueSnackbar('El monto del pago no puede ser mayor al saldo pendiente', {
          variant: 'error'
        });
        return;
      }

      // Validar que el monto sea positivo
      if (amountNumber <= 0) {
        enqueueSnackbar('El monto del pago debe ser mayor a cero', { variant: 'error' });
        return;
      }

      await addPayment({
        invoiceId: invoice.id,
        payment: {
          amount: data.amount.toString(),
          method: data.method,
          reference: data.reference || undefined,
          payment_date: data.payment_date.toISOString().split('T')[0],
          notes: data.notes || undefined
        }
      }).unwrap();

      enqueueSnackbar('Pago registrado exitosamente', { variant: 'success' });
      reset();
      onClose();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      enqueueSnackbar('Error al registrar el pago', { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
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
                  if (Number.isNaN(num) || num <= 0) return 'Debe ingresar un monto válido mayor a cero';
                  if (num > balanceDue) return 'El monto no puede exceder el saldo pendiente';
                  return true;
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  label="Monto del pago"
                  type="number"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                />
              )}
            />

            {amountNumber > 0 && remainingBalance >= 0 && (
              <Alert severity={remainingBalance === 0 ? 'success' : 'warning'}>
                Saldo después del pago: <strong>{fCurrency(remainingBalance)}</strong>
                {remainingBalance === 0 && ' - La factura quedará completamente pagada'}
              </Alert>
            )}

            <Controller
              name="method"
              control={control}
              rules={{ required: 'El método de pago es requerido' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  select
                  label="Método de pago"
                  fullWidth
                  required
                  error={!!error}
                  helperText={error?.message}
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
              name="reference"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Referencia de pago" fullWidth placeholder="Ej: Transferencia #123456" />
              )}
            />

            <Controller
              name="payment_date"
              control={control}
              rules={{ required: 'La fecha de pago es requerida' }}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  {...field}
                  label="Fecha de pago"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!error,
                      helperText: error?.message
                    }
                  }}
                />
              )}
            />

            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Notas"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Notas adicionales sobre el pago..."
                />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="inherit" disabled={isLoading}>
            Cancelar
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            Registrar Pago
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}

InvoicePaymentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  invoice: PropTypes.object.isRequired
};
