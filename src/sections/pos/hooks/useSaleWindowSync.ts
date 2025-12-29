// ========================================
// 🔄 SALE WINDOW SYNC HOOK
// ========================================

import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { useCreateSaleDraftMutation, useUpdateSaleDraftMutation } from 'src/redux/services/posApi';
import { updateWindowSyncStatus } from 'src/redux/pos/posSlice';
import type { SaleDraftCreate, SaleDraftUpdate } from 'src/types/pos';

interface SaleWindow {
  id: number;
  draft_id?: string;
  synced?: boolean;
  synced_at?: string;
  has_changes?: boolean;
  products: any[];
  customer: any;
  seller_id?: string;
  seller_name?: string;
  payments: any[];
  subtotal: number;
  tax_amount: number;
  discount_total?: number;
  total: number;
  status: string;
  created_at: string;
  last_modified?: string;
  notes?: string;
  pos_type?: 'simple' | 'electronic';
}

interface UseSaleWindowSyncOptions {
  enabled?: boolean; // Habilitar/deshabilitar sincronización
  debounceMs?: number; // Tiempo de debounce en ms (default: 5000)
}

/**
 * Hook para sincronizar automáticamente ventanas de venta con el backend
 *
 * Características:
 * - Auto-save con debounce (5 segundos por defecto)
 * - Crea nuevo draft o actualiza existente
 * - Solo sincroniza si hay cambios pendientes
 * - Maneja errores silenciosamente
 */
