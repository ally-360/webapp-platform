import axios, { AxiosResponse, AxiosError } from 'axios';
import { JWTconfig } from '../config-global';
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from '../interfaces/api/api-response.interface';
import { getErrorConfig } from '../config/error-codes.config';

// ----------------------------------------------------------------------

const apiClient = axios.create({
  baseURL: `${JWTconfig.apiUrl}/${JWTconfig.apiV}`
});

// Variable global para acceder al error handler desde los interceptores
let globalErrorHandler: ((config: any) => void) | null = null;

// Función para setear el error handler global
export const setGlobalErrorHandler = (errorHandler: (config: any) => void) => {
  globalErrorHandler = errorHandler;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const companyId = localStorage.getItem('companyId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (companyId) {
      config.headers['company-id'] = companyId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  // Respuesta exitosa
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;

    // Si la respuesta es exitosa, extraer solo el campo 'data'
    if (data && typeof data === 'object' && 'success' in data) {
      if (data.success && 'data' in data) {
        // Retornar solo el contenido de 'data' para respuestas exitosas
        return {
          ...response,
          data: (data as ApiSuccessResponse).data
        };
      }
    }

    // Si no tiene la estructura esperada, retornar la respuesta completa
    return response;
  },

  // Error en la respuesta
  (error: AxiosError<ApiErrorResponse>) => {
    let errorConfig;

    if (error.response?.data) {
      const errorData = error.response.data;

      // Verificar si es una respuesta de error de nuestra API
      if (errorData && typeof errorData === 'object' && 'success' in errorData && !errorData.success) {
        const { details } = errorData;

        if (details && details.acode) {
          // Usar nuestro sistema de códigos de error
          errorConfig = getErrorConfig(details.acode);
        } else {
          // Error sin código específico
          errorConfig = {
            action: 'toast' as const,
            message: details?.message || 'Error desconocido',
            severity: 'error' as const
          };
        }
      } else {
        // Error HTTP estándar
        const { status } = error.response;
        errorConfig = getHttpErrorConfig(status, error.response.statusText);
      }
    } else if (error.request) {
      // Error de red/conexión
      errorConfig = getErrorConfig(600); // Código para error de conexión
    } else {
      // Error genérico
      errorConfig = getErrorConfig(1000); // Código para error general
    }

    // Mostrar el error usando el handler global si está disponible
    if (globalErrorHandler && errorConfig) {
      globalErrorHandler(errorConfig);
    }

    // Rechazar la promesa con información estructurada
    return Promise.reject(new Error(errorConfig?.message || 'Error desconocido'));
  }
);

// Función auxiliar para manejar errores HTTP estándar
const getHttpErrorConfig = (status: number, statusText: string) => {
  const errorMap: Record<number, { acode: number; message: string }> = {
    400: { acode: 300, message: 'Solicitud inválida' },
    401: { acode: 102, message: 'No autorizado' },
    403: { acode: 200, message: 'Acceso prohibido' },
    404: { acode: 400, message: 'Recurso no encontrado' },
    408: { acode: 601, message: 'Tiempo de espera agotado' },
    422: { acode: 301, message: 'Datos no válidos' },
    429: { acode: 601, message: 'Demasiadas solicitudes' },
    500: { acode: 500, message: 'Error interno del servidor' },
    502: { acode: 501, message: 'Puerta de enlace incorrecta' },
    503: { acode: 501, message: 'Servicio no disponible' },
    504: { acode: 601, message: 'Tiempo de espera de la puerta de enlace' }
  };

  const errorInfo = errorMap[status] || {
    acode: 1000,
    message: `Error HTTP ${status}: ${statusText}`
  };

  return getErrorConfig(errorInfo.acode);
};

export default apiClient;
