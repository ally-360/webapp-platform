import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

// Hook para mostrar notificaciones basadas en códigos de error
export const useNotificationService = () => {
  const { t } = useTranslation();

  const showNotificationByCode = (code: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    const message = t(`errors.${code}`) || t(`success.${code}`) || t('errors.UNKNOWN_ERROR');
    enqueueSnackbar(message, { variant: type });
  };

  return { showNotificationByCode };
};
