/* eslint-disable no-nested-ternary */
import React, { useState, useEffect } from 'react';
// @mui
import { Box, Card, Divider, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// redux & utils
import { useAppSelector, useAppDispatch } from 'src/hooks/store';
import { type SaleWindow, removeSaleWindow } from 'src/redux/pos/posSlice';
import { openPopup } from 'src/redux/inventory/contactsSlice';
import { useDeleteSaleDraftMutation } from 'src/redux/services/posApi';
import { enqueueSnackbar } from 'notistack';

// hooks
import {
  useDrawerWidth,
  useCustomerSelection,
  useProductHandlers,
  usePaymentHandlers,
  useSaleCompletion,
  usePosProducts,
  usePosCustomers
} from '../hooks';
import { useSaleWindowSync } from '../hooks/useSaleWindowSync';

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
  const dispatch = useAppDispatch();
  const { availablePaymentMethods, currentRegister } = useAppSelector((state) => state.pos);
  const { computeContentWidth, isDrawerPersistent, drawerWidth } = useDrawerWidth();
  const [productsLoading, setProductsLoading] = useState(true);

  // Hook para productos reales desde la API, filtrados por PDV actual
  // Usar filtros iniciales para optimizar la carga
  const {
    products,
    isLoading: isLoadingProducts,
    searchProducts,
    filterByCategory,
    filterByBrand,
    updateFilters,
    totalProducts,
    currentPage,
    totalPages,
    hasMore,
    searchTerm,
    isSearchValid,
    minSearchLength
  } = usePosProducts(
    {
      limit: 50, // Cargar 50 productos inicialmente
      is_active: true // Solo productos activos
    },
    currentRegister?.pdv_id
  );

  // Hook para clientes reales desde la API con búsqueda inteligente
  const {
    customers,
    searchCustomers,
    isLoading: isLoadingCustomers,
    searchTerm: customerSearchTerm,
    minSearchLength: customerMinSearchLength,
    isWritingButNotReady: isCustomerWritingButNotReady
  } = usePosCustomers();

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

  // Hook de sincronización con backend (auto-save)
  useSaleWindowSync(sale, {
    enabled: true,
    debounceMs: 5000 // 5 segundos de debounce
  });

  // Hook para eliminar draft
  const [deleteDraft] = useDeleteSaleDraftMutation();

  // Handler para cancelar venta
  const handleCancelSale = async () => {
    // Si tiene draft_id, eliminarlo del backend
    if (sale.draft_id) {
      try {
        await deleteDraft(sale.draft_id).unwrap();
        console.log('✅ Draft eliminado al cancelar:', sale.draft_id);
      } catch (error) {
        console.error('⚠️ Error al eliminar draft (ventana se cerrará igual):', error);
        // No bloquear el cierre de la ventana
      }
    }

    // Cerrar ventana
    dispatch(removeSaleWindow(sale.id));

    // Notificar al usuario
    enqueueSnackbar('Venta cancelada', {
      variant: 'info',
      autoHideDuration: 3000
    });
  };

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

  // Enhanced product handlers with API integration
  const handleProductSearch = (newSearchTerm: string) => {
    searchProducts(newSearchTerm);
  };

  const handleCategoryFilter = (categoryId: string) => {
    filterByCategory(categoryId);
  };

  const handleBrandFilter = (brandId: string) => {
    filterByBrand(brandId);
  };

  const handleBarcodeDetected = (barcode: string) => {
    // Find product by barcode/sku
    const foundProduct = products.find(
      (product) => product.sku === barcode || product.barCode === barcode || product.id?.toString() === barcode
    );

    if (foundProduct) {
      handleAddProduct(foundProduct);
      console.log('Producto encontrado y agregado:', foundProduct.name);
    } else {
      // If not found in current results, search by barcode
      searchProducts(barcode);
      console.log('Buscando producto con código:', barcode);
    }
  };

  const handleLoadMoreProducts = () => {
    if (hasMore && !isLoadingProducts) {
      updateFilters({ page: currentPage + 1 });
    }
  };

  const handleCreateCustomer = () => {
    // Abrir modal global para crear cliente
    dispatch(openPopup());
  };

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
        {/* Enhanced Product Grid with API integration */}
        <PosProductGrid
          products={products}
          onAddProduct={handleAddProduct}
          loading={isLoadingProducts || productsLoading}
          onSearch={handleProductSearch}
          onCategoryFilter={handleCategoryFilter}
          onBrandFilter={handleBrandFilter}
          onBarcodeDetected={handleBarcodeDetected}
          onLoadMore={handleLoadMoreProducts}
          hasMore={hasMore}
          totalProducts={totalProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          searchTerm={searchTerm}
          isSearchValid={isSearchValid}
          minSearchLength={minSearchLength}
          currentPdvId={currentRegister?.pdv_id}
        />
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

          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            <PosCustomerSelector
              selectedCustomer={selectedCustomer}
              customers={customers}
              onCustomerChange={handleCustomerChange}
              onSearchCustomers={searchCustomers}
              onCreateCustomer={handleCreateCustomer}
              isLoading={isLoadingCustomers}
              searchTerm={customerSearchTerm}
              minSearchLength={customerMinSearchLength}
              isWritingButNotReady={isCustomerWritingButNotReady}
            />

            <Divider />

            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <PosProductList
                products={sale.products}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveProduct={handleRemoveProduct}
              />
            </Box>

            <Divider />

            <PosPaymentsList
              payments={sale.payments}
              remainingAmount={remainingAmount}
              canAddPayment={sale.products.length > 0 && sale.total > 0}
              onAddPayment={handleOpenPaymentDialog}
              onRemovePayment={handleRemovePayment}
            />
          </Box>

          <Box
            sx={{
              mt: 'auto',
              borderTop: (t) => `1px solid ${t.palette.divider}`,
              bgcolor: 'background.paper'
            }}
          >
            <PosSaleTotals sale={sale} />

            <Divider />

            <PosSaleActions
              canComplete={canComplete}
              onCompleteSale={handleInitiateCompleteSale}
              onCancel={handleCancelSale}
            />
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
