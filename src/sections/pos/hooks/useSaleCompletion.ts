import { useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { completeSale, type SaleWindow, type Customer } from 'src/redux/pos/posSlice';
import { canCloseSaleWindow, getRemainingAmount } from 'src/redux/pos/posUtils';
import { useCreatePOSSaleMutation } from 'src/redux/services/posApi';
import { enqueueSnackbar } from 'notistack';
import { PaymentMethodType } from 'src/types/pos';

/**
 * Hook para manejar la completación de ventas
 */
export const useSaleCompletion = (sale: SaleWindow, selectedCustomer: Customer | null) => {
  const dispatch = useAppDispatch();
  const { currentRegister } = useAppSelector((state) => state.pos);
  const [openSaleConfirmDialog, setOpenSaleConfirmDialog] = useState(false);
  const [createPOSSale] = useCreatePOSSaleMutation();

  const remainingAmount = getRemainingAmount(sale);
  const canComplete = canCloseSaleWindow(sale);

  // Función auxiliar para mapear métodos de pago
  const mapPaymentMethod = (method: 'cash' | 'card' | 'nequi' | 'transfer' | 'credit'): PaymentMethodType => {
    switch (method) {
      case 'cash':
        return PaymentMethodType.CASH;
      case 'card':
        return PaymentMethodType.CARD;
      case 'transfer':
        return PaymentMethodType.TRANSFER;
      default:
        return PaymentMethodType.OTHER;
    }
  };

  const handleInitiateCompleteSale = () => {
    if (canComplete) {
      setOpenSaleConfirmDialog(true);
    }
  };

  const handleConfirmSale = async (saleData: {
    seller_id?: string;
    seller_name: string;
    sale_date: Date;
    tax_rate: number;
    discount_percentage?: number;
    discount_amount?: number;
    notes?: string;
  }) => {
    try {
      // Convertir sale_date a string para Redux serialization
      const posType: 'electronic' | 'simple' = selectedCustomer && selectedCustomer.document ? 'electronic' : 'simple';

      // Preparar datos para la API del backend
      const backendSaleData = {
        customer_id: selectedCustomer?.id?.toString() || '',
        seller_id: saleData.seller_id || '',
        notes: saleData.notes,
        items: sale.products.map((product) => ({
          product_id: product.id.toString(),
          quantity: product.quantity,
          unit_price: product.price
        })),
        payments: sale.payments.map((payment) => ({
          method: mapPaymentMethod(payment.method),
          amount: payment.amount,
          reference: payment.reference
        }))
      };

      // Crear venta en el backend
      const backendResponse = await createPOSSale(backendSaleData).unwrap();

      // Si la API del backend fue exitosa, actualizar el estado local de Redux
      const saleDataForRedux = {
        windowId: sale.id,
        pos_type: posType,
        seller_id: saleData.seller_id,
        seller_name: saleData.seller_name,
        sale_date: saleData.sale_date.toISOString(),
        tax_rate: saleData.tax_rate,
        discount_percentage: saleData.discount_percentage,
        discount_amount: saleData.discount_amount,
        notes: saleData.notes,
        invoice_number: backendResponse.number // Usar el número de factura del backend
      };

      const saleCompleted = dispatch(completeSale(saleDataForRedux));
      setOpenSaleConfirmDialog(false);

      // Mostrar mensaje de éxito
      enqueueSnackbar(`Venta creada exitosamente. Factura: ${backendResponse.number}`, {
        variant: 'success'
      });

      // Print receipt after successful completion
      if (saleCompleted) {
        setTimeout(() => {
          // Import dynamically to avoid circular dependencies
          import('../pos-print-receipt')
            .then(({ printReceipt }) => {
              const completedSale = {
                id: backendResponse.id,
                sale_window_id: sale.id,
                register_id: currentRegister?.id || 'unknown',
                customer: selectedCustomer,
                products: sale.products,
                payments: sale.payments,
                subtotal: sale.subtotal,
                tax_amount: sale.tax_amount,
                total: sale.total,
                created_at: backendResponse.created_at,
                pos_type: posType,
                notes: saleData.notes,
                seller_id: saleData.seller_id,
                seller_name: saleData.seller_name,
                sale_date: saleData.sale_date.toISOString(),
                discount_percentage: saleData.discount_percentage,
                discount_amount: saleData.discount_amount,
                invoice_number: backendResponse.number
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
    } catch (error: any) {
      console.error('Error al crear la venta:', error);

      // Mostrar mensaje de error específico
      const errorMessage = error?.data?.message || error?.message || 'Error al crear la venta';
      enqueueSnackbar(`Error: ${errorMessage}`, {
        variant: 'error'
      });

      // No cerrar el diálogo para que el usuario pueda intentar de nuevo
      // setOpenSaleConfirmDialog(false);
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