export function useSaleWindowSync(window: SaleWindow | null, options: UseSaleWindowSyncOptions = {}) {
  const { enabled = true, debounceMs = 5000 } = options;

  const dispatch = useAppDispatch();
  const currentRegister = useAppSelector((state) => state.pos.currentRegister);
  const salesWindows = useAppSelector((state) => state.pos.salesWindows);

  const [createDraft, { isLoading: isCreating }] = useCreateSaleDraftMutation();
  const [updateDraft, { isLoading: isUpdating }] = useUpdateSaleDraftMutation();

  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncedDataRef = useRef<string>('');

  /**
   * Mapear SaleWindow del frontend a SaleDraftCreate del backend
   */
  const mapWindowToDraftCreate = useCallback(
    (window: SaleWindow): SaleDraftCreate => {
      const pdv_id = currentRegister?.pdv_id || '';
      const windowNumber = salesWindows.findIndex((w) => w.id === window.id) + 1;

      return {
        window_id: window.id.toString(),
        pdv_id,
        shift_id: currentRegister?.shift_id || currentRegister?.id || '',
        cash_register_id: currentRegister?.id || '',
        window_number: windowNumber > 0 ? windowNumber : 1,
        customer_id: window.customer?.id,
        seller_id: window.seller_id,
        items: window.products.map((p) => ({
          product_id: p.id,
          quantity: p.quantity,
          unit_price: p.price,
          discount: p.discount || 0,
          notes: p.notes
        })),
        payments: window.payments.map((p) => ({
          method: p.method.toUpperCase() as any,
          amount: p.amount,
          reference: p.reference
        })),
        subtotal: window.subtotal,
        tax_total: window.tax_amount,
        discount_total: window.discount_total || 0,
        total_amount: window.total,
        notes: window.notes,
        pos_type: window.pos_type || 'simple',
        frontend_created_at: window.created_at,
        frontend_modified_at: window.last_modified || new Date().toISOString()
      };
    },
    [currentRegister, salesWindows]
  );

  /**
   * Mapear SaleWindow a SaleDraftUpdate (solo campos modificables)
   */
  const mapWindowToDraftUpdate = useCallback(
    (window: SaleWindow): SaleDraftUpdate => ({
      customer_id: window.customer?.id,
      seller_id: window.seller_id,
      items: window.products.map((p) => ({
        product_id: p.id,
        quantity: p.quantity,
        unit_price: p.price,
        discount: p.discount || 0,
        notes: p.notes
      })),
      payments: window.payments.map((p) => ({
        method: p.method.toUpperCase() as any,
        amount: p.amount,
        reference: p.reference
      })),
      subtotal: window.subtotal,
      tax_total: window.tax_amount,
      discount_total: window.discount_total || 0,
      total_amount: window.total,
      notes: window.notes,
      pos_type: window.pos_type || 'simple',
      frontend_modified_at: window.last_modified || new Date().toISOString()
    }),
    []
  );

  /**
   * Sincronizar ventana con el backend
   */
  const syncWindow = useCallback(async () => {
    if (!window || !currentRegister?.pdv_id) {
      return;
    }

    // No sincronizar si no hay draft_id y la ventana está vacía
    if (!window.draft_id && window.products.length === 0 && window.payments.length === 0) {
      console.log('⏭️ Ventana vacía sin draft_id, omitiendo sync');
      return;
    }

    try {
      // Serializar datos actuales para detectar cambios
      const currentData = JSON.stringify({
        products: window.products,
        customer: window.customer,
        payments: window.payments,
        notes: window.notes,
        subtotal: window.subtotal,
        total: window.total
      });

      // No sincronizar si no hay cambios
      if (currentData === lastSyncedDataRef.current && window.synced) {
        console.log('⏭️ Sin cambios, omitiendo sync', {
          synced: window.synced,
          hasProducts: window.products.length > 0,
          hasPayments: window.payments.length > 0,
          hasCustomer: !!window.customer?.id
        });
        return;
      }

      console.log('🔄 Sincronizando ventana...', {
        windowId: window.id,
        draft_id: window.draft_id,
        synced: window.synced,
        last_modified: window.last_modified,
        products: window.products.length,
        payments: window.payments.length,
        customer: window.customer?.id || 'sin cliente',
        total: window.total
      });

      if (window.draft_id) {
        // Actualizar draft existente
        const updateData = mapWindowToDraftUpdate(window);
        await updateDraft({
          draft_id: window.draft_id,
          data: updateData
        }).unwrap();

        // Actualizar estado de sincronización en Redux
        dispatch(
          updateWindowSyncStatus({
            windowId: window.id,
            synced: true,
            synced_at: new Date().toISOString(),
            sync_error: undefined
          })
        );

        console.log('✅ Draft actualizado:', window.draft_id);
      } else {
        // Crear nuevo draft
        const createData = mapWindowToDraftCreate(window);
        const result = await createDraft(createData).unwrap();

        // Actualizar Redux con draft_id y estado de sincronización
        dispatch(
          updateWindowSyncStatus({
            windowId: window.id,
            draft_id: result.id, // Backend usa 'id' no 'draft_id'
            synced: true,
            synced_at: new Date().toISOString(),
            sync_error: undefined
          })
        );

        console.log('✅ Draft creado:', result.id);
      }

      // Actualizar referencia de último sync
      lastSyncedDataRef.current = currentData;
    } catch (error: any) {
      console.error('❌ Error sincronizando draft:', error);

      // Guardar error en Redux
      dispatch(
        updateWindowSyncStatus({
          windowId: window.id,
          synced: false,
          sync_error: error?.data?.detail || 'Error de sincronización'
        })
      );
    }
  }, [window, currentRegister, createDraft, updateDraft, mapWindowToDraftCreate, mapWindowToDraftUpdate, dispatch]);

  /**
   * Auto-sync con debounce
   */
  useEffect(() => {
    if (!enabled || !window || window.status === 'paid' || window.status === 'cancelled') {
      return;
    }

    console.log('🔔 useEffect triggered - programando sync en', debounceMs, 'ms', {
      windowId: window.id,
      synced: window.synced,
      last_modified: window.last_modified,
      payments: window.payments.length,
      customer: window.customer?.id
    });

    // Limpiar timeout anterior
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Programar sincronización después del debounce
    syncTimeoutRef.current = setTimeout(() => {
      syncWindow();
    }, debounceMs);

    // Cleanup
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    debounceMs,
    window?.id,
    window?.synced,
    window?.last_modified,
    // Dependencias que disparan cambios (usar JSON.stringify para detectar cambios profundos)
    JSON.stringify(window?.products),
    JSON.stringify(window?.customer),
    JSON.stringify(window?.payments),
    window?.notes,
    window?.subtotal,
    window?.total
  ]);

  return {
    isSyncing: isCreating || isUpdating,
    syncNow: syncWindow // Permitir sincronización manual
  };
}
