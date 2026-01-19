import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
// utils
import { format } from 'date-fns';
// components
import { useSnackbar } from 'src/components/snackbar';
// redux
import { useConvertPOToBillMutation } from 'src/redux/services/billsApi';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  poId: string;
  poNumber?: string;
  onSuccess?: (billId: string) => void;
};

export default function ConvertPOToBillDialog({ open, onClose, poId, poNumber, onSuccess }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const [convertPOToBill, { isLoading }] = useConvertPOToBillMutation();

  const today = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    bill_number: '',
    issue_date: today,
    due_date: today,
    status: 'DRAFT' as 'DRAFT' | 'OPEN',
    notes: ''
  });

  useEffect(() => {
    if (!open) return;

    setFormData({
      bill_number: '',
      issue_date: today,
      due_date: today,
      status: 'DRAFT',
      notes: ''
    });
  }, [open, today]);

  const handleChange = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleConvert = async () => {
    try {
      const bill = await convertPOToBill({ id: poId, data: formData }).unwrap();
      enqueueSnackbar('Orden de compra convertida a factura exitosamente', { variant: 'success' });
      onClose();

      if (bill?.id) {
        onSuccess?.(bill.id);
      }
    } catch (error: any) {
      console.error('Error converting PO to bill:', error);
      const message = error?.data?.detail || 'Error al convertir orden de compra';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const canConvert = formData.bill_number && formData.issue_date && formData.due_date;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Convertir Orden de Compra a Factura</DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Alert severity="info">
            Esta acción creará una factura de proveedor basada en la orden de compra {poNumber ? `#${poNumber}` : ''}.
            Si la factura se crea en estado &ldquo;Abierta&rdquo;, se actualizará el inventario automáticamente.
          </Alert>

          <TextField
            fullWidth
            label="Número de Factura *"
            value={formData.bill_number}
            onChange={handleChange('bill_number')}
            placeholder="Ej: FACT-001"
            helperText="Ingrese el número de factura del proveedor"
          />

          <TextField
            fullWidth
            label="Fecha de Emisión *"
            type="date"
            value={formData.issue_date}
            onChange={handleChange('issue_date')}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Fecha de Vencimiento *"
            type="date"
            value={formData.due_date}
            onChange={handleChange('due_date')}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            fullWidth
            label="Estado de Factura *"
            value={formData.status}
            onChange={handleChange('status')}
            helperText="open actualiza inventario automáticamente"
          >
            <MenuItem value="DRAFT">Borrador</MenuItem>
            <MenuItem value="OPEN">Abierta (actualiza inventario)</MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notas"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Observaciones adicionales..."
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancelar
        </Button>
        <LoadingButton onClick={handleConvert} variant="contained" loading={isLoading} disabled={!canConvert}>
          Convertir a Factura
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
