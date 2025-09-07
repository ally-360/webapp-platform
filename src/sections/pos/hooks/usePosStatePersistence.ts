import { useEffect } from 'react';
import { POSStorageKeys, saveToLocalStorage } from 'src/redux/pos/posUtils';
import type { POSRegister } from 'src/redux/pos/posSlice';

/**
 * Hook para manejar la persistencia del estado POS en localStorage
 *
 * Este hook se encarga de:
 * - Guardar el registro actual cuando cambia
 * - Guardar las ventanas de venta cuando cambian
 * - Mantener la sincronización entre Redux y localStorage
 */
export const usePosStatePersistence = (currentRegister: POSRegister | null, salesWindows: any[]) => {
  useEffect(() => {
    if (currentRegister) {
      saveToLocalStorage(POSStorageKeys.CURRENT_REGISTER, currentRegister);
    }
  }, [currentRegister]);

  useEffect(() => {
    if (salesWindows) {
      saveToLocalStorage(POSStorageKeys.SALES_WINDOWS, salesWindows);
    }
  }, [salesWindows]);
};
