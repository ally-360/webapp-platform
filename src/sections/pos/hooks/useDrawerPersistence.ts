import { useEffect } from 'react';

/**
 * Hook para manejar la persistencia del estado del drawer en localStorage
 *
 * Este hook se encarga de:
 * - Guardar el estado abierto/cerrado del drawer en localStorage
 * - Emitir eventos personalizados para notificar cambios a otros componentes
 * - Manejar errores de acceso al localStorage gracefully
 */
export const useDrawerPersistence = (openDrawer: boolean) => {
  useEffect(() => {
    try {
      localStorage.setItem('pos_open_drawer', openDrawer ? 'true' : 'false');
      window.dispatchEvent(new Event('pos:open-drawer-changed'));
    } catch (error) {
      console.warn('Error saving drawer state to localStorage:', error);
    }
  }, [openDrawer]);
};
