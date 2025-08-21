import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useSearchParams, useRouter } from 'src/routes/hook';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { Box } from '@mui/material';
import { AuthCredentials } from 'src/interfaces/auth/userInterfaces';
import { LoginSchema } from 'src/interfaces/auth/yupSchemas';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const { t } = useTranslation();

  const [errorMsg, setErrorMsg] = useState<string>('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const viewPassword = useBoolean(false); // Pass a default value of false to useBoolean

  const defaultValues: AuthCredentials = {
    email: 'example@gmail.com',
    password: 'Example123.'
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data: AuthCredentials) => {
    const { email, password } = data;
    try {
      await login({ email, password });
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error: unknown) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : (error as Error).message);
    }
  });

  const renderHead = (
    <Stack spacing={0} sx={{ mb: 5}}>
      <Typography variant="h4">¡Hola de nuevo!</Typography>

      <Stack direction="row">
        <Typography variant="body2">Accede a tu empresa</Typography>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{t(errorMsg)}</Alert>}

      <RHFTextField name="email" label="Correo Electrónico" />
      <RHFTextField
        name="password"
        label="Contraseña"
        color="primary"
        type={viewPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={viewPassword.onToggle} edge="end">
                <Iconify icon={viewPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      <Link
        variant="body2"
        color="inherit"
        underline="always"
        component={RouterLink}
        href={paths.auth.jwt.forgotPassword}
        sx={{ alignSelf: 'flex-end' }}
      >
        ¿Olvidaste tu contraseña?
      </Link>

      <LoadingButton fullWidth color="primary" size="large" type="submit" variant="contained" loading={isSubmitting}>
        Iniciar Sesión
      </LoadingButton>
      <Box width="smUp">
        <Typography variant="body2" align="center">
          ¿No tienes una cuenta?&nbsp;
          <Link variant="subtitle2" component={RouterLink} href={paths.auth.jwt.register}>
            Registrate
          </Link>
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}
      {renderForm}
    </FormProvider>
  );
}
