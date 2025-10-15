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
const getErrorMessage = (backendMessage: string, fieldName: string): string => {
  // Phone number specific errors
  if (fieldName.includes('phone') || fieldName.includes('Phone')) {
    if (backendMessage.toLowerCase().includes('inválido') || backendMessage.toLowerCase().includes('invalid')) {
      return 'Usa un número correcto. Formato válido: +573XXXXXXXXX (móvil) o +571XXXXXXX (fijo)';
    }
  }

  // DNI specific errors
  if (fieldName.includes('dni')) {
    if (backendMessage.toLowerCase().includes('inválido') || backendMessage.toLowerCase().includes('invalid')) {
      return 'Ingresa una cédula válida (entre 6 y 10 dígitos)';
    }
  }

  // Email specific errors
  if (fieldName.includes('email')) {
    if (backendMessage.toLowerCase().includes('inválido') || backendMessage.toLowerCase().includes('invalid')) {
      return 'Ingresa un correo válido con formato usuario@dominio.com';
    }
    if (backendMessage.toLowerCase().includes('exists') || backendMessage.toLowerCase().includes('existe')) {
      return 'Este correo ya está registrado. Usa otro correo o inicia sesión';
    }
  }

  // Name specific errors
  if (fieldName.includes('name')) {
    if (backendMessage.toLowerCase().includes('short') || backendMessage.toLowerCase().includes('corto')) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    if (backendMessage.toLowerCase().includes('long') || backendMessage.toLowerCase().includes('largo')) {
      return 'El nombre debe tener menos de 50 caracteres';
    }
  }

  // Password specific errors
  if (fieldName.includes('password')) {
    if (backendMessage.toLowerCase().includes('short') || backendMessage.toLowerCase().includes('corto')) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (backendMessage.toLowerCase().includes('weak') || backendMessage.toLowerCase().includes('débil')) {
      return 'La contraseña debe contener al menos una letra y un número';
    }
  }

  return backendMessage;
};

export default function JwtRegisterView() {
  const { register } = useAuthContext();
  const router = useRouter();
  const [errorMsg] = useState('');
  const password = useBoolean(false);

  const defaultValues = {
    password: '',
    email: '',
    profile: {
      phone_number: '+57',
      dni: '',
      first_name: '',
      last_name: ''
    }
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
    shouldFocusError: false
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting }
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await register(data);
      enqueueSnackbar('Registro completado. Revisa tu email para verificar tu cuenta.', {
        variant: 'success'
      });

      router.push(paths.auth.jwt.login);
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error?.data?.detail && Array.isArray(error.data.detail)) {
        let hasFieldErrors = false;

        error.data.detail.forEach((validationError: any) => {
          const { loc, msg } = validationError;

          if (loc && Array.isArray(loc) && loc.length >= 2) {
            const fieldPath = loc.slice(1).join('.');

            setError(fieldPath as any, {
              type: 'manual',
              message: getErrorMessage(msg, fieldPath)
            });
            hasFieldErrors = true;
          }
        });

        if (!hasFieldErrors) {
          const firstError = error.data.detail[0];
          enqueueSnackbar(firstError || 'Error en el registro. Verifica los datos e intenta nuevamente.', {
            variant: 'error'
          });
        }
      } else {
        const errorMessage =
          error?.data?.detail?.[0]?.msg ||
          error?.message ||
          error?.data?.detail ||
          'Error en el registro. Verifica los datos e intenta nuevamente.';

        enqueueSnackbar(errorMessage, {
          variant: 'error'
        });
      }
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
      <Typography variant="h4">Registrarse gratis</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> ¿Ya tienes cuenta? </Typography>

        <Link variant="subtitle2" sx={{ cursor: 'pointer' }} onClick={() => router.push(paths.auth.jwt.login)}>
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
          <RHFTextField
            name="profile.first_name"
            label="Nombre"
            autoComplete="given-name"
            placeholder="Ej: Juan Carlos"
          />
          <RHFTextField
            name="profile.last_name"
            label="Apellido"
            autoComplete="family-name"
            placeholder="Ej: García López"
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFPhoneNumber
            name="profile.phone_number"
            label="Teléfono"
            type="string"
            autoComplete="tel"
            defaultCountry="co"
            onlyCountries={['co']}
            countryCodeEditable={false}
            placeholder="Ej: +573001234567"
            fullWidth
          />
          <RHFTextField
            name="profile.dni"
            label="Cédula de ciudadanía"
            autoComplete="cc"
            placeholder="Ej: 1234567890"
            inputProps={{
              maxLength: 10,
              pattern: '[0-9]*'
            }}
          />
        </Stack>

        <RHFTextField
          name="email"
          label="Correo electrónico"
          autoComplete="email"
          placeholder="Ej: juan.garcia@email.com"
        />

        <RHFTextField
          name="password"
          label="Contraseña"
          type={password.value ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres con letras y números"
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
