import { useEffect } from 'react';
import { useErrorHandler } from 'src/contexts/ErrorHandlerContext';
import { setGlobalErrorHandler } from 'src/axios/axios';

// ----------------------------------------------------------------------

/**
 * Componente que registra el error handler del contexto con Axios
 * Debe ser usado dentro del ErrorHandlerProvider
 */
export default function AxiosErrorSetup() {
  const { showError } = useErrorHandler();

  useEffect(() => {
    // Registrar el error handler global con Axios
    setGlobalErrorHandler(showError);

    return () => {
      // Cleanup: remover el error handler al desmontar
      setGlobalErrorHandler(() => undefined);
    };
  }, [showError]);

  // Este componente no renderiza nada
  return null;
}
