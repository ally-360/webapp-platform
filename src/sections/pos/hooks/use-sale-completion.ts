// ========================================
// 🎯 USE SALE COMPLETION HOOK V2
// ========================================
// Hook para completar ventas integrando con backend

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

// Redux
import { useAppDispatch } from 'src/hooks/store';
import { completeSale } from 'src/redux/pos/posSlice.v2';

// RTK Query
import { useCreatePOSSaleMutation } from 'src/redux/services/posApi';

// Types
import type { SaleWindow } from 'src/types/pos';
import { mapSaleWindowToPOSInvoiceCreate } from 'src/types/pos';

// Utils
import { canCloseSaleWindow } from 'src/redux/pos/posUtils.v2';

// ========================================
// 🎣 HOOK
// ========================================

interface UseSaleCompletionOptions {
  pdv_id: string;
  onSuccess?: (invoiceId: string, invoiceNumber: string) => void;
  onError?: (error: string) => void;
}

export function useSaleCompletion({ pdv_id, onSuccess, onError }: UseSaleCompletionOptions) {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [createSale, { isLoading }] = useCreatePOSSaleMutation();

  /**
   * Completar venta enviando al backend
   */
  const completeSaleWindow = useCallback(
    async (window: SaleWindow, seller_id: string) => {
      // Validar que la venta esté lista
      if (!canCloseSaleWindow(window)) {
        const error = 'La venta no puede ser completada. Verifica productos y pagos.';
        enqueueSnackbar(error, { variant: 'error' });
        onError?.(error);
        return { success: false, error };
      }

      try {
        // Mapear ventana a formato del backend
        const saleData = mapSaleWindowToPOSInvoiceCreate(window, seller_id);

        // Enviar al backend
        const response = await createSale({
          pdv_id,
          ...saleData
        }).unwrap();

        // Actualizar Redux con venta completada
        dispatch(
          completeSale({
            windowId: window.id,
            invoiceId: response.id,
            invoiceNumber: response.number
          })
        );

        // Notificar éxito
        enqueueSnackbar(`Venta ${response.number} completada exitosamente`, { variant: 'success' });

        // Callback de éxito
        onSuccess?.(response.id, response.number);

        return {
          success: true,
          invoiceId: response.id,
          invoiceNumber: response.number,
          invoice: response
        };
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Error al completar la venta';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        onError?.(errorMessage);

        return {
          success: false,
          error: errorMessage
        };
      }
    },
    [pdv_id, createSale, dispatch, enqueueSnackbar, onSuccess, onError]
  );

  return {
    completeSaleWindow,
    isCompleting: isLoading
  };
}
