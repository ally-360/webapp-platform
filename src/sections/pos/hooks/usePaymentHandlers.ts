import { useState } from 'react';
import { useAppDispatch } from 'src/hooks/store';
import {
  addPaymentToSaleWindow,
  removePaymentFromSaleWindow,
  type PaymentMethod,
  type SaleWindow
} from 'src/redux/pos/posSlice';

/**
 * Hook para manejar las acciones de pagos en una ventana de venta
 */
export const usePaymentHandlers = (sale: SaleWindow) => {
  const dispatch = useAppDispatch();
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

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

  const handleOpenPaymentDialog = () => {
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
  };

  return {
    openPaymentDialog,
    handleAddPayment,
    handleRemovePayment,
    handleOpenPaymentDialog,
    handleClosePaymentDialog
  };
};
