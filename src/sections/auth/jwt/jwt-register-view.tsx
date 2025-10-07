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
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { enqueueSnackbar } from 'notistack';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import { RegisterSchema } from 'src/interfaces/auth/yupSchemas';
// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { register } = useAuthContext();

  const router = useRouter();

  const [errorMsg, _setErrorMsg] = useState('');

  const password = useBoolean(false); // Pass a default value of false to useBoolean

  const defaultValues = {
    password: '',
    email: '',
    profile: {
      personalPhoneNumber: '',
      dni: '',
      name: '',
      lastname: '',
      photo: 'https://i.pravatar.cc/300'
    }
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
    shouldFocusError: false
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register(data);
      // Después del registro exitoso, mostrar mensaje y redirigir a página de información
      enqueueSnackbar('Registro completado. Revisa tu email para verificar tu cuenta.', {
        variant: 'success'
      });

      // Redirigir a una página informativa sobre verificación de email
      router.push(paths.auth.jwt.login);
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(`${error.data.detail[0].msg}`, {
        variant: 'error'
      });
      // reset();
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Registrarse gratis</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> ¿Ya tienes cuenta? </Typography>

        <Link
          variant="subtitle2"
          href={paths.auth.jwt.login}
          sx={{ cursor: 'pointer' }}
          onClick={() => router.push(paths.auth.jwt.login)}
        >
          Iniciar sesión
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography component="div" sx={{ color: 'text.secondary', mt: 2.5, typography: 'caption', textAlign: 'center' }}>
      Al registrarte, aceptas nuestros{' '}
      <Link underline="always" color="text.primary">
        Terminos y condiciones
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Política de privacidad
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5}>
        {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField name="profile.name" label="Nombre" autoComplete="given-name" />
          <RHFTextField name="profile.lastname" label="Apellido" autoComplete="family-name" />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFPhoneNumber
            name="profile.personalPhoneNumber"
            label="Teléfono"
            type="string"
            autoComplete="tel"
            defaultCountry="co"
            onlyCountries={['co']}
            countryCodeEditable={false}
          />
          <RHFTextField name="profile.dni" label="Cédula de ciudadania" autoComplete="cc" />
        </Stack>

        <RHFTextField name="email" label="Correo electrónico" autoComplete="email" />

        <RHFTextField
          name="password"
          label="Contraseña"
          type={password.value ? 'text' : 'password'}
          autoComplete="new-password"
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

        <LoadingButton color="primary" fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
          Registrarse
        </LoadingButton>
      </Stack>
    </FormProvider>
  );

  return (
    <>
      {renderHead}

      {renderForm}

      {renderTerms}
    </>
  );
}
