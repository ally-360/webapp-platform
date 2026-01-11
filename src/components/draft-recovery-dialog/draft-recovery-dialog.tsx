import { useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// components
import Iconify from 'src/components/iconify';
// utils

// ----------------------------------------------------------------------

interface DraftRecoveryDialogProps {
  open: boolean;
  timestamp?: string; // Fecha del borrador guardado
  title?: string;
  message?: string;
  onRecover: () => void; // Callback cuando quiere recuperar
  onDiscard: () => void; // Callback cuando quiere descartar
}

export default function DraftRecoveryDialog({
  open,
  timestamp,
  title = 'Borrador encontrado',
  message = 'Se encontró un borrador guardado anteriormente. ¿Deseas continuar desde donde lo dejaste?',
  onRecover,
  onDiscard
}: DraftRecoveryDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    setLoading(true);
    try {
      await onRecover();
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = async () => {
    setLoading(true);
    try {
      await onDiscard();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Iconify icon="solar:history-bold-duotone" width={28} sx={{ color: 'warning.main' }} />
          <Typography variant="h6">{title}</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDiscard}
          disabled={loading}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Empezar de Nuevo
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRecover}
          disabled={loading}
          startIcon={<Iconify icon="solar:restart-bold" />}
          autoFocus
        >
          Continuar Borrador
        </Button>
      </DialogActions>
    </Dialog>
  );
}
