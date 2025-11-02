import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// hooks
import { useRouter } from 'src/routes/hook';
// routes
import { paths } from 'src/routes/paths';
// api
import { useVerifyEmailWithAutoLoginMutation } from 'src/redux/services/authApi';
// components
import Iconify from 'src/components/iconify';
import Logo from 'src/components/logo';
import { useAppDispatch } from 'src/hooks/store';
import { setSession } from 'src/auth/context/jwt/utils';
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function EmailVerificationView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const [verificationState, setVerificationState] = useState<{
    loading: boolean;
    success: boolean;
    autoLogin: boolean;
    error: string | null;
  }>({
    loading: true,
    success: false,
    autoLogin: false,
    error: null
  });

  // Obtener parámetros de la URL
  const token = searchParams.get('token');

  const [verifyEmailMutation] = useVerifyEmailWithAutoLoginMutation();

  // Verificar email automáticamente al cargar el componente
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState({
          loading: false,
          success: false,
          autoLogin: false,
          error: 'Token de verificación no encontrado'
        });
        return;
      }

      try {
        const result = await verifyEmailMutation({
          token,
          auto_login: true // Siempre intentamos auto-login
        }).unwrap();

        console.log('✅ Verificación exitosa:', result);

        if (result.access_token && result.user_id) {
          setSession(result.access_token);

          setVerificationState({
            loading: false,
            success: true,
            autoLogin: true,
            error: null
          });

          enqueueSnackbar('Email verificado', { variant: 'success' });

          setTimeout(() => {
            if (result.companies && result.companies.length > 0) {
              router.push(paths.dashboard.root);
            } else {
              router.push(paths.stepByStep.root);
            }
          }, 8000);
        } else {
          setVerificationState({
            loading: false,
            success: true,
            autoLogin: false,
            error: null
          });

          enqueueSnackbar('Email verificado exitosamente. Por favor, inicia sesión.', { variant: 'success' });
        }
      } catch (error: any) {
        const errorMessage = error?.data?.detail || error?.message || 'Error verificando email';

        setVerificationState({
          loading: false,
          success: false,
          autoLogin: false,
          error: errorMessage
        });

        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    };

    verifyEmail();
  }, [token, verifyEmailMutation, dispatch, router]);

  const handleGoToLogin = () => {
    router.push(paths.auth.jwt.login);
  };

  const handleGoToDashboard = () => {
    router.push(paths.dashboard.root);
  };

  const renderLoading = (
    <Stack spacing={3} alignItems="center">
      <CircularProgress size={64} />
      <Typography variant="h6">Verificando email...</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Por favor espera mientras verificamos tu dirección de correo electrónico.
      </Typography>
    </Stack>
  );

  const renderSuccess = (
    <Stack spacing={3} alignItems="center">
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'success.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Iconify icon="solar:check-circle-bold" width={48} sx={{ color: 'success.main' }} />
      </Box>

      <Typography variant="h5" textAlign="center">
        {verificationState.autoLogin ? '¡Email verificado e ingreso completado!' : '¡Email verificado exitosamente!'}
      </Typography>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        {verificationState.autoLogin
          ? 'Tu cuenta ha sido verificada y has ingresado automáticamente. Te redirigiremos en un momento.'
          : 'Tu dirección de correo electrónico ha sido verificada. Ya puedes iniciar sesión con tu cuenta.'}
      </Typography>

      {!verificationState.autoLogin && (
        <Button
          variant="contained"
          size="large"
          onClick={handleGoToLogin}
          startIcon={<Iconify icon="solar:login-2-bold" />}
          fullWidth
        >
          Iniciar Sesión
        </Button>
      )}

      {verificationState.autoLogin && (
        <Button
          variant="contained"
          size="large"
          onClick={handleGoToDashboard}
          startIcon={<Iconify icon="solar:home-bold" />}
          fullWidth
        >
          Ir al Dashboard
        </Button>
      )}
    </Stack>
  );

  const renderError = (
    <Stack spacing={3} alignItems="center">
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'error.lighter',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Iconify icon="solar:close-circle-bold" width={48} sx={{ color: 'error.main' }} />
      </Box>

      <Typography variant="h5" textAlign="center">
        Error en la verificación
      </Typography>

      <Alert severity="error" sx={{ width: '100%' }}>
        {verificationState.error}
      </Alert>

      <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
        <Button
          variant="outlined"
          onClick={handleGoToLogin}
          startIcon={<Iconify icon="solar:login-2-bold" />}
          fullWidth
        >
          Ir al Login
        </Button>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          startIcon={<Iconify icon="solar:refresh-bold" />}
          fullWidth
        >
          Intentar de nuevo
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 3
        }}
      >
        <Card
          sx={{
            p: 5,
            width: '100%',
            maxWidth: 480,
            textAlign: 'center'
          }}
        >
          <Stack spacing={3} alignItems="center">
            {/* Logo */}
            <Logo sx={{ width: 64, height: 64 }} />

            {/* Título */}
            <Typography variant="h4">Verificación de Email</Typography>

            {/* Estados */}
            {verificationState.loading && renderLoading}
            {!verificationState.loading && verificationState.success && renderSuccess}
            {!verificationState.loading && !verificationState.success && renderError}
          </Stack>
        </Card>
      </Box>
    </Container>
  );
}
