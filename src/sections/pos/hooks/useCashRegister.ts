import { useState } from 'react';
import { useAppDispatch } from 'src/hooks/store';
import { openRegister, closeRegister } from 'src/redux/pos/posSlice';
import {
  useOpenCashRegisterMutation,
  useCloseCashRegisterMutation,
  useGetRegisterStatusQuery,
  useGetSellersQuery,
  useCreateSellerMutation,
  useLazyGetCashRegistersQuery,
  useLazyGetCurrentShiftQuery
} from 'src/redux/services/posApi';
import { useGetPDVsQuery, type PDV } from 'src/redux/services/pdvsApi';
import { enqueueSnackbar } from 'notistack';
import type { SellerCreate } from 'src/types/pos';

interface RegisterOpenData {
  pdv_id: string;
  pdv_name: string;
  opening_amount: number;
  seller_id?: string;
  seller_name?: string;
  notes?: string;
}

interface RegisterCloseData {
  closing_amount: number;
  notes?: string;
}

/**
 * Hook para manejar operaciones de caja registradora
 */
export const useCashRegister = () => {
  const dispatch = useAppDispatch();
  const [isProcessing, setIsProcessing] = useState(false);

  // RTK Query hooks
  const [openCashRegister] = useOpenCashRegisterMutation();
  const [triggerGetCashRegisters] = useLazyGetCashRegistersQuery();
  const [triggerGetCurrentShift] = useLazyGetCurrentShiftQuery();
  const [closeCashRegister] = useCloseCashRegisterMutation();
  const [createSeller] = useCreateSellerMutation();
  const { data: registerStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useGetRegisterStatusQuery();

  // Obtener lista de PDVs disponibles
  const { data: pdvsData, isLoading: isLoadingPDVs } = useGetPDVsQuery();

  const {
    data: sellersData,
    isLoading: isLoadingSellers,
    refetch: refetchSellers
  } = useGetSellersQuery({
    is_active: true,
    size: 100
  });
  /**
   * Obtener el turno/caja actual para un PDV específico
   */
  const getCurrentShiftForPDV = async (pdv_id: string) => {
    try {
      const currentShift = await triggerGetCurrentShift({ pdv_id }).unwrap();
      return { success: true, data: currentShift };
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Error al obtener turno actual';
      return { success: false, error: errorMessage };
    }
  };
  const handleCreateSeller = async (sellerData: SellerCreate) => {
    try {
      const response = await createSeller(sellerData).unwrap();
      enqueueSnackbar('Vendedor creado exitosamente', { variant: 'success' });
      // Refrescar la lista de vendedores inmediatamente
      try {
        await refetchSellers();
      } catch (_) {
        // no-op: RTK invalidation también debería refrescar
      }
      return { success: true, data: response };
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Error al crear vendedor';
      enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Abre una caja registradora
   */
  const handleOpenRegister = async (registerData: RegisterOpenData) => {
    try {
      setIsProcessing(true);

      // Crear datos para la API del backend
      const backendData = {
        opening_balance: registerData.opening_amount,
        opening_notes: registerData.notes
      };

      // Llamar a la API del backend con pdv_id como query parameter
      let backendResponse: any;
      try {
        backendResponse = await openCashRegister({
          pdv_id: registerData.pdv_id,
          data: backendData
        }).unwrap();
      } catch (error: any) {
        // Detectar caso de caja ya abierta
        const msg = error?.data?.detail || error?.data?.message || error?.message || '';
        const alreadyOpen = /ya existe una caja abierta/i.test(msg) || /existe una caja abierta/i.test(msg);
        if (alreadyOpen) {
          // Intentar usar el endpoint específico de turno actual primero
          try {
            const currentShift = await triggerGetCurrentShift({ pdv_id: registerData.pdv_id }).unwrap();
            if (currentShift && currentShift.status === 'open') {
              // Inicializar con datos del turno actual
              dispatch(
                openRegister({
                  user_id: currentShift.opened_by || 'current_user',
                  user_name: registerData.seller_name || 'Usuario',
                  pdv_id: currentShift.pdv_id,
                  pdv_name: registerData.pdv_name,
                  opening_amount: parseFloat(currentShift.opening_balance) || 0,
                  notes: currentShift.opening_notes
                })
              );
              enqueueSnackbar('Ya había una caja abierta. Usando la existente.', { variant: 'info' });
              refetchStatus();
              return { success: true, data: currentShift };
            }
          } catch (shiftError) {
            // Si no funciona el endpoint de shift, usar fallback anterior
            console.warn('No se pudo obtener turno actual, usando fallback:', shiftError);
          }

          // Fallback: Buscar cajas abiertas para ese PDV y usar la más reciente
          const list = await triggerGetCashRegisters({ page: 1, size: 50 }).unwrap();
          const items = Array.isArray((list as any)?.items) ? (list as any).items : [];
          const openForPDV = items
            .filter((r: any) => r?.pdv_id === registerData.pdv_id && r?.status === 'open')
            .sort((a: any, b: any) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());

          const current = openForPDV[0];
          if (current) {
            // Inicializar estado local con la caja del backend
            dispatch(
              openRegister({
                user_id: current.opened_by || 'current_user',
                user_name: registerData.seller_name || 'Usuario',
                pdv_id: current.pdv_id,
                pdv_name: registerData.pdv_name,
                opening_amount: current.opening_balance,
                notes: current.opening_notes
              })
            );
            enqueueSnackbar('Ya había una caja abierta. Usando la existente.', { variant: 'info' });
            refetchStatus();
            return { success: true, data: current };
          }

          // Si no la encontramos, relanzar error original
          throw error;
        }
        // Otros errores
        throw error;
      }

      // Si la API fue exitosa, actualizar el estado local de Redux
      dispatch(
        openRegister({
          user_id: 'current_user', // TODO: Obtener del contexto de auth
          user_name: registerData.seller_name || 'Usuario',
          pdv_id: registerData.pdv_id,
          pdv_name: registerData.pdv_name,
          opening_amount: registerData.opening_amount,
          notes: registerData.notes
        })
      );

      // Mostrar mensaje de éxito
      enqueueSnackbar('Caja abierta exitosamente', {
        variant: 'success'
      });

      // Actualizar el estado del registro
      refetchStatus();

      return { success: true, data: backendResponse };
    } catch (error: any) {
      console.error('Error al abrir la caja:', error);

      // Mostrar mensaje de error específico
      const errorMessage = error?.data?.message || error?.message || 'Error al abrir la caja';
      enqueueSnackbar(`Error: ${errorMessage}`, {
        variant: 'error'
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Cierra una caja registradora
   */
  const handleCloseRegister = async (cashRegisterId: string, registerData: RegisterCloseData) => {
    try {
      setIsProcessing(true);

      // Crear datos para la API del backend
      const backendData = {
        closing_balance: registerData.closing_amount,
        closing_notes: registerData.notes
      };

      // Llamar a la API del backend
      const backendResponse = await closeCashRegister({
        id: cashRegisterId,
        data: backendData
      }).unwrap();

      // Si la API fue exitosa, actualizar el estado local de Redux
      dispatch(
        closeRegister({
          closing_amount: registerData.closing_amount,
          notes: registerData.notes
        })
      );

      // Mostrar mensaje de éxito
      enqueueSnackbar('Caja cerrada exitosamente', {
        variant: 'success'
      });

      // Actualizar el estado del registro
      refetchStatus();

      return { success: true, data: backendResponse };
    } catch (error: any) {
      console.error('Error al cerrar la caja:', error);

      // Mostrar mensaje de error específico
      const errorMessage = error?.data?.message || error?.message || 'Error al cerrar la caja';
      enqueueSnackbar(`Error: ${errorMessage}`, {
        variant: 'error'
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    // Estado
    isProcessing,
    registerStatus,
    isLoadingStatus,

    // PDVs disponibles
    availablePDVs: pdvsData || ([] as PDV[]),
    isLoadingPDVs,

    // Vendedores disponibles (normalizados a array)
    availableSellers:
      (Array.isArray(sellersData) ? sellersData : (sellersData as any)?.items || (sellersData as any)?.sellers || []) ||
      [],
    isLoadingSellers,

    // Acciones
    handleOpenRegister,
    handleCloseRegister,
    handleCreateSeller,
    getCurrentShiftForPDV,
    refetchStatus,
    refetchSellers
  };
};
