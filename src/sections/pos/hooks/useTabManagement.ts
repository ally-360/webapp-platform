import { useEffect } from 'react';

/**
 * Hook para manejar la gestión de tabs activos en el POS
 *
 * Este hook se encarga de:
 * - Cambiar al último tab cuando se crea una nueva venta
 * - Seleccionar el primer tab disponible si el actual ya no existe
 * - Mantener la coherencia del estado de tabs activos
 */
export const useTabManagement = (
  salesWindows: any[],
  addingNewSale: boolean,
  setOpenTab: (id: number) => void,
  setAddingNewSale: (value: boolean) => void
) => {
  // Handle new sale tab creation
  useEffect(() => {
    if (addingNewSale && salesWindows.length > 0) {
      setOpenTab(salesWindows[salesWindows.length - 1].id);
      setAddingNewSale(false);
    }
  }, [addingNewSale, salesWindows, setOpenTab, setAddingNewSale]);

  // Handle post-sale window selection
  useEffect(() => {
    if (salesWindows.length > 0) {
      const currentWindowExists = salesWindows.some((window) => window.id === setOpenTab);
      if (!currentWindowExists) {
        setOpenTab(salesWindows[0].id);
      }
    }
  }, [salesWindows, setOpenTab]);
};
