import { useState, useCallback, useMemo } from 'react';
// @mui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
// components
import { useSnackbar } from 'src/components/snackbar';
// redux
import { useAllocatePaymentMutation } from 'src/redux/services/paymentsReceivedApi';
//
import PaymentInvoiceSelector, { InvoiceAllocation } from './payment-invoice-selector';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  paymentId: string;
  customerId: string;
  availableAmount: number;
};

// ----------------------------------------------------------------------

export default function AllocatePaymentDialog({ open, onClose, paymentId, customerId, availableAmount }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [allocatePayment, { isLoading }] = useAllocatePaymentMutation();
  const [selectedInvoices, setSelectedInvoices] = useState<InvoiceAllocation[]>([]);

  const totalAllocated = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + inv.amount_applied, 0),
    [selectedInvoices]
  );

  const isValid = selectedInvoices.length > 0 && totalAllocated <= availableAmount && totalAllocated > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      enqueueSnackbar('Verifique las asignaciones antes de continuar', { variant: 'warning' });
      return;
    }

    try {
      await allocatePayment({
        id: paymentId,
        data: {
          allocations: selectedInvoices.map((inv) => ({
            invoice_id: inv.invoice_id,
            amount_applied: inv.amount_applied
          }))
        }
      }).unwrap();

      enqueueSnackbar('Pago aplicado a facturas exitosamente', { variant: 'success' });
      handleClose();
    } catch (error) {
      console.error('Error al aplicar pago:', error);
      enqueueSnackbar(error?.data?.detail || 'Error al aplicar el pago', { variant: 'error' });
    }
  }, [isValid, allocatePayment, paymentId, selectedInvoices, enqueueSnackbar, onClose]);

  const handleClose = useCallback(() => {
    setSelectedInvoices([]);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Aplicar Pago a Facturas</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">
            Seleccione las facturas a las que desea aplicar este pago anticipado y especifique el monto para cada una.
          </Alert>

          <PaymentInvoiceSelector
            customerId={customerId}
            paymentAmount={availableAmount}
            onInvoicesChange={setSelectedInvoices}
          />

          {!isValid && selectedInvoices.length > 0 && (
            <Alert severity="error">El total asignado debe ser mayor a 0 y no puede exceder el monto disponible.</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isLoading}>
          Cancelar
        </Button>
        <LoadingButton variant="contained" onClick={handleSubmit} loading={isLoading} disabled={!isValid}>
          Aplicar Pago
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
