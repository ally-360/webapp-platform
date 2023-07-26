import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
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
import { RouterLink } from 'src/routes/components';
import { useSearchParams, useRouter } from 'src/routes/hook';
// config
import { PATH_AFTER_LOGIN } from 'src/config-global';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { enqueueSnackbar } from 'notistack';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const { register } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const RegisterSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(3, 'Ingrese un nombre valido')
      .max(50, 'Ingrese un nombre valido')
      .required('Ingrese el nombre'),
    lastName: Yup.string()
      .min(3, 'Ingrese un apellido valido')
      .max(50, 'Ingrese un apellido más corto')
      .required('Ingrese el apellido'),
    email: Yup.string().email('Ingrese un correo valido').required('Correo es requerido'),
    password: Yup.string().required('La contraseña es requerida'),
    tel: Yup.string(),
    dni: Yup.string()
      .min(10, 'Ingrese un número de Cédula de ciudadanía')
      .max(10, 'Ingrese un número de Cédula de ciudadanía')
      .required('Ingrese un número de Cédula de ciudadanía')
  });

  const defaultValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    tel: '',
    dni: ''
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register?.(data.email, data.password, data.firstName, data.lastName, data.tel, data.dni);
      router.push(returnTo || PATH_AFTER_LOGIN);
      enqueueSnackbar('Registro del usuario completado', {
        variant: 'success'
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar(`Error al registrar el usuario ${error.message}`, {
        variant: 'error'
      });
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Registrarse gratis</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> ¿Ya tienes cuenta? </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
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
          <RHFTextField name="firstName" label="Nombre" />
          <RHFTextField name="lastName" label="Apellido" />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFPhoneNumber
            name="tel"
            label="Teléfono"
            fullWidth
            type="string"
            variant="outlined"
            placeholder="Ej:3001234567"
            defaultCountry="co"
            countryCodeEditable={false}
            onlyCountries={['co']}
          />
          <RHFTextField name="dni" label="Cédula de ciudadania" />
        </Stack>

        <RHFTextField name="email" label="Correo electrónico" />

        <RHFTextField
          name="password"
          label="Contraseña"
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
