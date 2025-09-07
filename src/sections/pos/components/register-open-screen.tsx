import React from 'react';
import { Container, Typography, Button, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { Icon } from '@iconify/react';

interface RegisterOpenScreenProps {
  onOpenDialog: () => void;
}

/**
 * Pantalla de apertura de caja
 *
 * Componente que se muestra cuando no hay un registro/caja abierta.
 * Proporciona información al usuario y un botón para abrir la caja.
 */
const RegisterOpenScreen: React.FC<RegisterOpenScreenProps> = ({ onOpenDialog }) => {
  const theme = useTheme();

  return (
    <Container
      maxWidth={false}
      sx={{
        pt: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh'
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Icon icon="mdi:cash-register" style={{ fontSize: '64px', color: theme.palette.primary.main }} />
        <Typography variant="h4" gutterBottom>
          Apertura de Caja
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth="400px">
          Para comenzar a usar el POS, primero debe abrir la caja del día. Ingrese el monto inicial y confirme la
          apertura.
        </Typography>
        <Button variant="contained" size="large" startIcon={<Icon icon="mdi:cash-multiple" />} onClick={onOpenDialog}>
          Abrir Caja
        </Button>
      </Stack>
    </Container>
  );
};

export default RegisterOpenScreen;
