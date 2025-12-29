// ========================================
// 📥 SALE DRAFTS LOADER HOOK
// ========================================

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { useLazyGetSaleDraftsQuery, useLazyGetSaleDraftQuery } from 'src/redux/services/posApi';
import { addSaleWindowFromDraft } from 'src/redux/pos/posSlice';
import { enqueueSnackbar } from 'notistack';

/**
 * Hook para cargar borradores de ventas desde el backend al iniciar el POS
 *
 * Características:
 * - Carga automática al montar (si hay caja abierta)
 * - Solo carga drafts con status 'active'
 * - Obtiene el detalle completo de cada draft
 * - Convierte drafts del backend a SaleWindows en Redux
 * - Maneja errores silenciosamente
 */
export function useSaleDraftsLoader() {
  const dispatch = useAppDispatch();
  const currentRegister = useAppSelector((state) => state.pos.currentRegister);
  const salesWindows = useAppSelector((state) => state.pos.salesWindows);

  // Flag para evitar cargas múltiples
  const hasLoadedRef = useRef(false);
  const [loadedWindowsCount, setLoadedWindowsCount] = useState(0);

  const [fetchDrafts, { isLoading: isLoadingList }] = useLazyGetSaleDraftsQuery();
  const [fetchDraftDetail, { isLoading: isLoadingDetail }] = useLazyGetSaleDraftQuery();

  /**
   * Cargar drafts desde el backend
   */
  const loadDrafts = useCallback(async () => {
    if (!currentRegister?.pdv_id) {
      console.log('⏭️ No se cargan drafts: No hay PDV activo');
      return { success: false, count: 0 };
    }

    // Evitar cargas duplicadas
    if (hasLoadedRef.current) {
      console.log('⏭️ Drafts ya cargados, omitiendo...');
      return { success: true, count: loadedWindowsCount };
    }

    try {
      console.log('📥 Cargando drafts desde backend...');

      const result = await fetchDrafts({
        pdv_id: currentRegister.pdv_id,
        status: 'active',
        limit: 50
      }).unwrap();

      // Marcar como cargado
      hasLoadedRef.current = true;

      if (result.items && result.items.length > 0) {
        console.log(`✅ ${result.items.length} drafts encontrados, cargando detalles...`);

        let loadedCount = 0;

        // Cargar el detalle completo de cada draft
        for (const draftSummary of result.items) {
          try {
            // Obtener detalle completo del draft
            const draft = await fetchDraftDetail(draftSummary.id).unwrap();

            // Mapear productos del draft
            const products = (draft.items || []).map((item: any) => ({
              id: item.product_id,
              name: item.product_name || 'Producto',
              sku: item.sku || '',
              quantity: item.quantity,
              price: item.unit_price,
              tax_rate: 0.19, // Default tax rate
              discount: item.discount || 0
            }));

            // Mapear pagos del draft
            const payments = (draft.payments || []).map((payment: any, index: number) => ({
              id: `payment_${index}`,
              method: payment.method.toLowerCase() as any,
              amount: payment.amount,
              reference: payment.reference
            }));

            // Mapear cliente si existe
            let customer = null;
            if (draft.customer_id && draft.customer_name) {
              customer = {
                id: draft.customer_id,
                name: draft.customer_name
              };
            }

            // Convertir strings decimales a números
            const subtotal = parseFloat(draft.subtotal || '0');
            const tax_amount = parseFloat(draft.tax || '0');
            const total = parseFloat(draft.total || '0');

            // Agregar ventana desde draft
            dispatch(
              addSaleWindowFromDraft({
                draft_id: draft.id,
                window_id: draft.window_id || draft.id,
                name: draft.window_name || `Venta ${draft.window_number}`,
                products,
                customer,
                seller_id: draft.seller_id,
                seller_name: draft.seller_name,
                payments,
                subtotal,
                tax_amount,
                total,
                notes: draft.notes || undefined,
                created_at: draft.created_at || new Date().toISOString(),
                updated_at: draft.updated_at
              })
            );

            loadedCount++;
          } catch (detailError) {
            console.error(`❌ Error cargando detalle del draft ${draftSummary.id}:`, detailError);
          }
        }

        setLoadedWindowsCount(loadedCount);

        enqueueSnackbar(`${loadedCount} venta(s) recuperada(s)`, {
          variant: 'info',
          autoHideDuration: 3000
        });

        return { success: true, count: loadedCount };
      }
      console.log('ℹ️ No hay drafts pendientes');
      return { success: true, count: 0 };
    } catch (err: any) {
      console.error('❌ Error cargando drafts:', err);
      // No mostrar error al usuario si es 404 (no hay drafts)
      if (err?.status !== 404) {
        enqueueSnackbar('Error al recuperar ventas pendientes', {
          variant: 'error'
        });
      }
      return { success: false, count: 0 };
    }
  }, [currentRegister?.pdv_id, fetchDrafts, fetchDraftDetail, dispatch, loadedWindowsCount]);

  /**
   * Cargar drafts automáticamente al montar el componente
   * Solo la primera vez que hay PDV activo
   */
  useEffect(() => {
    const shouldLoadDrafts =
      currentRegister?.pdv_id && // Hay PDV activo
      currentRegister?.status === 'open' && // Caja está abierta
      !hasLoadedRef.current; // No se ha cargado antes

    if (shouldLoadDrafts) {
      console.log('🔄 Cargando drafts iniciales...', {
        pdv_id: currentRegister.pdv_id,
        ventanas_actuales: salesWindows.length
      });

      // Pequeño delay para asegurar que el registro esté completamente sincronizado
      const timer = setTimeout(() => {
        loadDrafts();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentRegister?.pdv_id, currentRegister?.status]);

  return {
    isLoadingDrafts: isLoadingList || isLoadingDetail,
    loadedWindowsCount,
    loadDrafts, // Exportar para uso manual si es necesario
    reloadDrafts: () => {
      hasLoadedRef.current = false; // Reset flag
      setLoadedWindowsCount(0);
      loadDrafts();
    }
  };
}
