// src/sections/auth/jwt/forgot-password/steps/Step4SuccessMessage.tsx
import { Stack, Typography, Button } from '@mui/material';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { SentIcon } from 'src/assets/icons';

interface Step4SuccessMessageProps {
  email: string;
}

export default function Step4SuccessMessage({ email }: Step4SuccessMessageProps) {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push(paths.auth.jwt.login);
  };

  return (
    <Stack spacing={4} alignItems="center" sx={{ textAlign: 'center' }}>
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1}>
        <Typography variant="h3">¡Contraseña actualizada!</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          La contraseña de tu cuenta <strong>{email}</strong> ha sido restablecida correctamente.
        </Typography>
      </Stack>

      <Button variant="contained" onClick={handleGoToLogin}>
        Volver al inicio de sesión
      </Button>
    </Stack>
  );
}
