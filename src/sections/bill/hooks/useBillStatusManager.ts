import { useState, useCallback, useEffect } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import { useUpdateBillMutation } from 'src/redux/services/billsApi';

/**
 * Hook para manejar el estado de Bills según las reglas de negocio
 *
 * Estados y Transiciones:
 * - DRAFT → OPEN (manual, al recibir mercancía, incrementa inventario)
 * - OPEN → PARTIAL (automático al registrar primer pago parcial)
 * - PARTIAL → PAID (automático al completar el pago)
 * - DRAFT/OPEN/PARTIAL → VOID (manual, anular factura)
 *
 * Según documentación: módulo_bills.md
 */
export function useBillStatusManager(bill: any) {
  const { enqueueSnackbar } = useSnackbar();
  const [updateBill, { isLoading }] = useUpdateBillMutation();
  const [currentStatus, setCurrentStatus] = useState(bill?.status?.toUpperCase() || 'DRAFT');

  // Sincronizar con cambios externos (ej: después de pagos)
  useEffect(() => {
    if (bill?.status) {
      setCurrentStatus(bill.status.toUpperCase());
    }
  }, [bill?.status]);

  /**
   * Cambiar estado de DRAFT a OPEN
   * Esto activa la actualización de inventario en el backend
   */
  const confirmReceipt = useCallback(async () => {
    if (currentStatus !== 'DRAFT') {
      enqueueSnackbar('Solo se pueden confirmar facturas en estado BORRADOR', {
        variant: 'warning'
      });
      return false;
    }

    try {
      await updateBill({
        id: bill.id,
        bill: { status: 'open' }
      }).unwrap();

      enqueueSnackbar('Mercancía confirmada. El inventario ha sido incrementado automáticamente.', {
        variant: 'success'
      });

      setCurrentStatus('OPEN');
      return true;
    } catch (error: any) {
      console.error('Error confirming receipt:', error);
      enqueueSnackbar(error?.data?.message || 'Error al confirmar la recepción de mercancía', { variant: 'error' });
      return false;
    }
  }, [bill?.id, currentStatus, updateBill, enqueueSnackbar]);

  /**
   * Obtener info del estado actual
   */
  const getStatusInfo = useCallback(() => {
    const statusMap = {
      DRAFT: {
        label: 'Borrador',
        color: 'warning',
        canEdit: true,
        canAddPayment: false,
        canConfirmReceipt: true,
        description: 'Factura en creación. No afecta inventario.',
        nextAction: 'Confirme la recepción de mercancía para actualizar el inventario'
      },
      OPEN: {
        label: 'Abierta',
        color: 'info',
        canEdit: false,
        canAddPayment: true,
        canConfirmReceipt: false,
        description: 'Factura confirmada, pendiente de pago.',
        nextAction: 'Registre pagos para actualizar el estado automáticamente'
      },
      PARTIAL: {
        label: 'Parcial',
        color: 'warning',
        canEdit: false,
        canAddPayment: true,
        canConfirmReceipt: false,
        description: 'Pago parcial registrado.',
        nextAction: 'Complete el pago para cerrar la factura'
      },
      PAID: {
        label: 'Pagada',
        color: 'success',
        canEdit: false,
        canAddPayment: false,
        canConfirmReceipt: false,
        description: 'Factura completamente pagada.',
        nextAction: null
      },
      VOID: {
        label: 'Anulada',
        color: 'error',
        canEdit: false,
        canAddPayment: false,
        canConfirmReceipt: false,
        description: 'Factura anulada.',
        nextAction: null
      }
    };

    return statusMap[currentStatus] || statusMap.DRAFT;
  }, [currentStatus]);

  /**
   * Validar si se puede realizar una acción
   */
  const canPerformAction = useCallback(
    (action: 'edit' | 'payment' | 'confirm' | 'void') => {
      const statusInfo = getStatusInfo();

      switch (action) {
        case 'edit':
          return statusInfo.canEdit;
        case 'payment':
          return statusInfo.canAddPayment;
        case 'confirm':
          return statusInfo.canConfirmReceipt;
        case 'void':
          return ['DRAFT', 'OPEN', 'PARTIAL'].includes(currentStatus);
        default:
          return false;
      }
    },
    [currentStatus, getStatusInfo]
  );

  return {
    currentStatus,
    statusInfo: getStatusInfo(),
    confirmReceipt,
    canPerformAction,
    isUpdating: isLoading
  };
}
