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
import LoadingButton from '@mui/lab/LoadingButton';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// redux
import { useSendPaymentEmailMutation } from 'src/redux/services/paymentsReceivedApi';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  paymentId: string;
  customerEmail?: string;
};

// ----------------------------------------------------------------------

export default function SendEmailDialog({ open, onClose, paymentId, customerEmail }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [sendEmail, { isLoading }] = useSendPaymentEmailMutation();

  const EmailSchema = Yup.object().shape({
    email: Yup.string().email('Email inválido').required('Email es obligatorio'),
    subject: Yup.string().required('Asunto es obligatorio'),
    message: Yup.string()
  });

  const methods = useForm({
    resolver: yupResolver(EmailSchema),
    defaultValues: {
      email: customerEmail || '',
      subject: 'Recibo de Pago',
      message: 'Adjuntamos el recibo de pago correspondiente a su solicitud.'
    }
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await sendEmail({
        id: paymentId,
        data: {
          email: data.email,
          subject: data.subject,
          message: data.message
        }
      }).unwrap();

      enqueueSnackbar('Email enviado exitosamente', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error al enviar email:', error);
      enqueueSnackbar(error?.data?.detail || 'Error al enviar el email', { variant: 'error' });
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Enviar Recibo por Email</DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <RHFTextField name="email" label="Email Destino *" placeholder="cliente@example.com" type="email" />

          <RHFTextField name="subject" label="Asunto *" placeholder="Recibo de Pago" />

          <RHFTextField
            name="message"
            label="Mensaje"
            multiline
            rows={4}
            placeholder="Mensaje adicional para el cliente..."
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isLoading}>
            Enviar Email
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
