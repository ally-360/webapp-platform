import { useState } from 'react';
import { useAppDispatch } from 'src/hooks/store';
import { openRegister, closeRegister } from 'src/redux/pos/posSlice';
import {
  useOpenCashRegisterMutation,
  useCloseCashRegisterMutation,
  useGetRegisterStatusQuery,
  useGetSellersQuery,
  useCreateSellerMutation
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
  const [closeCashRegister] = useCloseCashRegisterMutation();
  const [createSeller] = useCreateSellerMutation();
  const { data: registerStatus, isLoading: isLoadingStatus, refetch: refetchStatus } = useGetRegisterStatusQuery();

  // Obtener lista de PDVs disponibles
  const { data: pdvsData, isLoading: isLoadingPDVs } = useGetPDVsQuery();

  // Obtener lista de vendedores activos
  const { data: sellersData, isLoading: isLoadingSellers } = useGetSellersQuery({
    is_active: true,
    size: 100
  });

  /**
   * Crear un nuevo vendedor
   */
  const handleCreateSeller = async (sellerData: SellerCreate) => {
    try {
      const response = await createSeller(sellerData).unwrap();
      enqueueSnackbar('Vendedor creado exitosamente', { variant: 'success' });
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
      const backendResponse = await openCashRegister({
        pdv_id: registerData.pdv_id,
        data: backendData
      }).unwrap();

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

    // Vendedores disponibles
    availableSellers: sellersData?.sellers || [],
    isLoadingSellers,

    // Acciones
    handleOpenRegister,
    handleCloseRegister,
    handleCreateSeller,
    refetchStatus
  };
};
