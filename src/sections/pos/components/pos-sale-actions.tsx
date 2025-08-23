import React, { memo } from 'react';
// @mui
import { Box, Button, Stack } from '@mui/material';
import { Icon } from '@iconify/react';

interface Props {
  canComplete: boolean;
  onCompleteSale: () => void;
}

const PosSaleActions = memo(({ canComplete, onCompleteSale }: Props) => (
  <Box sx={{ p: 2 }}>
    <Stack spacing={1}>
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!canComplete}
        onClick={onCompleteSale}
        startIcon={<Icon icon="mdi:check" />}
      >
        {canComplete ? 'Completar Venta' : 'Faltan Productos o Pagos'}
      </Button>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="small" fullWidth startIcon={<Icon icon="mdi:content-save" />}>
          Guardar
        </Button>
        <Button variant="outlined" size="small" fullWidth color="error" startIcon={<Icon icon="mdi:cancel" />}>
          Cancelar
        </Button>
      </Stack>
    </Stack>
  </Box>
));

PosSaleActions.displayName = 'PosSaleActions';

export default PosSaleActions;
