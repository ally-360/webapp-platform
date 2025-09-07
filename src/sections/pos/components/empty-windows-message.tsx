import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Button, Typography, useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { Icon } from '@iconify/react';

interface EmptyWindowsMessageProps {
  onAddTab: () => void;
}

/**
 * Mensaje cuando no hay ventanas de venta abiertas
 *
 * Componente que se muestra cuando no existen ventanas de venta activas.
 * Proporciona un botón para crear la primera venta.
 */
const EmptyWindowsMessage: React.FC<EmptyWindowsMessageProps> = ({ onAddTab }) => {
  const theme = useTheme();

  return (
    <Grid xs={12}>
      <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
        <Icon icon="mdi:cart-outline" style={{ fontSize: '48px', color: theme.palette.text.disabled }} />
        <Typography variant="h6" color="text.secondary">
          No hay ventanas de venta abiertas
        </Typography>
        <Button variant="contained" onClick={onAddTab} startIcon={<Icon icon="mdi:plus" />}>
          Crear Primera Venta
        </Button>
      </Stack>
    </Grid>
  );
};

export default EmptyWindowsMessage;
