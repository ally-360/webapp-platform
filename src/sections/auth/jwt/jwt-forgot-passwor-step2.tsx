import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
// assets
import { SentIcon } from 'src/assets/icons';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFCode } from 'src/components/hook-form';

// ----------------------------------------------------------------------

interface SendCodeResetPasswordProps {
  email: string;
  setCode?: (code: string) => void;
  setStep?: (step: number) => void;
}

export default function SendCodeResetPassword({ email, setCode, setStep }: SendCodeResetPasswordProps) {
  const NewPasswordSchema = Yup.object().shape({
    code: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required')
  });

  const defaultValues = {
    code: '',
    email
  };

  const methods = useForm({
    resolver: yupResolver(NewPasswordSchema),
    defaultValues
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (setCode) {
        setCode(data.code);
      }
      if (setStep) {
        setStep(3);
      }
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFCode name="code" />

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Verificar codigo
      </LoadingButton>

      <Typography variant="body2">
        {`No has recibido el codigo? `}
        <Link
          variant="subtitle2"
          sx={{
            cursor: 'pointer'
          }}
        >
          Volver a enviar codigo
        </Link>
      </Typography>

      <Link
        component={RouterLink}
        href={paths.auth.jwt.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex'
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Volver al inicio de sesión
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Validación de código</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Ingresa el código de 6 dígitos que hemos enviado a tu correo electrónico.
        </Typography>
      </Stack>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
