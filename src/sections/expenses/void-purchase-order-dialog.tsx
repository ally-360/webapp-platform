import { useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
// components
import { useSnackbar } from 'src/components/snackbar';
// redux
import { useVoidPurchaseOrderMutation } from 'src/redux/services/billsApi';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  poId: string;
  poNumber?: string;
};

export default function VoidPurchaseOrderDialog({ open, onClose, poId, poNumber }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [voidPurchaseOrder, { isLoading }] = useVoidPurchaseOrderMutation();
  const [reason, setReason] = useState('');

  const handleVoid = async () => {
    try {
      await voidPurchaseOrder({ id: poId, reason: reason || undefined }).unwrap();
      enqueueSnackbar('Orden de compra anulada exitosamente', { variant: 'success' });
      setReason('');
      onClose();
    } catch (error: any) {
      console.error('Error voiding PO:', error);
      const message = error?.data?.detail || 'Error al anular orden de compra';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Anular Orden de Compra</DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          ¿Está seguro que desea anular la orden de compra {poNumber ? `#${poNumber}` : ''}? Esta acción no se puede
          deshacer.
        </Alert>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Motivo de anulación (opcional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ingrese el motivo por el cual está anulando esta orden..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancelar
        </Button>
        <LoadingButton onClick={handleVoid} variant="contained" color="error" loading={isLoading}>
          Anular Orden
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
