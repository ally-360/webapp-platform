// ========================================
// 🆕 CREATE WINDOW WITH DRAFT HOOK
// ========================================

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { useCreateSaleDraftMutation } from 'src/redux/services/posApi';
import { addSaleWindow, updateWindowSyncStatus } from 'src/redux/pos/posSlice';

/**
 * Hook para crear una ventana de venta y su draft en el backend simultáneamente
 *
 * Esto asegura que:
 * - Cada ventana tenga un draft_id desde el inicio
 * - La persistencia esté activa desde el primer momento
 * - No se pierdan ventas al recargar la página
 */
export function useCreateWindowWithDraft() {
  const dispatch = useAppDispatch();
  const currentRegister = useAppSelector((state) => state.pos.currentRegister);
  const salesWindows = useAppSelector((state) => state.pos.salesWindows);

  const [createDraft, { isLoading }] = useCreateSaleDraftMutation();

  const createNewWindow = useCallback(async () => {
    if (!currentRegister?.pdv_id) {
      console.error('❌ No se puede crear ventana: No hay PDV activo');
      return null;
    }

    // 1. Crear ventana localmente en Redux
    const windowId = Date.now();
    dispatch(addSaleWindow());

    // 2. Crear draft en backend inmediatamente
    try {
      console.log('📝 Creando draft para nueva ventana:', windowId);

      // Determinar el window_number basado en las ventanas existentes
      const windowNumber = salesWindows.length + 1;

      const result = await createDraft({
        window_id: windowId.toString(),
        pdv_id: currentRegister.pdv_id,
        shift_id: currentRegister.shift_id || currentRegister.id, // Usar shift_id si existe, si no usar register_id
        cash_register_id: currentRegister.id,
        window_number: windowNumber,
        items: [], // Ventana vacía inicialmente
        payments: [],
        subtotal: 0,
        tax_total: 0,
        discount_total: 0,
        total_amount: 0,
        pos_type: 'simple',
        frontend_created_at: new Date().toISOString(),
        frontend_modified_at: new Date().toISOString()
      }).unwrap();

      console.log('✅ Draft creado:', result.id);

      // 3. Actualizar Redux con el draft_id
      dispatch(
        updateWindowSyncStatus({
          windowId,
          draft_id: result.id, // Backend usa 'id' no 'draft_id'
          synced: true,
          synced_at: new Date().toISOString()
        })
      );

      return windowId;
    } catch (error: any) {
      console.error('❌ Error creando draft:', error);

      // Marcar error en Redux pero mantener la ventana local
      dispatch(
        updateWindowSyncStatus({
          windowId,
          synced: false,
          sync_error: error?.data?.detail || 'Error al crear borrador'
        })
      );

      return windowId;
    }
  }, [currentRegister?.pdv_id, createDraft, dispatch]);

  return {
    createNewWindow,
    isCreating: isLoading
  };
}
