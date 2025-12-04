import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { useGetCurrentCashRegisterQuery } from 'src/redux/services/posApi';
import { openRegister } from 'src/redux/pos/posSlice';
import { enqueueSnackbar } from 'notistack';

/**
 * Hook para sincronizar la caja abierta desde el backend
 *
 * Este hook se encarga de:
 * - Obtener el PDV ID del usuario actual
 * - Consultar la caja abierta actual desde el backend
 * - Sincronizar el estado de Redux con la información del backend
 * - Manejo de errores cuando no hay caja abierta (404)
 *
 * Se ejecuta automáticamente al montar el componente y cuando cambia el PDV
 */
export const useSyncCashRegister = () => {
  const dispatch = useAppDispatch();
  const { currentRegister } = useAppSelector((state) => state.pos);

  // ✅ Ref para evitar sync redundantes
  const lastSyncedIdRef = useRef<string | null>(null);

  // Obtener el PDV ID desde el localStorage o del estado actual
  const pdvId = currentRegister?.pdv_id || localStorage.getItem('current_pdv_id');

  // Query para obtener la caja actual (skip si no hay pdv_id)
  const {
    data: cashRegister,
    isLoading,
    error,
    refetch
  } = useGetCurrentCashRegisterQuery(pdvId || '', {
    skip: !pdvId,
    // Refetch cada 5 minutos para mantener sincronizado
    pollingInterval: 300000,
    // Refetch cuando la ventana recupera el foco
    refetchOnFocus: true,
    // Refetch cuando se reconecta la red
    refetchOnReconnect: true
  });

  useEffect(() => {
    if (cashRegister && cashRegister.status === 'open') {
      // ✅ Solo sincronizar si:
      // 1. No hay registro actual en Redux, O
      // 2. El ID del backend es diferente al último sincronizado
      const needsSync = !currentRegister || lastSyncedIdRef.current !== cashRegister.id;

      if (needsSync) {
        console.log('🔄 Sincronizando caja desde backend:', cashRegister.id);

        dispatch(
          openRegister({
            user_id: cashRegister.opened_by,
            user_name: cashRegister.opened_by,
            pdv_id: cashRegister.pdv_id,
            pdv_name: cashRegister.name || 'PDV',
            opening_amount: cashRegister.opening_balance,
            notes: cashRegister.opening_notes
          })
        );

        // ✅ Marcar como sincronizado
        lastSyncedIdRef.current = cashRegister.id;

        // Guardar el PDV ID en localStorage para futuras referencias
        localStorage.setItem('current_pdv_id', cashRegister.pdv_id);
      }
    }
    // ✅ Solo depender de cashRegister y dispatch (NO currentRegister)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashRegister, dispatch]);

  useEffect(() => {
    // Manejar error 404 (no hay caja abierta)
    if (error && 'status' in error && error.status === 404) {
      console.log('No hay caja abierta para este PDV');
      // No mostrar error al usuario, es un estado válido
      // El componente RegisterOpenScreen se encargará de mostrar la UI apropiada
    } else if (error) {
      // Otros errores sí deben notificarse
      console.error('Error al sincronizar caja registradora:', error);
      enqueueSnackbar('Error al sincronizar información de la caja', {
        variant: 'error'
      });
    }
  }, [error]);

  return {
    cashRegister,
    isLoading,
    hasOpenRegister: !!cashRegister && cashRegister.status === 'open',
    error,
    refetch,
    pdvId
  };
};
