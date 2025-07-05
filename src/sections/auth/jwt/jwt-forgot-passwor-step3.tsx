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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { useBoolean } from 'src/hooks/use-boolean';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

interface ResetPasswordForm {
  email: string;
  code: string;
  setStep?: (step: number) => void;
}

export function ResetPasswordForm({ email, code, setStep }: ResetPasswordForm) {
  const password = useBoolean(false);

  const NewPasswordSchema = Yup.object().shape({
    code: Yup.string().min(6, 'Code must be at least 6 characters').required('Code is required')
  });

  const defaultValues = {
    code,
    email,
    password: '',
    confirmPassword: ''
  };

  const methods = useForm({
    mode: 'onChange',
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
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField
        name="password"
        label="Contraseña Nueva"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <RHFTextField
        name="confirmPassword"
        label="Confirmar Nueva Contraseña"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
        Restablecer contraseña
        <Iconify icon="eva:arrow-ios-forward-fill" />
      </LoadingButton>

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
        Volver a iniciar sesión
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ my: 5 }}>
        <Typography variant="h3">Restablecer contraseña</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Ingresa una nueva contraseña para tu cuenta de {email}. Asegúrate de que sea segura y fácil de recordar.
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
