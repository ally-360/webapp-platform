import { useCallback } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// redux
import { useVoidPaymentMutation } from 'src/redux/services/paymentsReceivedApi';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  paymentId: string;
};

// ----------------------------------------------------------------------

export default function VoidPaymentDialog({ open, onClose, paymentId }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [voidPayment, { isLoading }] = useVoidPaymentMutation();

  const VoidSchema = Yup.object().shape({
    reason: Yup.string().required('El motivo de anulación es obligatorio').min(10, 'Mínimo 10 caracteres')
  });

  const methods = useForm({
    resolver: yupResolver(VoidSchema),
    defaultValues: {
      reason: ''
    }
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await voidPayment({
        id: paymentId,
        data: { reason: data.reason }
      }).unwrap();

      enqueueSnackbar('Pago anulado exitosamente', { variant: 'success' });
      reset();
      onClose();
    } catch (error) {
      console.error('Error al anular pago:', error);
      enqueueSnackbar(error?.data?.detail || 'Error al anular el pago', { variant: 'error' });
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Anular Pago</DialogTitle>

        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Esta acción recalculará el estado de las facturas asociadas. El pago no podrá ser revertido, solo eliminado.
          </Alert>

          <RHFTextField
            name="reason"
            label="Motivo de Anulación *"
            multiline
            rows={4}
            placeholder="Describa el motivo de la anulación del pago..."
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <LoadingButton type="submit" variant="contained" color="warning" loading={isLoading}>
            Anular Pago
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
