import React, { memo } from 'react';
// @mui
import { Box, Divider, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// types
import type { SaleWindow } from 'src/redux/pos/posSlice';
// redux & data
import { mockProducts, mockCustomers, defaultCustomer } from 'src/redux/pos/mockData';
// components
import PosProductGrid from '../pos-product-grid';
import PosPaymentDialog from '../pos-payment-dialog';
import PosSaleConfirmDialog from '../pos-sale-confirm-dialog';
import PosCartIcon from '../pos-cart-icon';
// internal components
import {
  PosCartHeader,
  PosCartDrawer,
  PosCustomerSelector,
  PosProductList,
  PosSaleTotals,
  PosPaymentsList,
  PosSaleActions,
  PosProductsContainer,
  usePosWindowLogic
} from '../components/index';

interface Props {
  sale: SaleWindow;
  openDrawer: boolean;
  hiddenDrawer: () => void;
}

const PosWindowViewNew = memo(({ sale, openDrawer, hiddenDrawer }: Props) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  // Custom hook that handles all the logic
  const {
    openPaymentDialog,
    openSaleConfirmDialog,
    selectedCustomer,
    productsLoading,
    remainingAmount,
    canComplete,
    canAddPayment,
    availablePaymentMethods,
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity,
    handleCustomerChange,
    handleOpenPaymentDialog,
    handleClosePaymentDialog,
    handleAddPayment,
    handleRemovePayment,
    handleInitiateCompleteSale,
    handleCloseSaleConfirmDialog,
    handleConfirmSale
  } = usePosWindowLogic({ sale });

  // Prepare customer data
  const allCustomers = [defaultCustomer, ...mockCustomers];

  // Drawer dimensions for cart icon positioning
  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';
  const rightDrawer = (() => {
    if (!openDrawer) return 0;
    return isLargeScreen ? drawerWidthLg : drawerWidth;
  })();

  return (
    <>
      {/* Products Container */}
      <PosProductsContainer openDrawer={openDrawer}>
        <PosProductGrid products={mockProducts} onAddProduct={handleAddProduct} loading={productsLoading} />
      </PosProductsContainer>

      {/* Cart Icon */}
      <PosCartIcon onClick={hiddenDrawer} rightDrawer={rightDrawer} totalItems={sale.products.length} />

      {/* Right Drawer - Cart & Checkout */}
      <PosCartDrawer open={openDrawer}>
        {/* Header */}
        <PosCartHeader sale={sale} onCloseDrawer={hiddenDrawer} />

        {/* Main Content Container */}
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Customer Selection */}
          <PosCustomerSelector
            selectedCustomer={selectedCustomer}
            customers={allCustomers}
            onCustomerChange={handleCustomerChange}
          />

          <Divider />

          {/* Products List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
              Productos ({sale.products.length})
            </Typography>

            <PosProductList
              products={sale.products}
              onRemoveProduct={handleRemoveProduct}
              onUpdateQuantity={handleUpdateQuantity}
            />
          </Box>

          <Divider />

          {/* Totals */}
          <PosSaleTotals sale={sale} />

          <Divider />

          {/* Payments */}
          <PosPaymentsList
            payments={sale.payments}
            remainingAmount={remainingAmount}
            canAddPayment={canAddPayment}
            onAddPayment={handleOpenPaymentDialog}
            onRemovePayment={handleRemovePayment}
          />

          <Divider />

          {/* Actions */}
          <PosSaleActions canComplete={canComplete} onCompleteSale={handleInitiateCompleteSale} />
        </Box>
      </PosCartDrawer>

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
});

PosWindowViewNew.displayName = 'PosWindowViewNew';

export default PosWindowViewNew;
