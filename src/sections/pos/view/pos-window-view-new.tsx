/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
// @mui
import {
  Box,
  Card,
  CardHeader,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  Button,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Paper
} from '@mui/material';
import { Stack } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';

// components
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

// redux & utils
import {
  addProductToSaleWindow,
  removeProductFromSaleWindow,
  updateProductQuantity,
  setCustomerToSaleWindow,
  addPaymentToSaleWindow,
  removePaymentFromSaleWindow,
  completeSale,
  type SaleWindow,
  type Product,
  type Customer,
  type PaymentMethod
} from 'src/redux/pos/posSlice';
import {
  formatCurrency,
  getPaymentMethodName,
  getPaymentMethodIcon,
  canCloseSaleWindow,
  getRemainingAmount
} from 'src/redux/pos/posUtils';
import { mockProducts, mockCustomers, defaultCustomer } from 'src/redux/pos/mockData';

// components
import PosProductGrid from '../pos-product-grid';
import PosPaymentDialog from '../pos-payment-dialog';
import PosSaleConfirmDialog from '../pos-sale-confirm-dialog';
import PosCartIcon from '../pos-cart-icon';

interface Props {
  sale: SaleWindow;
  openDrawer: boolean;
  hiddenDrawer: () => void;
}

export default function PosWindowView({ sale, openDrawer, hiddenDrawer }: Props) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { availablePaymentMethods, currentRegister } = useAppSelector((state) => state.pos);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openSaleConfirmDialog, setOpenSaleConfirmDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(sale.customer);
  const [productsLoading, setProductsLoading] = useState(true);

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  // Update customer in Redux when selected
  useEffect(() => {
    if (selectedCustomer !== sale.customer) {
      dispatch(setCustomerToSaleWindow({ windowId: sale.id, customer: selectedCustomer }));
    }
  }, [selectedCustomer, sale.customer, sale.id, dispatch]);

  // Simulate loading for products (in a real app, this would be actual API loading)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddProduct = (product: Product) => {
    dispatch(addProductToSaleWindow({ windowId: sale.id, product }));
  };

  const handleRemoveProduct = (productId: number) => {
    dispatch(removeProductFromSaleWindow({ windowId: sale.id, productId }));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    dispatch(updateProductQuantity({ windowId: sale.id, productId, quantity }));
  };

  const handleAddPayment = (payment: PaymentMethod, openCashDrawer?: boolean) => {
    dispatch(addPaymentToSaleWindow({ windowId: sale.id, payment }));
    setOpenPaymentDialog(false);

    // Show cash drawer simulation for demo
    if (openCashDrawer) {
      // eslint-disable-next-line no-alert
      alert('🔓 Cajón abierto automáticamente para entregar el cambio');
    }
  };

  const handleRemovePayment = (paymentId: string) => {
    dispatch(removePaymentFromSaleWindow({ windowId: sale.id, paymentId }));
  };

  const handleInitiateCompleteSale = () => {
    if (canCloseSaleWindow(sale)) {
      setOpenSaleConfirmDialog(true);
    }
  };

  const handleConfirmSale = (saleData: {
    seller_id?: string;
    seller_name: string;
    sale_date: Date;
    tax_rate: number;
    discount_percentage?: number;
    discount_amount?: number;
    notes?: string;
  }) => {
    // Convertir sale_date a string para Redux serialization
    const posType: 'electronic' | 'simple' = selectedCustomer && selectedCustomer.document ? 'electronic' : 'simple';
    const saleDataForRedux = {
      windowId: sale.id,
      pos_type: posType,
      seller_id: saleData.seller_id,
      seller_name: saleData.seller_name,
      sale_date: saleData.sale_date.toISOString(), // Convertir a string para Redux
      tax_rate: saleData.tax_rate,
      discount_percentage: saleData.discount_percentage,
      discount_amount: saleData.discount_amount,
      notes: saleData.notes
    };

    const saleCompleted = dispatch(completeSale(saleDataForRedux));

    setOpenSaleConfirmDialog(false);

    // Print receipt after successful completion
    if (saleCompleted) {
      setTimeout(() => {
        // Import dynamically to avoid circular dependencies
        import('../pos-print-receipt')
          .then(({ printReceipt }) => {
            const completedSale = {
              id: `sale_${Date.now()}`,
              sale_window_id: sale.id,
              register_id: currentRegister?.id || 'unknown',
              customer: selectedCustomer,
              products: sale.products,
              payments: sale.payments,
              subtotal: sale.subtotal,
              tax_amount: sale.tax_amount,
              total: sale.total,
              created_at: new Date().toISOString(),
              pos_type: selectedCustomer && selectedCustomer.document ? 'electronic' : 'simple',
              notes: saleData.notes,
              seller_id: saleData.seller_id,
              seller_name: saleData.seller_name,
              sale_date: saleData.sale_date.toISOString(),
              discount_percentage: saleData.discount_percentage,
              discount_amount: saleData.discount_amount
            } as any;

            // Por el momento, SIEMPRE imprimir ticket independientemente del tipo
            const shouldPrintTicket = true; // Forzar impresión siempre //TODO: cuando se implemente el POS electrónico, cambiar a false

            if (shouldPrintTicket) {
              console.log('Imprimiendo ticket para venta:', completedSale.id);
              printReceipt({
                sale: completedSale,
                registerInfo: {
                  pdv_name: currentRegister?.pdv_name || 'PDV Principal',
                  user_name: saleData.seller_name || 'Usuario'
                }
              });
            } else {
              console.log('Venta electrónica - no se imprime ticket físico');
            }
          })
          .catch((error) => {
            console.error('Error al importar el módulo de impresión:', error);
          });
      }, 500);
    }
  };

  const remainingAmount = getRemainingAmount(sale);
  const canComplete = canCloseSaleWindow(sale);

  return (
    <>
      <Grid
        item
        xs={12}
        sx={{
          width: (() => {
            if (!openDrawer) return '100%';
            return isLargeScreen
              ? `calc(100% - ${drawerWidthLg}) !important`
              : `calc(100% - ${drawerWidth}) !important`;
          })(),
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        {/* Product Grid */}
        <PosProductGrid products={mockProducts} onAddProduct={handleAddProduct} loading={productsLoading} />
      </Grid>
      <PosCartIcon
        onClick={hiddenDrawer}
        rightDrawer={isLargeScreen ? (openDrawer ? drawerWidthLg : 0) : openDrawer ? drawerWidth : 0}
        totalItems={sale.products.length}
      />
      {/* Right Drawer - Cart & Checkout */}
      <Drawer
        anchor="right"
        open={openDrawer}
        variant="persistent"
        PaperProps={{
          sx: {
            width: isLargeScreen ? drawerWidthLg : drawerWidth,
            borderLeft: `1px solid ${theme.palette.divider}`,
            top: 0,
            height: '100%'
          }
        }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">
                  {sale.name}
                  <Chip
                    size="small"
                    label={sale.status}
                    color={(() => {
                      if (sale.status === 'paid') return 'success';
                      if (sale.status === 'pending_payment') return 'warning';
                      return 'default';
                    })()}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <IconButton onClick={hiddenDrawer}>
                  <Icon icon="mdi:close" />
                </IconButton>
              </Stack>
            }
            sx={{ pb: 1 }}
          />

          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Customer Selection */}
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Cliente
              </Typography>
              <Autocomplete
                size="small"
                options={[defaultCustomer, ...mockCustomers] as any}
                getOptionLabel={(option) => option.name}
                value={selectedCustomer as any}
                onChange={(_, newValue) => setSelectedCustomer(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Seleccionar cliente"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Icon icon="mdi:account" style={{ marginRight: 8, opacity: 0.6 }} />
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.document && (
                        <Typography variant="caption" color="text.secondary">
                          {option.document_type}: {option.document}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
              />
            </Box>

            <Divider />

            {/* Products List */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                Productos ({sale.products.length})
              </Typography>

              {sale.products.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Icon icon="mdi:cart-outline" style={{ fontSize: '48px', opacity: 0.3 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No hay productos agregados
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {sale.products.map((product) => (
                    <ListItem key={product.id} divider>
                      <ListItemText
                        primary={product.name}
                        secondary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(product.price)} x
                            </Typography>
                            <TextField
                              size="small"
                              type="number"
                              value={product.quantity}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value, 10);
                                if (quantity > 0) {
                                  handleUpdateQuantity(product.id, quantity);
                                }
                              }}
                              inputProps={{ min: 1, style: { width: '60px', textAlign: 'center' } }}
                              sx={{ '& .MuiOutlinedInput-root': { height: '28px' } }}
                            />
                            <Typography variant="body2" fontWeight="bold">
                              = {formatCurrency(product.price * product.quantity)}
                            </Typography>
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleRemoveProduct(product.id)}>
                          <Icon icon="mdi:delete-outline" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Divider />

            {/* Totals */}
            <Box sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(sale.subtotal)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">IVA:</Typography>
                  <Typography variant="body2">{formatCurrency(sale.tax_amount)}</Typography>
                </Stack>
                {sale.discount_amount && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="success.main">
                      Descuento:
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -{formatCurrency(sale.discount_amount)}
                    </Typography>
                  </Stack>
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(sale.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Payments */}
            <Box sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Pagos</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Icon icon="mdi:credit-card-plus" />}
                  onClick={() => setOpenPaymentDialog(true)}
                  disabled={sale.products.length === 0 || sale.total <= 0}
                >
                  Agregar Pago
                </Button>
              </Stack>

              {sale.payments.length > 0 && (
                <List dense>
                  {sale.payments.map((payment) => (
                    <ListItem key={payment.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Icon icon={getPaymentMethodIcon(payment.method)} />
                            <Typography variant="body2">{getPaymentMethodName(payment.method)}</Typography>
                          </Stack>
                        }
                        secondary={formatCurrency(payment.amount)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small" onClick={() => handleRemovePayment(payment.id)}>
                          <Icon icon="mdi:delete-outline" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              {remainingAmount > 0 && (
                <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: 'warning.lighter' }}>
                  <Typography variant="body2" color="warning.dark">
                    Pendiente: {formatCurrency(remainingAmount)}
                  </Typography>
                </Paper>
              )}
            </Box>

            <Divider />

            {/* Actions */}
            <Box sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={!canComplete}
                  onClick={handleInitiateCompleteSale}
                  startIcon={<Icon icon="mdi:check" />}
                >
                  {canComplete ? 'Completar Venta' : 'Faltan Productos o Pagos'}
                </Button>

                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" fullWidth startIcon={<Icon icon="mdi:content-save" />}>
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    color="error"
                    startIcon={<Icon icon="mdi:cancel" />}
                  >
                    Cancelar
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Card>
      </Drawer>

      {/* Payment Dialog */}
      <PosPaymentDialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        onAddPayment={handleAddPayment}
        remainingAmount={remainingAmount}
        paymentMethods={availablePaymentMethods}
      />

      {/* Sale Confirmation Dialog */}
      <PosSaleConfirmDialog
        open={openSaleConfirmDialog}
        onClose={() => setOpenSaleConfirmDialog(false)}
        onConfirm={handleConfirmSale}
        saleWindow={sale}
      />
    </>
  );
}
