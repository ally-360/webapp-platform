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
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  // Función para formatear números al estilo colombiano (30.639,01)
  const formatCurrencyInput = (num: number): string => {
    if (Number.isNaN(num) || num === 0) return '';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(num);
  };

  // Función para parsear el input formateado a número
  const parseCurrencyInput = (inputValue: string): number => {
    if (!inputValue || inputValue.trim() === '') return 0;

    // Remover puntos de miles y reemplazar coma decimal por punto
    const cleaned = inputValue
      .replace(/\./g, '') // Remover puntos de miles
      .replace(',', '.'); // Reemplazar coma decimal por punto

    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  };

  // Función para formatear mientras el usuario escribe
  const handleAmountChange = (inputValue: string) => {
    // Si está vacío, limpiar
    if (inputValue === '') {
      setAmount('');
      return;
    }

    // Permitir solo números, puntos y comas
    let sanitized = inputValue.replace(/[^\d.,]/g, '');

    if (sanitized === '') {
      setAmount('');
      return;
    }

    // Si está escribiendo coma para decimales, manejar caso especial
    if (sanitized.endsWith(',')) {
      // Obtener la parte antes de la coma
      const beforeComma = sanitized.slice(0, -1);
      if (beforeComma === '' || beforeComma === '0') {
        setAmount('0,');
        return;
      }
      // Formatear la parte entera y agregar la coma
      const numericValue = parseCurrencyInput(beforeComma);
      if (numericValue > 0) {
        setAmount(`${formatCurrencyInput(numericValue)},`);
      } else {
        setAmount('0,');
      }
      return;
    }

    // Si hay coma y dígitos después, manejar decimales
    const commaIndex = sanitized.lastIndexOf(',');
    if (commaIndex !== -1) {
      const beforeComma = sanitized.substring(0, commaIndex);
      const afterComma = sanitized.substring(commaIndex + 1);

      // Limitar a 2 decimales
      if (afterComma.length > 2) {
        sanitized = `${beforeComma},${afterComma.substring(0, 2)}`;
      }

      // Formatear la parte entera
      const integerPart = parseCurrencyInput(beforeComma);
      const formattedInteger = integerPart > 0 ? formatCurrencyInput(integerPart) : '0';
      setAmount(`${formattedInteger},${afterComma.substring(0, 2)}`);
      return;
    }

    // Caso normal: solo números enteros
    const numericValue = parseCurrencyInput(sanitized);
    if (numericValue >= 0) {
      setAmount(formatCurrencyInput(numericValue));
    }
  };

  useEffect(() => {
    console.log('Remaining Amount changed:', remainingAmount);
    if (open) {
      setAmount(formatCurrencyInput(remainingAmount));
    }
  }, [open, remainingAmount]);

  const handleClose = () => {
    setSelectedMethod('');
    setAmount('');
    setReference('');
    setError('');
    onClose();
  };

  const handleAddPayment = () => {
    const paymentAmount = parseCurrencyInput(amount);

    if (!selectedMethod) {
      setError('Debe seleccionar un método de pago');
      return;
    }

    if (paymentAmount <= 0) {
      setError('El monto debe ser mayor a cero');
      return;
    }

    if (selectedMethod !== 'cash' && paymentAmount > remainingAmount + 0.01) {
      setError('El monto no puede ser mayor al pendiente');
      return;
    }

    const payment: PaymentMethod = {
      id: `payment_${Date.now()}`,
      method: selectedMethod as PaymentMethod['method'],
      amount: paymentAmount,
      reference: reference || undefined
    };

    const shouldOpenCashDrawer = selectedMethod === 'cash' && paymentAmount > remainingAmount;

    onAddPayment(payment, shouldOpenCashDrawer);
    handleClose();
  };

  const handleSetFullAmount = () => {
    setAmount(formatCurrencyInput(remainingAmount));
  };

  const paymentAmount = parseCurrencyInput(amount);
  const changeAmount =
    selectedMethod === 'cash' && paymentAmount > remainingAmount
      ? Math.round((paymentAmount - remainingAmount) * 100) / 100
      : 0;

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

          <TextField
            fullWidth
            label="Monto"
            value={amount}
            onChange={(e) => {
              const { value } = e.target;
              handleAmountChange(value);
            }}
            placeholder="0"
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
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*'
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
          {selectedMethod && amount && paymentAmount > 0 && (
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
                Pago: {getPaymentMethodName(selectedMethod)} - {formatCurrency(paymentAmount)}
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
          disabled={!selectedMethod || !amount || paymentAmount <= 0}
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
