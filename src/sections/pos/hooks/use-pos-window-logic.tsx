import { useState, useEffect, useMemo, useCallback } from 'react';
// redux
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
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
import { canCloseSaleWindow, getRemainingAmount } from 'src/redux/pos/posUtils';

interface UsePosWindowLogicProps {
  sale: SaleWindow;
}

export const usePosWindowLogic = ({ sale }: UsePosWindowLogicProps) => {
  const dispatch = useAppDispatch();
  const { availablePaymentMethods, currentRegister } = useAppSelector((state) => state.pos);

  // State
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openSaleConfirmDialog, setOpenSaleConfirmDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(sale.customer);
  const [productsLoading, setProductsLoading] = useState(true);

  // Computed values
  const remainingAmount = useMemo(() => getRemainingAmount(sale), [sale]);
  const canComplete = useMemo(() => canCloseSaleWindow(sale), [sale]);
  const canAddPayment = useMemo(() => sale.products.length > 0 && sale.total > 0, [sale.products.length, sale.total]);

  // Update customer in Redux when selected
  useEffect(() => {
    if (selectedCustomer !== sale.customer) {
      dispatch(setCustomerToSaleWindow({ windowId: sale.id, customer: selectedCustomer }));
    }
  }, [selectedCustomer, sale.customer, sale.id, dispatch]);

  // Simulate loading for products
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handlers
  const handleAddProduct = useCallback(
    (product: Product) => {
      dispatch(addProductToSaleWindow({ windowId: sale.id, product }));
    },
    [dispatch, sale.id]
  );

  const handleRemoveProduct = useCallback(
    (productId: number) => {
      dispatch(removeProductFromSaleWindow({ windowId: sale.id, productId }));
    },
    [dispatch, sale.id]
  );

  const handleUpdateQuantity = useCallback(
    (productId: number, quantity: number) => {
      dispatch(updateProductQuantity({ windowId: sale.id, productId, quantity }));
    },
    [dispatch, sale.id]
  );

  const handleCustomerChange = useCallback((customer: Customer | null) => {
    setSelectedCustomer(customer);
  }, []);

  const handleOpenPaymentDialog = useCallback(() => {
    setOpenPaymentDialog(true);
  }, []);

  const handleClosePaymentDialog = useCallback(() => {
    setOpenPaymentDialog(false);
  }, []);

  const handleAddPayment = useCallback(
    (payment: PaymentMethod, openCashDrawer?: boolean) => {
      dispatch(addPaymentToSaleWindow({ windowId: sale.id, payment }));
      setOpenPaymentDialog(false);

      if (openCashDrawer) {
        // eslint-disable-next-line no-alert
        alert('🔓 Cajón abierto automáticamente para entregar el cambio');
      }
    },
    [dispatch, sale.id]
  );

  const handleRemovePayment = useCallback(
    (paymentId: string) => {
      dispatch(removePaymentFromSaleWindow({ windowId: sale.id, paymentId }));
    },
    [dispatch, sale.id]
  );

  const handleInitiateCompleteSale = useCallback(() => {
    if (canCloseSaleWindow(sale)) {
      setOpenSaleConfirmDialog(true);
    }
  }, [sale]);

  const handleCloseSaleConfirmDialog = useCallback(() => {
    setOpenSaleConfirmDialog(false);
  }, []);

  const handleConfirmSale = useCallback(
    (saleData: {
      seller_id?: string;
      seller_name: string;
      sale_date: Date;
      tax_rate: number;
      discount_percentage?: number;
      discount_amount?: number;
      notes?: string;
    }) => {
      const posType: 'electronic' | 'simple' = selectedCustomer && selectedCustomer.document ? 'electronic' : 'simple';

      const saleDataForRedux = {
        windowId: sale.id,
        pos_type: posType,
        seller_id: saleData.seller_id,
        seller_name: saleData.seller_name,
        sale_date: saleData.sale_date.toISOString(),
        tax_rate: saleData.tax_rate,
        discount_percentage: saleData.discount_percentage,
        discount_amount: saleData.discount_amount,
        notes: saleData.notes
      };

      const saleCompleted = dispatch(completeSale(saleDataForRedux));
      setOpenSaleConfirmDialog(false);

      if (saleCompleted) {
        setTimeout(() => {
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

              const shouldPrintTicket = true;

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
    },
    [dispatch, sale, selectedCustomer, currentRegister]
  );

  return {
    // State
    openPaymentDialog,
    openSaleConfirmDialog,
    selectedCustomer,
    productsLoading,

    // Computed values
    remainingAmount,
    canComplete,
    canAddPayment,
    availablePaymentMethods,

    // Handlers
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
  };
};
