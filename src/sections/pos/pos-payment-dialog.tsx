import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { Stack } from '@mui/system';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency, getPaymentMethodName, getPaymentMethodIcon } from 'src/redux/pos/posUtils';
import type { PaymentMethod } from 'src/redux/pos/posSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  onAddPayment: (payment: PaymentMethod) => void;
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

    if (paymentAmount > remainingAmount + 1) {
      // +1 for floating point precision
      setError('El monto no puede ser mayor al pendiente');
      return;
    }

    const payment: PaymentMethod = {
      id: `payment_${Date.now()}`,
      method: selectedMethod as PaymentMethod['method'],
      amount: paymentAmount,
      reference: reference || undefined
    };

    onAddPayment(payment);
    handleClose();
  };

  const handleSetFullAmount = () => {
    setAmount(remainingAmount.toString());
  };

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
              {parseFloat(amount) > remainingAmount && (
                <Typography variant="caption" color="success.dark">
                  Cambio: {formatCurrency(parseFloat(amount) - remainingAmount)}
                </Typography>
              )}
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleAddPayment}
          disabled={!selectedMethod || !amount || parseFloat(amount) <= 0}
        >
          Agregar Pago
        </Button>
      </DialogActions>
    </Dialog>
  );
}
