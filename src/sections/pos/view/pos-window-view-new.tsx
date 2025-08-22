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

interface Props {
  sale: SaleWindow;
  openDrawer: boolean;
  hiddenDrawer: () => void;
}

export default function PosWindowView({ sale, openDrawer, hiddenDrawer }: Props) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { availablePaymentMethods } = useAppSelector((state) => state.pos);

  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(sale.customer);

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  // Update customer in Redux when selected
  useEffect(() => {
    if (selectedCustomer !== sale.customer) {
      dispatch(setCustomerToSaleWindow({ windowId: sale.id, customer: selectedCustomer }));
    }
  }, [selectedCustomer, sale.customer, sale.id, dispatch]);

  const handleAddProduct = (product: Product) => {
    dispatch(addProductToSaleWindow({ windowId: sale.id, product }));
  };

  const handleRemoveProduct = (productId: number) => {
    dispatch(removeProductFromSaleWindow({ windowId: sale.id, productId }));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    dispatch(updateProductQuantity({ windowId: sale.id, productId, quantity }));
  };

  const handleAddPayment = (payment: PaymentMethod) => {
    dispatch(addPaymentToSaleWindow({ windowId: sale.id, payment }));
    setOpenPaymentDialog(false);
  };

  const handleRemovePayment = (paymentId: string) => {
    dispatch(removePaymentFromSaleWindow({ windowId: sale.id, paymentId }));
  };

  const handleCompleteSale = () => {
    if (canCloseSaleWindow(sale)) {
      dispatch(
        completeSale({
          windowId: sale.id,
          pos_type: selectedCustomer && selectedCustomer.document ? 'electronic' : 'simple'
        })
      );
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
          width: openDrawer
            ? isLargeScreen
              ? `calc(100% - ${drawerWidthLg}) !important`
              : `calc(100% - ${drawerWidth}) !important`
            : '100%',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        {/* Product Grid */}
        <PosProductGrid products={mockProducts} onAddProduct={handleAddProduct} />
      </Grid>

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
                    color={
                      sale.status === 'paid' ? 'success' : sale.status === 'pending_payment' ? 'warning' : 'default'
                    }
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
                options={[defaultCustomer, ...mockCustomers]}
                getOptionLabel={(option) => option.name}
                value={selectedCustomer}
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
                  onClick={handleCompleteSale}
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
    </>
  );
}
