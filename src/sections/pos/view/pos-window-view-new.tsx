/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
// @mui
import { Box, Card, Divider, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// redux & utils
import { useAppSelector } from 'src/hooks/store';
import { type SaleWindow } from 'src/redux/pos/posSlice';
import { mockProducts, mockCustomers, defaultCustomer } from 'src/redux/pos/mockData';

// hooks
import {
  useDrawerWidth,
  useCustomerSelection,
  useProductHandlers,
  usePaymentHandlers,
  useSaleCompletion
} from '../hooks';

// components
import PosProductGrid from '../pos-product-grid';
import PosPaymentDialog from '../pos-payment-dialog';
import PosSaleConfirmDialog from '../pos-sale-confirm-dialog';
import PosCartIcon from '../pos-cart-icon';
import PosResponsiveDrawer from '../components/pos-responsive-drawer';
import PosWindowHeader from '../components/pos-window-header';
import PosCustomerSelector from '../components/pos-customer-selector';
import PosProductList from '../components/pos-product-list';
import PosSaleTotals from '../components/pos-sale-totals';
import PosPaymentsList from '../components/pos-payments-list';
import PosSaleActions from '../components/pos-sale-actions';

interface Props {
  sale: SaleWindow;
  openDrawer: boolean;
  hiddenDrawer: () => void;
}

export default function PosWindowView({ sale, openDrawer, hiddenDrawer }: Props) {
  const theme = useTheme();
  const { availablePaymentMethods } = useAppSelector((state) => state.pos);
  const { computeContentWidth, isDrawerPersistent, drawerWidth } = useDrawerWidth();
  const [productsLoading, setProductsLoading] = useState(true);

  // Hooks personalizados
  const { selectedCustomer, handleCustomerChange } = useCustomerSelection(sale);
  const { handleAddProduct, handleRemoveProduct, handleUpdateQuantity } = useProductHandlers(sale);
  const {
    openPaymentDialog,
    handleAddPayment,
    handleRemovePayment,
    handleOpenPaymentDialog,
    handleClosePaymentDialog
  } = usePaymentHandlers(sale);
  const {
    openSaleConfirmDialog,
    remainingAmount,
    canComplete,
    handleInitiateCompleteSale,
    handleConfirmSale,
    handleCloseSaleConfirmDialog
  } = useSaleCompletion(sale, selectedCustomer);

  // Calculate drawer width for cart icon positioning
  const calculateDrawerWidthForIcon = () => {
    if (!openDrawer || !isDrawerPersistent) return 0;
    return typeof drawerWidth === 'number' ? `${drawerWidth}px` : drawerWidth;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Grid
        item
        xs={12}
        sx={{
          width: computeContentWidth(openDrawer),
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        {/* Product Grid */}
        <PosProductGrid products={mockProducts} onAddProduct={handleAddProduct} loading={productsLoading} />
      </Grid>

      {/* Cart Icon positioned relative to drawer width */}
      <PosCartIcon
        onClick={hiddenDrawer}
        rightDrawer={calculateDrawerWidthForIcon()}
        totalItems={sale.products.length}
      />

      {/* Right Drawer - Cart & Checkout */}
      <PosResponsiveDrawer open={openDrawer} onClose={hiddenDrawer}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <PosWindowHeader sale={sale} onClose={hiddenDrawer} />

          {/* Scrollable Content Area */}
          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Customer Selection */}
            <PosCustomerSelector
              selectedCustomer={selectedCustomer}
              customers={[defaultCustomer, ...mockCustomers]}
              onCustomerChange={handleCustomerChange}
            />

            <Divider />

            {/* Products List - This area can scroll */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <PosProductList
                products={sale.products}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveProduct={handleRemoveProduct}
              />
            </Box>

            <Divider />

            {/* Payments - Fixed height section */}
            <PosPaymentsList
              payments={sale.payments}
              remainingAmount={remainingAmount}
              canAddPayment={sale.products.length > 0 && sale.total > 0}
              onAddPayment={handleOpenPaymentDialog}
              onRemovePayment={handleRemovePayment}
            />
          </Box>

          {/* Fixed Bottom Section - Totals and Actions */}
          <Box
            sx={{
              mt: 'auto',
              borderTop: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: 'background.paper'
            }}
          >
            {/* Totals */}
            <PosSaleTotals sale={sale} />

            <Divider />

            {/* Actions */}
            <PosSaleActions canComplete={canComplete} onCompleteSale={handleInitiateCompleteSale} />
          </Box>
        </Card>
      </PosResponsiveDrawer>

      {/* Payment Dialog */}
      <PosPaymentDialog
        open={openPaymentDialog}
        onClose={handleClosePaymentDialog}
        onAddPayment={handleAddPayment}
        remainingAmount={remainingAmount}
        paymentMethods={availablePaymentMethods}
      />

      {/* Sale Confirmation Dialog */}
      <PosSaleConfirmDialog
        open={openSaleConfirmDialog}
        onClose={handleCloseSaleConfirmDialog}
        onConfirm={handleConfirmSale}
        saleWindow={sale}
      />
    </>
  );
}
