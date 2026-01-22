import React, { useState, useEffect, useMemo } from 'react';
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
  const { data: sellersData } = useGetSellersQuery({
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
          setSellerName(currentCashierSeller.full_name || '');
          console.log('✅ Usando cajero actual como vendedor:', currentCashierSeller.full_name);
        } else {
          // Si no se encuentra, usar el primer vendedor disponible
          setSeller(sellers[0].id);
          setSellerName(sellers[0].full_name || '');
          console.log('⚠️ Cajero no está en lista de vendedores, usando primer vendedor:', sellers[0].full_name);
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
      setSellerName(selectedSeller.full_name || '');
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
          pos_type: 'simple' as const, // Tipo de venta (puede ser 'electronic' si tiene documento)
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
            pos_type: 'simple' as const,
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

        <DialogContent sx={{ p: 0, bgcolor: 'background.neutral' }}>
          <Grid container spacing={0}>
            {/* Left Column - Form Data */}
            <Grid
              item
              xs={12}
              md={7}
              sx={{
                p: { xs: 2, md: 3 },
                borderRight: { md: '1px solid' },
                borderColor: { md: 'divider' },
                maxHeight: { md: '70vh' },
                overflowY: 'auto'
              }}
            >
              <Stack spacing={{ xs: 1.5, md: 2 }}>
                {/* Información Principal Section */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1,
                      fontSize: '0.7rem'
                    }}
                  >
                    <Icon icon="solar:document-text-bold" width={14} />
                    Información Principal
                  </Typography>

                  <Card
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Seller Selection */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: 'primary.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon icon="solar:user-check-bold-duotone" width={16} color="primary.main" />
                          </Box>
                          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                            Vendedor Responsable
                          </Typography>
                        </Stack>

                        <FormControl fullWidth size="small">
                          <Select
                            value={seller}
                            onChange={(e) => handleSellerChange(e.target.value)}
                            displayEmpty
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            <MenuItem value="" disabled>
                              {sellers.length === 0 ? 'Cargando vendedores...' : 'Seleccionar vendedor'}
                            </MenuItem>
                            {sellers.map((sellerOption) => (
                              <MenuItem key={sellerOption.id} value={sellerOption.id}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                  <Icon icon="solar:user-circle-bold" width={18} height={18} />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="medium" fontSize="0.85rem">
                                      {sellerOption.full_name}
                                    </Typography>
                                    {sellerOption.document && (
                                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                        {sellerOption.document}
                                      </Typography>
                                    )}
                                  </Box>
                                  {currentRegister?.user_id === sellerOption.id && (
                                    <Chip
                                      label="Cajero"
                                      size="small"
                                      color="primary"
                                      sx={{ fontSize: '0.6rem', height: 18 }}
                                    />
                                  )}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      <Divider />

                      {/* Date and Time */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: 'info.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon icon="solar:calendar-date-bold-duotone" width={16} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                            Fecha y Hora
                          </Typography>
                        </Stack>
                        <DateTimePicker
                          label="Fecha y Hora"
                          value={saleDate}
                          onChange={(newValue) => setSaleDate(newValue || new Date())}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              sx: { bgcolor: 'background.paper' }
                            }
                          }}
                        />
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Configuración Financiera Section */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1,
                      fontSize: '0.7rem'
                    }}
                  >
                    <Icon icon="solar:wallet-money-bold" width={14} />
                    Configuración Financiera
                  </Typography>

                  <Card
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Tax Configuration */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: 'success.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon icon="solar:calculator-bold-duotone" width={16} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                            Impuestos
                          </Typography>
                        </Stack>
                        <TextField
                          fullWidth
                          size="small"
                          label="Tasa de Impuesto (%)"
                          type="number"
                          value={taxRate}
                          onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                          sx={{ bgcolor: 'background.paper' }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => setTaxRate(19)}
                                  disabled={taxRate === 19}
                                  sx={{ fontSize: '0.7rem', py: 0.5 }}
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
                      </Box>

                      <Divider />

                      {/* Discount Section */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: 'warning.lighter',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon icon="solar:tag-price-bold-duotone" width={16} />
                          </Box>
                          <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                            Descuento
                          </Typography>
                        </Stack>
                        <Stack spacing={1.5}>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label="Porcentaje"
                              icon={<Icon icon="solar:percent-bold" width={14} />}
                              variant={discountType === 'percentage' ? 'filled' : 'outlined'}
                              onClick={() => setDiscountType('percentage')}
                              color={discountType === 'percentage' ? 'primary' : 'default'}
                              size="small"
                              sx={{ flex: 1, fontSize: '0.75rem' }}
                            />
                            <Chip
                              label="Valor Fijo"
                              icon={<Icon icon="solar:dollar-bold" width={14} />}
                              variant={discountType === 'amount' ? 'filled' : 'outlined'}
                              onClick={() => setDiscountType('amount')}
                              color={discountType === 'amount' ? 'primary' : 'default'}
                              size="small"
                              sx={{ flex: 1, fontSize: '0.75rem' }}
                            />
                          </Stack>
                          <TextField
                            fullWidth
                            size="small"
                            label={discountType === 'percentage' ? 'Descuento (%)' : 'Descuento ($)'}
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            sx={{ bgcolor: 'background.paper' }}
                            inputProps={{
                              min: 0,
                              step: discountType === 'percentage' ? 0.1 : 100
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </Card>
                </Box>

                {/* Información Adicional Section */}
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mb: 1,
                      fontSize: '0.7rem'
                    }}
                  >
                    <Icon icon="solar:document-add-bold" width={14} />
                    Información Adicional
                  </Typography>

                  <Card
                    variant="outlined"
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack spacing={2}>
                      {/* Cost Center */}
                      {costCenters.length > 0 && (
                        <>
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 1,
                                  bgcolor: 'secondary.lighter',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Icon icon="solar:layers-bold-duotone" width={16} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                                  Centro de Costo
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                  Opcional
                                </Typography>
                              </Box>
                            </Stack>

                            <FormControl fullWidth size="small">
                              <Select
                                value={costCenterId}
                                onChange={(e) => setCostCenterId(e.target.value)}
                                displayEmpty
                                sx={{ bgcolor: 'background.paper' }}
                              >
                                <MenuItem value="">Ninguno</MenuItem>
                                {costCenters.map((cc) => (
                                  <MenuItem key={cc.id} value={cc.id}>
                                    {cc.code ? `${cc.code} · ${cc.name}` : cc.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>

                          <Divider />
                        </>
                      )}

                      {/* Notes */}
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: 'grey.200',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Icon icon="solar:notes-bold-duotone" width={16} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                              Observaciones
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                              Notas adicionales sobre la venta
                            </Typography>
                          </Box>
                        </Stack>
                        <TextField
                          fullWidth
                          multiline
                          size="small"
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Escribe aquí cualquier observación relevante..."
                          sx={{ bgcolor: 'background.paper' }}
                        />
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              </Stack>
            </Grid>

            {/* Right Column - Summary */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                p: { xs: 2, md: 3 },
                bgcolor: 'background.paper',
                maxHeight: { md: '70vh' },
                overflowY: 'auto'
              }}
            >
              <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ position: 'sticky', top: 0 }}>
                {/* Header */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <Box
                      sx={{
                        width: { xs: 32, md: 36 },
                        height: { xs: 32, md: 36 },
                        borderRadius: 1.5,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon icon="solar:bill-list-bold-duotone" width={20} color="#fff" />
                    </Box>
                    <Box>
                      <Typography variant="h1" fontWeight={700} fontSize={{ xs: '1rem', md: '1.45rem' }}>
                        Resumen de Venta
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                        Revisa los detalles antes de confirmar
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                {/* Customer Info - destacado arriba */}
                {saleWindow.customer && (
                  <Card
                    sx={{
                      px: { xs: 1.5, md: 2 },
                      borderRadius: 1.5,
                      bgcolor: 'primary.lighter',
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: { xs: 36, md: 42 },
                          height: { xs: 36, md: 42 },
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon icon="solar:user-bold-duotone" width={20} color="#fff" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}
                        >
                          Cliente
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="primary.darker" fontSize="0.9rem">
                          {saleWindow.customer.name}
                        </Typography>
                        {saleWindow.customer.document && (
                          <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                            {saleWindow.customer.document_type}: {saleWindow.customer.document}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                )}

                {/* Products Summary */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.7rem' }}
                    >
                      Productos
                    </Typography>
                    <Chip
                      label={`${saleWindow.products.length} ${saleWindow.products.length === 1 ? 'item' : 'items'}`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600, height: 22, fontSize: '0.7rem' }}
                    />
                  </Stack>
                  <Paper
                    variant="outlined"
                    sx={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      borderRadius: 1.5,
                      '&::-webkit-scrollbar': {
                        width: '6px'
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'primary.main',
                        borderRadius: '3px'
                      }
                    }}
                  >
                    <Stack spacing={0}>
                      {saleWindow.products.map((product, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            py: 1.5,
                            px: 1.5,
                            borderBottom: index < saleWindow.products.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'action.hover'
                            }
                          }}
                        >
                          <Box sx={{ flex: 1, mr: 1.5 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                              {product.name}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${product.quantity}x`}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.darker',
                                  fontWeight: 700
                                }}
                              />
                              <Typography variant="caption" color="text.secondary" fontSize="0.7rem">
                                {formatCurrency(product.price)}
                              </Typography>
                            </Stack>
                          </Box>
                          <Typography variant="body2" fontWeight={700} color="primary.main" fontSize="0.9rem">
                            {formatCurrency(product.price * product.quantity)}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Box>

                <Divider />

                {/* Totals Breakdown */}
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                      Subtotal
                    </Typography>
                    <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                      {formatCurrency(recalculatedTotals.subtotal)}
                    </Typography>
                  </Box>

                  {recalculatedTotals.discount_amount > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        px: 1.5,
                        borderRadius: 1,
                        bgcolor: 'error.lighter',
                        border: '1px dashed',
                        borderColor: 'error.main'
                      }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Icon icon="solar:tag-price-bold" width={16} color="error.main" />
                        <Typography variant="body2" fontWeight={600} color="error.main" fontSize="0.8rem">
                          Descuento
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="error.main" fontWeight={700} fontSize="0.85rem">
                        -{formatCurrency(recalculatedTotals.discount_amount)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" fontSize="0.85rem">
                      Impuestos ({taxRate}%)
                    </Typography>
                    <Typography variant="body2" fontWeight={600} fontSize="0.85rem">
                      {formatCurrency(recalculatedTotals.tax_amount)}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 0.5 }} />

                  {/* Total Principal */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: { xs: 1, md: 1 },
                      px: { xs: 2, md: 2.5 },
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      boxShadow: (theme) => `0 4px 12px ${theme.palette.primary.main}40`
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.contrastText"
                      fontSize={{ xs: '1rem', md: '1.15rem' }}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color="primary.contrastText"
                      fontSize={{ xs: '1.2rem', md: '1.4rem' }}
                    >
                      {formatCurrency(recalculatedTotals.total)}
                    </Typography>
                  </Box>

                  {/* Payment Status */}
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1,
                        px: 1.5,
                        borderRadius: 1,
                        bgcolor: 'success.lighter',
                        border: '1px solid',
                        borderColor: 'success.main'
                      }}
                    >
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Icon icon="solar:check-circle-bold" width={16} />
                        <Typography variant="body2" fontWeight={600} color="success.darker" fontSize="0.8rem">
                          Pagado
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="success.darker" fontWeight={700} fontSize="0.85rem">
                        {formatCurrency(totalPaid)}
                      </Typography>
                    </Box>

                    {totalPaid < recalculatedTotals.total && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          px: 1.5,
                          borderRadius: 1,
                          bgcolor: 'warning.lighter',
                          border: '1px solid',
                          borderColor: 'warning.main'
                        }}
                      >
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Icon icon="solar:clock-circle-bold" width={16} />
                          <Typography variant="body2" fontWeight={600} color="warning.darker" fontSize="0.8rem">
                            Pendiente
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="warning.darker" fontWeight={700} fontSize="0.85rem">
                          {formatCurrency(recalculatedTotals.total - totalPaid)}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{ p: { xs: 2, md: 2.5 }, gap: { xs: 1.5, md: 2 }, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={shouldPrintTicket}
                onChange={(e) => setShouldPrintTicket(e.target.checked)}
                color="primary"
                size="small"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Icon icon="solar:printer-bold-duotone" width={16} />
                <Typography variant="body2" fontSize="0.85rem">
                  Imprimir ticket
                </Typography>
              </Box>
            }
          />
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 } }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              size="medium"
              startIcon={<Icon icon="solar:close-circle-bold" width={18} />}
              sx={{ fontSize: '0.85rem' }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm || isCreatingSale}
              size="medium"
              startIcon={
                isCreatingSale ? (
                  <Icon icon="svg-spinners:180-ring-with-bg" width={18} />
                ) : (
                  <Icon icon="solar:check-circle-bold" width={18} />
                )
              }
              sx={{ fontSize: '0.85rem' }}
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
