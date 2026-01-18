import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
  Box
} from '@mui/material';
import { Icon } from '@iconify/react';
import { LoadingButton } from '@mui/lab';
import { enqueueSnackbar } from 'notistack';
import { useDeleteAccountMutation } from 'src/redux/services/accountingApi';
import type { AccountingAccount } from 'src/sections/accounting/types';

interface AccountDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  account: AccountingAccount | null;
}

export function AccountDeleteDialog({ open, onClose, account }: AccountDeleteDialogProps) {
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const handleDelete = async () => {
    if (!account) return;

    try {
      await deleteAccount(account.id).unwrap();
      enqueueSnackbar('Cuenta eliminada exitosamente', { variant: 'success' });
      onClose();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const message = error?.data?.detail || 'Error al eliminar la cuenta';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  if (!account) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Icon icon="mdi:delete-alert" width={24} color="error" />
          <Typography variant="h6">Eliminar Cuenta Contable</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="error" icon={<Icon icon="mdi:alert" />}>
            <Typography variant="subtitle2" gutterBottom>
              Esta acción es irreversible
            </Typography>
            <Typography variant="body2">La cuenta será eliminada permanentemente del sistema (soft delete).</Typography>
          </Alert>

          <Box>
            <Typography variant="body1" gutterBottom>
              ¿Está seguro de eliminar la siguiente cuenta?
            </Typography>
            <Box
              sx={{
                mt: 2,
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.neutral'
              }}
            >
              <Typography variant="subtitle2" color="text.primary">
                {account.code} - {account.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {account.account_type}
              </Typography>
            </Box>
          </Box>

          <Alert severity="warning" icon={<Icon icon="mdi:information" />}>
            <Typography variant="caption" component="div">
              <strong>Restricciones de eliminación:</strong>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                <li>No se pueden eliminar cuentas de sistema</li>
                <li>No se pueden eliminar cuentas con subcuentas</li>
                <li>No se pueden eliminar cuentas con movimientos contables</li>
              </ul>
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" fontStyle="italic">
                  Sugerencia: Si la cuenta tiene movimientos, considere desactivarla en lugar de eliminarla.
                </Typography>
              </Box>
            </Typography>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <LoadingButton
          onClick={handleDelete}
          variant="contained"
          color="error"
          loading={isLoading}
          startIcon={<Icon icon="mdi:delete" />}
        >
          Eliminar Cuenta
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
