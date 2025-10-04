import { useEffect } from 'react';
import { useAppDispatch } from 'src/hooks/store';
import { initializeFromStorage } from 'src/redux/pos/posSlice';
import { POSStorageKeys, loadFromLocalStorage } from 'src/redux/pos/posUtils';
import type { POSRegister } from 'src/redux/pos/posSlice';

/**
 * Hook para manejar la inicialización del POS desde localStorage
 *
 * Este hook se encarga de:
 * - Cargar el registro actual desde localStorage
 * - Cargar las ventanas de venta activas
 * - Cargar el historial de ventas completadas
 * - Inicializar el estado de Redux con los datos recuperados
 */
export const usePosInitialization = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedRegister = loadFromLocalStorage(POSStorageKeys.CURRENT_REGISTER) as POSRegister | null;
    const savedWindows = loadFromLocalStorage(POSStorageKeys.SALES_WINDOWS) as any[] | null;
    const savedCompletedSales = loadFromLocalStorage(POSStorageKeys.COMPLETED_SALES) as any[] | null;

    if (savedRegister || savedWindows || savedCompletedSales) {
      dispatch(
        initializeFromStorage({
          currentRegister: savedRegister || undefined,
          salesWindows: savedWindows || undefined,
          completedSales: savedCompletedSales || undefined
        })
      );
    }
  }, [dispatch]);
};
