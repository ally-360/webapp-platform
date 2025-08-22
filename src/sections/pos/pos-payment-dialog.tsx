import React, { useState, useEffect } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Alert,
  Divider
} from '@mui/material';
import { Stack } from '@mui/system';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency, getPaymentMethodName, getPaymentMethodIcon } from 'src/redux/pos/posUtils';
import type { PaymentMethod } from 'src/redux/pos/posSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddPayment: (payment: PaymentMethod, openCashDrawer?: boolean) => void;
  remainingAmount: number;
  paymentMethods: Array<{
    id: string;
    name: string;
    type: 'cash' | 'card' | 'nequi' | 'transfer' | 'credit';
    enabled: boolean;
  }>;
}

export default function PosPaymentDialog({ open, onClose, onAddPayment, remainingAmount, paymentMethods }: Props) {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState(remainingAmount.toString());
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  // Update amount when remaining amount changes and dialog opens
  useEffect(() => {
    if (open) {
      setAmount(remainingAmount.toString());
    }
  }, [open, remainingAmount]);

  const handleClose = () => {
    setSelectedMethod('');
    setAmount(remainingAmount.toString());
    setReference('');
    setError('');
    onClose();
  };

  const handleAddPayment = () => {
    const paymentAmount = parseFloat(amount);

    // Validations
    if (!selectedMethod) {
      setError('Debe seleccionar un método de pago');
      return;
    }

    if (Number.isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('El monto debe ser mayor a cero');
      return;
    }

    // For non-cash payments, don't allow overpayment
    if (selectedMethod !== 'cash' && paymentAmount > remainingAmount + 1) {
      setError('El monto no puede ser mayor al pendiente');
      return;
    }

    const payment: PaymentMethod = {
      id: `payment_${Date.now()}`,
      method: selectedMethod as PaymentMethod['method'],
      amount: paymentAmount,
      reference: reference || undefined
    };

    // Check if we need to open cash drawer (cash payment with change)
    const shouldOpenCashDrawer = selectedMethod === 'cash' && paymentAmount > remainingAmount;

    onAddPayment(payment, shouldOpenCashDrawer);
    handleClose();
  };

  const handleSetFullAmount = () => {
    setAmount(remainingAmount.toString());
  };

  const paymentAmount = parseFloat(amount) || 0;
  const changeAmount =
    selectedMethod === 'cash' && paymentAmount > remainingAmount ? paymentAmount - remainingAmount : 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Icon icon="mdi:credit-card-plus" />
          <Typography variant="h6">Agregar Pago</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {/* Amount Info */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.lighter',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.light'
            }}
          >
            <Typography variant="subtitle2" color="primary.dark">
              Monto pendiente: {formatCurrency(remainingAmount)}
            </Typography>
          </Box>

          {/* Payment Method Selection */}
          <FormControl fullWidth>
            <InputLabel>Método de Pago</InputLabel>
            <Select value={selectedMethod} label="Método de Pago" onChange={(e) => setSelectedMethod(e.target.value)}>
              {paymentMethods
                .filter((method) => method.enabled)
                .map((method) => (
                  <MenuItem key={method.id} value={method.type}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon icon={getPaymentMethodIcon(method.type)} />
                      <Typography>{getPaymentMethodName(method.type)}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Amount Input */}
          <TextField
            fullWidth
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <Button size="small" variant="text" onClick={handleSetFullAmount} disabled={remainingAmount <= 0}>
                    Total
                  </Button>
                </InputAdornment>
              )
            }}
            inputProps={{
              min: 0,
              step: 100
            }}
          />

          {/* Reference (Optional) */}
          {selectedMethod && selectedMethod !== 'cash' && (
            <TextField
              fullWidth
              label="Referencia (Opcional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Número de transacción, autorización, etc."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:tag-text" />
                  </InputAdornment>
                )
              }}
            />
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Payment Preview */}
          {selectedMethod && amount && !Number.isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'success.lighter',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.light'
              }}
            >
              <Typography variant="subtitle2" color="success.dark">
                Pago: {getPaymentMethodName(selectedMethod)} - {formatCurrency(parseFloat(amount))}
              </Typography>
              {changeAmount > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'warning.lighter',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'warning.light'
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Icon icon="mdi:cash-refund" style={{ color: '#ed6c02' }} />
                        <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                          Cambio a entregar:
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight="bold" color="warning.dark">
                        {formatCurrency(changeAmount)}
                      </Typography>
                    </Stack>
                  </Box>
                </>
              )}
            </Box>
          )}

          {/* Cash Drawer Notice */}
          {selectedMethod === 'cash' && changeAmount > 0 && (
            <Alert severity="info" icon={<Icon icon="mdi:cash-register" />}>
              Se abrirá el cajón automáticamente para entregar el cambio.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleAddPayment}
          disabled={!selectedMethod || !amount || parseFloat(amount) <= 0}
          startIcon={
            selectedMethod === 'cash' && changeAmount > 0 ? (
              <Icon icon="mdi:cash-register" />
            ) : (
              <Icon icon="mdi:credit-card-plus" />
            )
          }
        >
          {selectedMethod === 'cash' && changeAmount > 0 ? 'Pagar y Abrir Cajón' : 'Agregar Pago'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
