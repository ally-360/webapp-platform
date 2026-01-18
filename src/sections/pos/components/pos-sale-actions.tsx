import React, { memo } from 'react';
// @mui
import { Box, Button, Stack } from '@mui/material';
import { Icon } from '@iconify/react';

interface Props {
  canComplete: boolean;
  onCompleteSale: () => void;
  onCancel: () => void;
}

const PosSaleActions = memo(({ canComplete, onCompleteSale, onCancel }: Props) => (
  <Box
    sx={{
      p: 2,
      bgcolor: 'background.paper'
    }}
  >
    <Stack spacing={1.5}>
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!canComplete}
        onClick={onCompleteSale}
        startIcon={<Icon icon="mdi:check" />}
        sx={{
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {canComplete ? 'Completar Venta' : 'Faltan Productos o Pagos'}
      </Button>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="medium" fullWidth startIcon={<Icon icon="mdi:content-save" />}>
          Guardar
        </Button>
        <Button
          variant="outlined"
          size="medium"
          fullWidth
          color="error"
          onClick={onCancel}
          startIcon={<Icon icon="mdi:cancel" />}
        >
          Cancelar
        </Button>
      </Stack>
    </Stack>
  </Box>
));

PosSaleActions.displayName = 'PosSaleActions';

export default PosSaleActions;
