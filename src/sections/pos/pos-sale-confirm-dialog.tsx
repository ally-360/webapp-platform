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
  Select,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Grid,
  Divider,
  Chip,
  Stack,
  Card,
  Paper
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { SaleWindow } from 'src/redux/pos/posSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (saleData: {
    seller_id?: string;
    seller_name: string;
    sale_date: Date;
    tax_rate: number;
    discount_percentage?: number;
    discount_amount?: number;
    notes?: string;
  }) => void;
  saleWindow: SaleWindow;
}

const mockSellers = [
  { id: '1', name: 'Juan Pérez', document: '12345678' },
  { id: '2', name: 'María García', document: '87654321' },
  { id: '3', name: 'Carlos Rodríguez', document: '11223344' },
  { id: '4', name: 'Ana López', document: '44332211' }
];

export default function PosSaleConfirmDialog({ open, onClose, onConfirm, saleWindow }: Props) {
  const [seller, setSeller] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [taxRate, setTaxRate] = useState(19);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [recalculatedTotals, setRecalculatedTotals] = useState({
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total: 0
  });

  // Initialize values from sale window
  useEffect(() => {
    if (open) {
      setSaleDate(new Date());
      setTaxRate(19); // Default tax rate
      setDiscountValue(saleWindow.discount_percentage || 0);
      setDiscountType(saleWindow.discount_percentage ? 'percentage' : 'amount');
      setNotes(saleWindow.notes || '');

      // Set default seller if available
      if (mockSellers.length > 0) {
        setSeller(mockSellers[0].id);
        setSellerName(mockSellers[0].name);
      }
    }
  }, [open, saleWindow]);

  // Recalculate totals when tax or discount changes
  useEffect(() => {
    const baseSubtotal = saleWindow.products.reduce((sum, product) => sum + product.price * product.quantity, 0);

    let finalDiscountAmount = 0;
    if (discountType === 'percentage') {
      finalDiscountAmount = (baseSubtotal * discountValue) / 100;
    } else {
      finalDiscountAmount = discountValue;
    }

    const subtotalAfterDiscount = baseSubtotal - finalDiscountAmount;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;
    const total = subtotalAfterDiscount + taxAmount;

    setRecalculatedTotals({
      subtotal: baseSubtotal,
      tax_amount: taxAmount,
      discount_amount: finalDiscountAmount,
      total
    });
  }, [taxRate, discountValue, discountType, saleWindow.products]);

  const handleClose = () => {
    setSeller('');
    setSellerName('');
    setSaleDate(new Date());
    setTaxRate(19);
    setDiscountValue(0);
    setNotes('');
    onClose();
  };

  const handleSellerChange = (sellerId: string) => {
    setSeller(sellerId);
    const selectedSeller = mockSellers.find((s) => s.id === sellerId);
    if (selectedSeller) {
      setSellerName(selectedSeller.name);
    }
  };

  const handleConfirm = () => {
    const finalDiscountAmount =
      discountType === 'percentage' ? (recalculatedTotals.subtotal * discountValue) / 100 : discountValue;

    onConfirm({
      seller_id: seller,
      seller_name: sellerName,
      sale_date: saleDate,
      tax_rate: taxRate,
      discount_percentage: discountType === 'percentage' ? discountValue : undefined,
      discount_amount: discountType === 'amount' ? discountValue : finalDiscountAmount,
      notes: notes || undefined
    });
    handleClose();
  };

  const totalPaid = saleWindow.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const canConfirm = sellerName && saleDate && taxRate >= 0 && recalculatedTotals.total > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            minHeight: '70vh',
            maxHeight: '90vh'
          }
        }}
      >
        {/* Enhanced Header */}
        <DialogTitle
          sx={{
            pb: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'primary.contrastText',
            '& .MuiTypography-root': {
              color: 'inherit'
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon icon="mdi:cash-register" width={32} height={32} />
            <Box>
              <Typography variant="h5" component="div">
                Confirmar Venta
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Ventana #{saleWindow.window_number} • {formatCurrency(recalculatedTotals.total)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Left Column - Form Data */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                {/* Seller Selection */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:account-tie" />
                    Vendedor Responsable
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={seller}
                      onChange={(e) => handleSellerChange(e.target.value)}
                      displayEmpty
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="" disabled>
                        Seleccionar vendedor
                      </MenuItem>
                      {mockSellers.map((sellerOption) => (
                        <MenuItem key={sellerOption.id} value={sellerOption.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Icon icon="mdi:account-circle" size={20} />
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {sellerOption.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                CC: {sellerOption.document}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Card>

                {/* Date and Time */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:calendar-clock" />
                    Fecha y Hora de Venta
                  </Typography>
                  <DateTimePicker
                    label="Fecha y Hora"
                    value={saleDate}
                    onChange={(newValue) => setSaleDate(newValue || new Date())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: { bgcolor: 'background.paper' },
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon icon="mdi:calendar" />
                            </InputAdornment>
                          )
                        }
                      }
                    }}
                  />
                </Card>

                {/* Tax Configuration */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:calculator" />
                    Configuración de Impuestos
                  </Typography>
                  <TextField
                    fullWidth
                    label="Tasa de Impuesto (%)"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    sx={{ bgcolor: 'background.paper' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon icon="mdi:percent" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setTaxRate(19)}
                            disabled={taxRate === 19}
                            sx={{ minWidth: 'auto', px: 1.5 }}
                          >
                            IVA 19%
                          </Button>
                        </InputAdornment>
                      )
                    }}
                    inputProps={{
                      min: 0,
                      max: 100,
                      step: 0.1
                    }}
                  />
                </Card>

                {/* Discount Section */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:tag-percent" />
                    Descuento
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label="Porcentaje"
                        variant={discountType === 'percentage' ? 'filled' : 'outlined'}
                        onClick={() => setDiscountType('percentage')}
                        icon={<Icon icon="mdi:percent" />}
                        color={discountType === 'percentage' ? 'primary' : 'default'}
                        size="medium"
                      />
                      <Chip
                        label="Valor Fijo"
                        variant={discountType === 'amount' ? 'filled' : 'outlined'}
                        onClick={() => setDiscountType('amount')}
                        icon={<Icon icon="mdi:currency-usd" />}
                        color={discountType === 'amount' ? 'primary' : 'default'}
                        size="medium"
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label={discountType === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      sx={{ bgcolor: 'background.paper' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon={discountType === 'percentage' ? 'mdi:percent' : 'mdi:currency-usd'} />
                          </InputAdornment>
                        )
                      }}
                      inputProps={{
                        min: 0,
                        step: discountType === 'percentage' ? 0.1 : 100
                      }}
                    />
                  </Stack>
                </Card>

                {/* Notes */}
                <Card sx={{ p: 2.5, bgcolor: 'background.neutral', border: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="mdi:note-text" />
                    Observaciones
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales sobre la venta..."
                    variant="outlined"
                    sx={{ bgcolor: 'background.paper' }}
                  />
                </Card>
              </Stack>
            </Grid>

            {/* Right Column - Summary */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  p: 3,
                  height: 'fit-content',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.neutral} 100%)`,
                  boxShadow: (theme) => theme.shadows[8]
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icon icon="mdi:receipt" />
                  Resumen de Venta
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Products Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Icon icon="mdi:package-variant" size={16} />
                    PRODUCTOS ({saleWindow.products.length})
                  </Typography>
                  <Paper sx={{ maxHeight: 200, overflow: 'auto', p: 1, bgcolor: 'background.paper' }}>
                    <Stack spacing={0.5}>
                      {saleWindow.products.map((product, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1,
                            px: 1.5,
                            borderRadius: 1,
                            bgcolor: index % 2 === 0 ? 'background.neutral' : 'transparent',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Box sx={{ flex: 1, mr: 2 }}>
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.quantity} × {formatCurrency(product.price)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(product.price * product.quantity)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Totals */}
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(recalculatedTotals.subtotal)}
                    </Typography>
                  </Box>

                  {recalculatedTotals.discount_amount > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1,
                        px: 1.5,
                        borderRadius: 1,
                        bgcolor: 'error.lighter',
                        border: '1px solid',
                        borderColor: 'error.light'
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Icon icon="mdi:tag-minus" size={16} />
                        Descuento ({discountType === 'percentage' ? `${discountValue}%` : 'Fijo'}):
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        -{formatCurrency(recalculatedTotals.discount_amount)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2">Impuestos ({taxRate}%):</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(recalculatedTotals.tax_amount)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText'
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(recalculatedTotals.total)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      px: 1.5,
                      borderRadius: 1,
                      bgcolor: 'success.lighter',
                      border: '1px solid',
                      borderColor: 'success.light'
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Icon icon="mdi:check-circle" size={16} />
                      Pagado:
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(totalPaid)}
                    </Typography>
                  </Box>

                  {totalPaid < recalculatedTotals.total && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 1,
                        px: 1.5,
                        borderRadius: 1,
                        bgcolor: 'warning.lighter',
                        border: '1px solid',
                        borderColor: 'warning.light'
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="warning.main"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <Icon icon="mdi:clock-outline" size={16} />
                        Pendiente:
                      </Typography>
                      <Typography variant="body2" color="warning.main" fontWeight="bold">
                        {formatCurrency(recalculatedTotals.total - totalPaid)}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Customer Info */}
                {saleWindow.customer && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Card sx={{ p: 2, bgcolor: 'info.lighter', border: '1px solid', borderColor: 'info.light' }}>
                      <Typography
                        variant="subtitle2"
                        color="info.main"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Icon icon="mdi:account" />
                        Cliente
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {saleWindow.customer.name}
                      </Typography>
                      {saleWindow.customer.document && (
                        <Typography variant="caption" color="text.secondary">
                          {saleWindow.customer.document_type}: {saleWindow.customer.document}
                        </Typography>
                      )}
                    </Card>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, bgcolor: 'background.neutral', gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            size="large"
            startIcon={<Icon icon="mdi:close" />}
            sx={{ minWidth: 120 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!canConfirm}
            size="large"
            startIcon={<Icon icon="mdi:check" />}
            sx={{
              minWidth: 160,
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              '&:hover': {
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
              }
            }}
          >
            Confirmar Venta
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
