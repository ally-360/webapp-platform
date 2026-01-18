import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Alert } from '@mui/material';

import type { CostCenter } from 'src/sections/accounting/types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onConfirm: () => Promise<void>;
  costCenter: CostCenter | null;
  isLoading?: boolean;
};

// ----------------------------------------------------------------------

export default function CostCenterDeleteDialog({ open, onClose, onConfirm, costCenter, isLoading = false }: Props) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Eliminación</DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción no se puede deshacer
        </Alert>

        <Typography>
          ¿Estás seguro de que deseas eliminar el centro de costo{' '}
          <strong>
            {costCenter?.code && `${costCenter.code} · `}
            {costCenter?.name}
          </strong>
          ?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={isLoading}>
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
