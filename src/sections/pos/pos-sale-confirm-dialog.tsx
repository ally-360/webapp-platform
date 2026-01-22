import React, { useState, useEffect, useMemo } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
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
  Paper,
  FormControlLabel,
  Switch
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Icon } from '@iconify/react';

// redux
import { useAppSelector, useAppDispatch } from 'src/hooks/store';
import { useCreatePOSSaleMutation, useGetSellersQuery } from 'src/redux/services/posApi';
import { useGetCostCentersQuery } from 'src/redux/services/accountingApi';
import { completeSale } from 'src/redux/pos/posSlice';
import { useSnackbar } from 'src/components/snackbar';

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

export default function PosSaleConfirmDialog({ open, onClose, onConfirm: _onConfirm, saleWindow }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  // Redux state
  const { currentRegister } = useAppSelector((state) => state.pos);

  // RTK Query mutations and queries
  const [createPOSSale, { isLoading: isCreatingSale }] = useCreatePOSSaleMutation();
  const { data: sellersData, isLoading: _isLoadingSellers } = useGetSellersQuery({
    active_only: true,
    size: 100
  });

  const { data: costCenters = [] } = useGetCostCentersQuery();

  const sellers = useMemo(() => sellersData?.sellers || [], [sellersData?.sellers]);

  // Form state
  const [seller, setSeller] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [taxRate, setTaxRate] = useState(19);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [costCenterId, setCostCenterId] = useState('');
  const [shouldPrintTicket, setShouldPrintTicket] = useState(true); // ✅ Estado para controlar impresión
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
      setCostCenterId('');

      // Set default seller: priorizar el que abrió la caja
      if (sellers.length > 0) {
        // Intentar usar el cajero actual si existe en la lista de vendedores
        const currentCashierSeller = currentRegister?.user_id
          ? sellers.find((sellerItem) => sellerItem.id === currentRegister.user_id)
          : null;

        if (currentCashierSeller) {
          // Si encontramos al cajero actual en la lista de vendedores, usarlo
          setSeller(currentCashierSeller.id);
          setSellerName(currentCashierSeller.name);
          console.log('✅ Usando cajero actual como vendedor:', currentCashierSeller.name);
        } else {
          // Si no se encuentra, usar el primer vendedor disponible
          setSeller(sellers[0].id);
          setSellerName(sellers[0].name);
          console.log('⚠️ Cajero no está en lista de vendedores, usando primer vendedor:', sellers[0].name);
        }
      }
    }
  }, [open, saleWindow, sellers, currentRegister?.user_id, currentRegister?.user_name]);

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
    setCostCenterId('');
    onClose();
  };

  const handleSellerChange = (sellerId: string) => {
    setSeller(sellerId);
    const selectedSeller = sellers.find((s) => s.id === sellerId);
    if (selectedSeller) {
      setSellerName(selectedSeller.name);
    }
  };

  const handleConfirm = async () => {
    // Prevenir múltiples clicks mientras se procesa
    if (isCreatingSale) {
      return;
    }

    if (!currentRegister?.pdv_id) {
      enqueueSnackbar('Error: No hay un PDV activo seleccionado', { variant: 'error' });
      return;
    }

    try {
      // Validación: cliente obligatorio (backend requiere UUID)
      if (!saleWindow.customer?.id) {
        enqueueSnackbar('Debes seleccionar un cliente antes de confirmar la venta.', {
          variant: 'warning'
        });
        return;
      }
      const finalDiscountAmount =
        discountType === 'percentage' ? (recalculatedTotals.subtotal * discountValue) / 100 : discountValue;

      // Mapear productos al formato requerido por la API
      const items = saleWindow.products.map((product) => ({
        product_id: product.id,
        quantity: product.quantity,
        unit_price: product.price,
        tax_rate: product.tax_rate || taxRate,
        line_discount: 0, // Sin descuento por línea por ahora
        line_total: product.price * product.quantity
      }));

      // Mapear pagos al formato requerido por la API
      const payments = saleWindow.payments.map((payment) => {
        // Mapear métodos de pago al formato de la API (UPPERCASE requerido por backend)
        let apiMethod: 'CASH' | 'CARD' | 'TRANSFER' | 'QR_CODE' | 'OTHER';
        switch (payment.method) {
          case 'cash':
            apiMethod = 'CASH';
            break;
          case 'card':
            apiMethod = 'CARD';
            break;
          case 'transfer':
            apiMethod = 'TRANSFER';
            break;
          case 'nequi':
            apiMethod = 'TRANSFER'; // Nequi se mapea como TRANSFER
            break;
          case 'credit':
          default:
            apiMethod = 'OTHER';
            break;
        }

        return {
          method: apiMethod,
          amount: payment.amount,
          reference: payment.reference,
          notes: undefined
        };
      });

      // Preparar datos para la API
      const saleData: any = {
        customer_id: saleWindow.customer.id, // UUID requerido por backend
        seller_id: seller || '', // Convertir null a string vacío
        items,
        payments,
        notes: notes || undefined,
        cost_center_id: costCenterId || undefined,
        subtotal: recalculatedTotals.subtotal,
        tax_total: recalculatedTotals.tax_amount,
        discount_total: finalDiscountAmount,
        total_amount: recalculatedTotals.total,
        sale_date: saleDate.toISOString()
      };

      console.log('🎯 Enviando datos de venta:', {
        pdv_id: currentRegister.pdv_id,
        ...saleData
      });

      // Crear la venta usando RTK Query
      // El endpoint espera { pdv_id, ...data } donde pdv_id va como query param
      const backendResponse = await createPOSSale({
        pdv_id: currentRegister.pdv_id,
        ...saleData
      }).unwrap();

      enqueueSnackbar('¡Venta creada exitosamente!', { variant: 'success' });

      // 🔥 Limpiar la ventana del POS después de venta exitosa
      dispatch(
        completeSale({
          windowId: saleWindow.id,
          pos_type: 'simple', // Tipo de venta (puede ser 'electronic' si tiene documento)
          invoice_number: backendResponse.number,
          seller_id: seller,
          seller_name: sellerName,
          sale_date: saleDate.toISOString(),
          tax_rate: taxRate,
          discount_percentage: discountType === 'percentage' ? discountValue : undefined,
          discount_amount: finalDiscountAmount,
          notes: notes || undefined
        })
      );

      // ✅ Imprimir ticket si está habilitado
      if (shouldPrintTicket) {
        try {
          const { printReceipt } = await import('./pos-print-receipt');

          // Construir los datos de la venta completada para el ticket
          const completedSale = {
            id: backendResponse.id || backendResponse.number,
            sale_window_id: saleWindow.id,
            register_id: currentRegister.id,
            customer: saleWindow.customer,
            products: saleWindow.products,
            payments: saleWindow.payments,
            subtotal: recalculatedTotals.subtotal,
            tax_amount: recalculatedTotals.tax_amount,
            total: recalculatedTotals.total,
            created_at: saleDate.toISOString(),
            invoice_number: backendResponse.number,
            pos_type: 'simple',
            notes: notes || undefined,
            seller_id: seller,
            seller_name: sellerName,
            sale_date: saleDate.toISOString(),
            discount_percentage: discountType === 'percentage' ? discountValue : undefined,
            discount_amount: finalDiscountAmount
          };

          printReceipt({
            sale: completedSale,
            registerInfo: {
              pdv_name: currentRegister.pdv_name,
              user_name: currentRegister.user_name
            }
          });
        } catch (printError) {
          console.error('Error al imprimir ticket:', printError);
          // No mostrar error al usuario, la venta ya se completó
        }
      }

      // ✅ NO llamar onConfirm - ya se completó la venta aquí
      // El callback onConfirm era de la implementación anterior
      // Ahora la lógica de creación está completamente manejada en este diálogo

      handleClose();
    } catch (error: any) {
      console.error('❌ Error al crear venta:', error);

      // Manejo de errores específicos
      if (error?.data?.detail) {
        enqueueSnackbar(`Error: ${error.data.detail}`, { variant: 'error' });
      } else if (error?.data?.message) {
        enqueueSnackbar(`Error: ${error.data.message}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al crear la venta. Inténtalo de nuevo.', { variant: 'error' });
      }
    }
  };

  const totalPaid = saleWindow.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const canConfirm =
    !!saleWindow.customer?.id && seller !== '' && taxRate >= 0 && recalculatedTotals.total > 0 && !isCreatingSale;

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
            color: 'primary.contrastText'
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon icon="solar:bill-check-bold-duotone" width={32} height={32} />
            <Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                Confirmar Venta
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {saleWindow.products.length} producto{saleWindow.products.length !== 1 ? 's' : ''}
                {' • '}
                {formatCurrency(recalculatedTotals.total)}
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
                <Card sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="solar:user-check-bold-duotone" width={20} />
                    Vendedor Responsable
                  </Typography>

                  <FormControl fullWidth>
                    <Select value={seller} onChange={(e) => handleSellerChange(e.target.value)} displayEmpty>
                      <MenuItem value="" disabled>
                        {sellers.length === 0 ? 'Cargando vendedores...' : 'Seleccionar vendedor'}
                      </MenuItem>
                      {sellers.map((sellerOption) => (
                        <MenuItem key={sellerOption.id} value={sellerOption.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Icon icon="solar:user-circle-bold" width={20} height={20} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {sellerOption.name}
                              </Typography>
                              {sellerOption.document && (
                                <Typography variant="caption" color="text.secondary">
                                  {sellerOption.document}
                                </Typography>
                              )}
                            </Box>
                            {currentRegister?.user_id === sellerOption.id && (
                              <Chip
                                label="Cajero"
                                size="small"
                                color="primary"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Card>

                {costCenters.length === 0 ? (
                  <Alert severity="info">No hay centros de costo configurados para esta empresa.</Alert>
                ) : (
                  <Card sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                    >
                      <Icon icon="solar:layers-bold-duotone" width={20} />
                      Centro de costo (opcional)
                    </Typography>

                    <FormControl fullWidth>
                      <Select value={costCenterId} onChange={(e) => setCostCenterId(e.target.value)} displayEmpty>
                        <MenuItem value="">Ninguno</MenuItem>
                        {costCenters.map((cc) => (
                          <MenuItem key={cc.id} value={cc.id}>
                            {cc.code ? `${cc.code} · ${cc.name}` : cc.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Card>
                )}

                {/* Date and Time */}
                <Card sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="solar:calendar-date-bold-duotone" width={20} />
                    Fecha y Hora de Venta
                  </Typography>
                  <DateTimePicker
                    label="Fecha y Hora"
                    value={saleDate}
                    onChange={(newValue) => setSaleDate(newValue || new Date())}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Card>

                {/* Tax Configuration */}
                <Card sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="solar:calculator-bold-duotone" width={20} />
                    Configuración de Impuestos
                  </Typography>
                  <TextField
                    fullWidth
                    label="Tasa de Impuesto (%)"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setTaxRate(19)}
                            disabled={taxRate === 19}
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
                <Card sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="solar:tag-price-bold-duotone" width={20} />
                    Descuento
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label="Porcentaje"
                        variant={discountType === 'percentage' ? 'filled' : 'outlined'}
                        onClick={() => setDiscountType('percentage')}
                        color={discountType === 'percentage' ? 'primary' : 'default'}
                      />
                      <Chip
                        label="Valor Fijo"
                        variant={discountType === 'amount' ? 'filled' : 'outlined'}
                        onClick={() => setDiscountType('amount')}
                        color={discountType === 'amount' ? 'primary' : 'default'}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label={discountType === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      inputProps={{
                        min: 0,
                        step: discountType === 'percentage' ? 0.1 : 100
                      }}
                    />
                  </Stack>
                </Card>

                {/* Notes */}
                <Card sx={{ p: 2.5, bgcolor: 'background.paper' }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                  >
                    <Icon icon="solar:notes-bold-duotone" width={20} />
                    Observaciones
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales sobre la venta..."
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
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  top: 24
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Icon icon="solar:bill-list-bold-duotone" width={24} />
                  Resumen de Venta
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Products Summary */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    PRODUCTOS ({saleWindow.products.length})
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1 }}>
                    <Stack spacing={1}>
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
                            bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent'
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                        bgcolor: 'error.lighter'
                      }}
                    >
                      <Typography variant="body2" color="error.main">
                        Descuento:
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        -{formatCurrency(recalculatedTotals.discount_amount)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Impuestos ({taxRate}%):</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(recalculatedTotals.tax_amount)}
                    </Typography>
                  </Box>

                  <Divider />

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
                    <Typography variant="h6">Total:</Typography>
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
                      bgcolor: 'success.lighter'
                    }}
                  >
                    <Typography variant="body2" color="success.dark">
                      Pagado:
                    </Typography>
                    <Typography variant="body2" color="success.dark" fontWeight="bold">
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
                        bgcolor: 'warning.lighter'
                      }}
                    >
                      <Typography variant="body2" color="warning.dark">
                        Pendiente:
                      </Typography>
                      <Typography variant="body2" color="warning.dark" fontWeight="bold">
                        {formatCurrency(recalculatedTotals.total - totalPaid)}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Customer Info */}
                {saleWindow.customer && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Icon icon="solar:user-bold-duotone" width={18} />
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
                    </Box>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={shouldPrintTicket}
                onChange={(e) => setShouldPrintTicket(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Icon icon="solar:printer-bold-duotone" width={18} />
                <Typography variant="body2">Imprimir ticket</Typography>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              size="large"
              startIcon={<Icon icon="solar:close-circle-bold" />}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm || isCreatingSale}
              size="large"
              startIcon={
                isCreatingSale ? <Icon icon="svg-spinners:180-ring-with-bg" /> : <Icon icon="solar:check-circle-bold" />
              }
              sx={{ minWidth: 160 }}
            >
              {isCreatingSale ? 'Procesando...' : 'Confirmar Venta'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
