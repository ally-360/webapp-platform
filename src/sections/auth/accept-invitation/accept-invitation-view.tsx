import * as Yup from 'yup';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSearchParams, useNavigate } from 'react-router-dom';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
// api
import {
  useAcceptInvitationMutation,
  useGetInvitationInfoQuery,
  useAcceptExistingInvitationMutation
} from 'src/redux/services/userProfileApi';

// ----------------------------------------------------------------------

interface AcceptInvitationFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dni: string;
  password: string;
  confirmPassword: string;
}

export default function AcceptInvitationView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const password = useBoolean(false);
  const confirmPassword = useBoolean(false);
  const { user } = useAuthContext();

  const [token, setToken] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: invitationInfo,
    isLoading: loadingInvitation,
    error: invitationError
  } = useGetInvitationInfoQuery(token!, { skip: !token });

  const [acceptInvitation, { isLoading: acceptingInvitation, error: acceptError }] = useAcceptInvitationMutation();
  const [acceptExistingInvitation, { isLoading: acceptingExisting, error: acceptExistingError }] =
    useAcceptExistingInvitationMutation();

  useEffect(() => {
    const invitationToken = searchParams.get('token');
    if (invitationToken) {
      setToken(invitationToken);
    }
  }, [searchParams]);

  // Schema para usuario nuevo
  const AcceptInvitationSchema = Yup.object().shape({
    firstName: Yup.string().required('Nombre es requerido'),
    lastName: Yup.string().required('Apellido es requerido'),
    phoneNumber: Yup.string().required('Teléfono es requerido'),
    dni: Yup.string().required('DNI es requerido'),
    password: Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('Contraseña es requerida'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
      .required('Confirmar contraseña es requerido')
  });

  const defaultValues: AcceptInvitationFormData = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dni: '',
    password: '',
    confirmPassword: ''
  };

  const methods = useForm<AcceptInvitationFormData>({
    resolver: yupResolver(AcceptInvitationSchema),
    defaultValues
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // Handle existing user accepting invitation
  const handleExistingUserAccept = async () => {
    if (!token) return;

    try {
      await acceptExistingInvitation({ token }).unwrap();
      navigate(paths.dashboard.root);
    } catch (err) {
      console.error('Error accepting invitation:', err);
    }
  };

  // Handle new user registration + invitation acceptance
  const onSubmit = handleSubmit(async (data) => {
    if (!token) {
      alert('Token de invitación no válido');
      return;
    }

    try {
      const requestData = {
        token,
        password: data.password,
        profile: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          dni: data.dni
        }
      };

      await acceptInvitation(requestData).unwrap();

      // Redirigir al login después de aceptar la invitación
      navigate(`${paths.auth.jwt.login}?invitation=accepted`);
    } catch (err) {
      console.error('Error accepting invitation:', err);
    }
  });

  // Loading state
  if (loadingInvitation) {
    return (
      <Container maxWidth="sm">
        <Card sx={{ mt: 10, p: 3, textAlign: 'center' }}>
          <Typography>Cargando información de la invitación...</Typography>
        </Card>
      </Container>
    );
  }

  // Error or invalid token
  if (!token || invitationError || !invitationInfo) {
    return (
      <Container maxWidth="sm">
        <Card sx={{ mt: 10, p: 3 }}>
          <Alert severity="error">Token de invitación no válido o expirado.</Alert>
          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(paths.auth.jwt.login)}
            >
              Volver al Login
            </Typography>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Case 1: User exists and is authenticated
  if (invitationInfo.user_exists && user) {
    return (
      <Container maxWidth="sm">
        <Card sx={{ mt: 5, p: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Stack spacing={3}>
              <Typography variant="h4">Invitación a {invitationInfo.company_name}</Typography>
              <Typography variant="body1" color="text.secondary">
                Has sido invitado como <strong>{invitationInfo.role}</strong> a unirte a{' '}
                <strong>{invitationInfo.company_name}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ya tienes una cuenta activa. ¿Deseas aceptar esta invitación?
              </Typography>

              {!!acceptExistingError && (
                <Alert severity="error">
                  {(acceptExistingError as any)?.data?.message || 'Error al aceptar la invitación'}
                </Alert>
              )}

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button variant="outlined" onClick={() => navigate(paths.dashboard.root)}>
                  Cancelar
                </Button>
                <LoadingButton variant="contained" loading={acceptingExisting} onClick={handleExistingUserAccept}>
                  Aceptar Invitación
                </LoadingButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Case 2: User exists but is not authenticated
  if (invitationInfo.user_exists && !user) {
    return (
      <Container maxWidth="sm">
        <Card sx={{ mt: 5, p: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Stack spacing={3}>
              <Typography variant="h4">Invitación a {invitationInfo.company_name}</Typography>
              <Typography variant="body1" color="text.secondary">
                Ya tienes una cuenta registrada con el email <strong>{invitationInfo.invitee_email}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por favor, inicia sesión para aceptar la invitación a <strong>{invitationInfo.company_name}</strong>
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`${paths.auth.jwt.login}?returnTo=/accept-invitation?token=${token}`)}
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Case 3: New user needs to register
  return (
    <Container maxWidth="sm">
      <Card sx={{ mt: 5, p: 3 }}>
        <CardContent>
          <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
            <Typography variant="h4">Únete a {invitationInfo.company_name}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Has sido invitado como <strong>{invitationInfo.role}</strong>. Completa tu información para crear tu
              cuenta.
            </Typography>
          </Stack>

          {!!acceptError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {(acceptError as any)?.data?.message || 'Error al aceptar la invitación'}
            </Alert>
          )}

          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RHFTextField name="firstName" label="Nombre" />
                <RHFTextField name="lastName" label="Apellido" />
              </Stack>

              <RHFTextField name="dni" label="DNI / Cédula" />

              <RHFPhoneNumber
                type="string"
                name="phoneNumber"
                label="Teléfono"
                placeholder="Ej: 300 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}
                onlyCountries={['co']}
              />

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

              <RHFTextField
                name="confirmPassword"
                label="Confirmar Contraseña"
                type={confirmPassword.value ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={confirmPassword.onToggle} edge="end">
                        <Iconify icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <LoadingButton
                fullWidth
                color="inherit"
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting || acceptingInvitation}
                sx={{ mt: 3 }}
              >
                Crear Cuenta y Aceptar Invitación
              </LoadingButton>
            </Stack>
          </FormProvider>

          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Typography
              variant="subtitle2"
              color="primary"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(paths.auth.jwt.login)}
            >
              ¿Ya tienes una cuenta? Iniciar sesión
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
