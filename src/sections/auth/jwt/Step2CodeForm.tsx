import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Typography, Link } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSnackbar } from 'notistack';
import FormProvider, { RHFCode } from 'src/components/hook-form';
import { useRequestPasswordResetMutation } from 'src/redux/services/authApi';
import EmailInboxIcon from 'src/assets/icons/email-inbox-icon';
import AuthFormHead from './components/AuthFormHead';
import BackToLoginLink from './components/BackToLoginLink';

interface Step2Props {
  email: string;
  onSuccess(code: string): void;
}

const schema = Yup.object({
  code: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required')
});

export default function Step2CodeForm({ email, onSuccess }: Step2Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [requestPasswordReset, { isLoading: isResending }] = useRequestPasswordResetMutation();
  
  const methods = useForm({ resolver: yupResolver(schema), defaultValues: { code: '' } });
  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async ({ code }) => {
    console.info('Step 2:', code, 'Email:', email);
    onSuccess(code);
  });

  const handleResend = async () => {
    try {
      await requestPasswordReset({ email }).unwrap();
      enqueueSnackbar('Código reenviado exitosamente', { variant: 'success' });
    } catch (error: any) {
      console.error('Error al reenviar código:', error);
      enqueueSnackbar(
        error?.data?.detail || 'Error al reenviar el código. Por favor, intenta nuevamente.',
        { variant: 'error' }
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <AuthFormHead
        icon={<EmailInboxIcon sx={{ height: 96 }} />}
        title="Validación de código"
        description="Ingresa el código de 6 dígitos que hemos enviado a tu correo electrónico."
      />
      <Stack spacing={3} alignItems="center">
        <RHFCode name="code" />
        <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Verificar código
        </LoadingButton>
        <Typography variant="body2">
          ¿No has recibido el código?{' '}
          <Link 
            variant="subtitle2" 
            sx={{ cursor: 'pointer' }} 
            onClick={handleResend}
            component="button"
            disabled={isResending}
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </Link>
        </Typography>
        <BackToLoginLink />
      </Stack>
    </FormProvider>
  );
}
