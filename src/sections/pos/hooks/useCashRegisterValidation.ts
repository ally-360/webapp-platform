/**
 * Hook para validar el estado de la caja registradora
 *
 * Este hook proporciona utilidades para:
 * - Verificar si hay una caja abierta
 * - Prevenir operaciones sin caja abierta
 * - Mostrar alertas al usuario
 */

import { useMemo } from 'react';
import { useAppSelector } from 'src/hooks/store';
import { enqueueSnackbar } from 'notistack';

export const useCashRegisterValidation = () => {
  const { currentRegister } = useAppSelector((state) => state.pos);

  // Validar si hay caja abierta
  const hasOpenRegister = useMemo(() => Boolean(currentRegister?.status === 'open'), [currentRegister?.status]);

  // Validar si tiene los datos mínimos necesarios
  const isRegisterValid = useMemo(
    () => hasOpenRegister && Boolean(currentRegister?.id) && Boolean(currentRegister?.pdv_id),
    [hasOpenRegister, currentRegister?.id, currentRegister?.pdv_id]
  );

  /**
   * Validar antes de realizar una operación que requiere caja abierta
   *
   * @param operationName - Nombre de la operación para el mensaje de error
   * @returns true si la validación pasa, false si no
   */
  const validateRegisterForOperation = (operationName = 'esta operación'): boolean => {
    if (!hasOpenRegister) {
      enqueueSnackbar(`No hay caja abierta. Debes abrir una caja antes de realizar ${operationName}`, {
        variant: 'warning',
        autoHideDuration: 4000
      });
      return false;
    }

    if (!isRegisterValid) {
      enqueueSnackbar(
        'La caja registradora no tiene la información completa. Por favor, cierra sesión y vuelve a abrir caja.',
        {
          variant: 'error',
          autoHideDuration: 5000
        }
      );
      return false;
    }

    return true;
  };

  /**
   * Obtener el PDV ID de la caja actual
   * Retorna null si no hay caja abierta
   */
  const getPdvId = (): string | null => {
    if (!hasOpenRegister || !currentRegister?.pdv_id) {
      return null;
    }
    return currentRegister.pdv_id;
  };

  /**
   * Obtener el ID de la caja actual
   * Retorna null si no hay caja abierta
   */
  const getRegisterId = (): string | null => {
    if (!hasOpenRegister || !currentRegister?.id) {
      return null;
    }
    return currentRegister.id;
  };

  return {
    hasOpenRegister,
    isRegisterValid,
    currentRegister,
    validateRegisterForOperation,
    getPdvId,
    getRegisterId
  };
};
