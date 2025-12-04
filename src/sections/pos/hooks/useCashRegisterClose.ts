/**
 * 🔒 useCashRegisterClose Hook
 *
 * Hook personalizado para cerrar caja registradora con:
 * - Arqueo automático
 * - Cálculo de diferencias
 * - Validaciones
 * - Redirección a reporte
 */

import { useCallback } from 'react';
import { useRouter } from 'src/routes/hook/use-router';
import { enqueueSnackbar } from 'notistack';
import { useCloseCashRegisterMutation } from 'src/redux/services/posApi';
import { paths } from 'src/routes/paths';

export interface CloseRegisterData {
  closing_balance: number;
  closing_notes?: string;
}

export function useCashRegisterClose() {
  const router = useRouter();
  const [closeCashRegister, { isLoading }] = useCloseCashRegisterMutation();

  /**
   * Cerrar caja registradora
   *
   * @param registerId - ID de la caja registradora
   * @param data - Datos de cierre
   * @returns Promise con resultado de la operación
   */
  const handleCloseRegister = useCallback(
    async (registerId: string, data: CloseRegisterData) => {
      try {
        const result = await closeCashRegister({
          id: registerId,
          data
        }).unwrap();

        // Guardar register_id para el reporte diario
        localStorage.setItem('last_closed_register_id', registerId);

        // Mostrar notificación de éxito
        enqueueSnackbar('Caja cerrada correctamente', {
          variant: 'success',
          autoHideDuration: 3000
        });

        // Redirigir al reporte diario con el ID
        router.push(`${paths.dashboard.pos}/daily-report/${registerId}`);

        return { success: true, data: result };
      } catch (error: any) {
        console.error('❌ Error al cerrar caja:', error);

        // Mostrar notificación de error
        enqueueSnackbar(error?.data?.message || 'Error al cerrar la caja', {
          variant: 'error',
          autoHideDuration: 5000
        });

        return { success: false, error };
      }
    },
    [closeCashRegister, router]
  );

  return {
    handleCloseRegister,
    isLoading
  };
}
