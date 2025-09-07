import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { completeSale, type SaleWindow, type Customer } from 'src/redux/pos/posSlice';
import { canCloseSaleWindow, getRemainingAmount } from 'src/redux/pos/posUtils';

/**
 * Hook para manejar la completación de ventas
 */
export const useSaleCompletion = (sale: SaleWindow, selectedCustomer: Customer | null) => {
  const dispatch = useAppDispatch();
  const { currentRegister } = useAppSelector((state) => state.pos);
  const [openSaleConfirmDialog, setOpenSaleConfirmDialog] = useState(false);

  const remainingAmount = getRemainingAmount(sale);
  const canComplete = canCloseSaleWindow(sale);

  const handleInitiateCompleteSale = () => {
    if (canComplete) {
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
      sale_date: saleData.sale_date.toISOString(),
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
  };

  const handleCloseSaleConfirmDialog = () => {
    setOpenSaleConfirmDialog(false);
  };

  return {
    openSaleConfirmDialog,
    remainingAmount,
    canComplete,
    handleInitiateCompleteSale,
    handleConfirmSale,
    handleCloseSaleConfirmDialog
  };
};
