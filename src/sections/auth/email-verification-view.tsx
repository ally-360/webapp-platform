import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Card, Container, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';

import { useVerifyEmailMutation } from 'src/redux/services/authApi';
import { paths } from 'src/routes/paths';
import Logo from 'src/components/logo';

// ========================================
// 🎯 EMAIL VERIFICATION VIEW
// ========================================

export default function EmailVerificationView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyEmail] = useVerifyEmailMutation();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado en la URL');
        return;
      }

      try {
        console.log('🔐 Verifying email with token:', token);

        const result = await verifyEmail({ token }).unwrap();
        console.log('✅ Email verification successful:', result);

        setStatus('success');
        setMessage(result.message || 'Email verificado exitosamente');

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate(paths.auth.jwt.login, { replace: true });
        }, 3000);
      } catch (error: any) {
        console.error('❌ Email verification error:', error);
        setStatus('error');
        setMessage(
          error?.data?.detail || error?.message || 'Error al verificar el email. El token puede haber expirado.'
        );
      }
    };

    handleVerification();
  }, [token, verifyEmail, navigate]);

  const handleGoToLogin = () => {
    navigate(paths.auth.jwt.login, { replace: true });
  };

  const handleGoToRegister = () => {
    navigate(paths.auth.jwt.register, { replace: true });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3
        }}
      >
        <Card
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 480,
            textAlign: 'center'
          }}
        >
          <Stack spacing={3} alignItems="center">
            {/* Logo */}
            <Logo sx={{ width: 64, height: 64 }} />

            {/* Título */}
            <Typography variant="h4" gutterBottom>
              Verificación de Email
            </Typography>

            {/* Estado de carga */}
            {status === 'loading' && (
              <>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary">
                  Verificando tu cuenta...
                </Typography>
              </>
            )}

            {/* Estado de éxito */}
            {status === 'success' && (
              <>
                <Alert severity="success" sx={{ width: '100%' }}>
                  {message}
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Serás redirigido al login en unos segundos...
                </Typography>
                <Button variant="contained" size="large" onClick={handleGoToLogin} fullWidth>
                  Ir al Login
                </Button>
              </>
            )}

            {/* Estado de error */}
            {status === 'error' && (
              <>
                <Alert severity="error" sx={{ width: '100%' }}>
                  {message}
                </Alert>
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Button variant="contained" size="large" onClick={handleGoToLogin} fullWidth>
                    Ir al Login
                  </Button>
                  <Button variant="outlined" size="large" onClick={handleGoToRegister} fullWidth>
                    Crear Nueva Cuenta
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Card>
      </Box>
    </Container>
  );
}
