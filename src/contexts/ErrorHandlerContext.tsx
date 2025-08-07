import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { useRouter } from 'src/routes/hook';
import { enqueueSnackbar } from 'notistack';
import { ErrorConfig, ErrorHandlerContextProps, ErrorHandlerState } from '../interfaces/api/api-response.interface';

const ErrorHandlerContext = createContext<ErrorHandlerContextProps | undefined>(undefined);

interface ErrorHandlerProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de contexto para manejar errores globalmente en la aplicación.
 * Permite mostrar errores de diferentes maneras (toast, alert, redirect, etc.)
 */
export const ErrorHandlerProvider: React.FC<ErrorHandlerProviderProps> = ({ children }) => {
  const router = useRouter();
  const [errorState, setErrorState] = useState<ErrorHandlerState>({
    isVisible: false,
    config: null
  });

  /**
   * Función para mostrar un error basado en la configuración proporcionada.
   * Esta función maneja diferentes acciones como mostrar un toast, redirigir, o mostrar un alert/modal.
   * @param config Configuración del error a mostrar.
   * @param config.action Acción a realizar (toast, alert, redirect, silent, modal).
   * @param config.message Mensaje del error a mostrar.
   * @param config.severity Severidad del error (error, warning, info, success).
   * @param config.duration Duración del toast (opcional).
   * @param config.redirectUrl URL a redirigir en caso de acción 'redirect'.
   * @param config.autoDismiss Si el toast debe cerrarse automáticamente (opcional).
   */
  const showError = useCallback(
    (config: ErrorConfig) => {
      setErrorState({
        isVisible: true,
        config
      });

      switch (config.action) {
        case 'toast':
          enqueueSnackbar(config.message, {
            variant: config.severity || 'error',
            autoHideDuration: config.duration || 5000
          });
          break;

        case 'redirect':
          if (config.redirectUrl) {
            if (config.autoDismiss) {
              enqueueSnackbar(config.message, {
                variant: config.severity || 'info',
                autoHideDuration: 3000
              });
              setTimeout(() => {
                router.push(config.redirectUrl!);
              }, 3000);
            } else {
              router.push(config.redirectUrl);
            }
          }
          break;

        case 'alert':
        case 'modal':
          // Estos se manejan en el componente ErrorDisplay
          break;

        case 'silent':
          console.warn('Silent error:', config.message);
          break;

        default:
          console.warn('Unknown error action:', config.action);
      }
    },
    [router]
  );

  /**
   * Función para mostrar un toast con un mensaje específico.
   * @param message Mensaje a mostrar en el toast.
   * @param severity Severidad del mensaje (error, warning, info, success).
   */
  const showToast = useCallback((message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    enqueueSnackbar(message, {
      variant: severity,
      autoHideDuration: 5000
    });
  }, []);

  /**
   * Función para mostrar un alert con un mensaje específico.
   * @param message Mensaje a mostrar en el alert.
   * @param severity Severidad del mensaje (error, warning, info, success).
   */
  const showAlert = useCallback((message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setErrorState({
      isVisible: true,
      config: {
        action: 'alert',
        message,
        severity
      }
    });
  }, []);

  /**
   * Función para limpiar el estado del error, ocultando cualquier mensaje de error actual.
   */
  const clearError = useCallback(() => {
    setErrorState({
      isVisible: false,
      config: null
    });
  }, []);

  const value = useMemo(
    () => ({
      showError,
      showToast,
      showAlert,
      clearError
    }),
    [showError, showToast, showAlert, clearError]
  );

  return (
    <ErrorHandlerContext.Provider value={value}>
      {children}
      {errorState.isVisible &&
        errorState.config &&
        (errorState.config.action === 'alert' || errorState.config.action === 'modal') && (
          <ErrorDisplay config={errorState.config} onClose={clearError} />
        )}
    </ErrorHandlerContext.Provider>
  );
};

export const useErrorHandler = (): ErrorHandlerContextProps => {
  const context = useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorHandlerProvider');
  }
  return context;
};

// Componente para mostrar errores tipo alert/modal
interface ErrorDisplayProps {
  config: ErrorConfig;
  onClose: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ config, onClose }) => {
  if (config.action === 'alert') {
    return <AlertErrorDisplay config={config} onClose={onClose} />;
  }

  if (config.action === 'modal') {
    return <ModalErrorDisplay config={config} onClose={onClose} />;
  }

  return null;
};

// Componente Alert Error Display (implementación temporal)
const AlertErrorDisplay: React.FC<ErrorDisplayProps> = ({ config, onClose }) => (
  <div
    style={{
      position: 'fixed',
      top: 20,
      right: 20,
      padding: '16px',
      backgroundColor: '#f44336',
      color: 'white',
      borderRadius: '4px',
      zIndex: 9999,
      maxWidth: '400px'
    }}
  >
    <p>{config.message}</p>
    <button type="button" onClick={onClose} style={{ marginTop: '8px', padding: '4px 8px' }}>
      Cerrar
    </button>
  </div>
);

// Componente Modal Error Display (implementación temporal)
const ModalErrorDisplay: React.FC<ErrorDisplayProps> = ({ config, onClose }) => (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}
  >
    <div
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '500px',
        margin: '20px'
      }}
    >
      <p>{config.message}</p>
      <button type="button" onClick={onClose} style={{ marginTop: '16px', padding: '8px 16px' }}>
        Cerrar
      </button>
    </div>
  </div>
);
