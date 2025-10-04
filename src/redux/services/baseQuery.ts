import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { enqueueSnackbar } from 'notistack';
import { isTokenExpired } from 'src/auth/utils/token-validation';
import type { RootState } from '../store';
import { clearCredentials } from '../slices/authSlice';

/**
 * Base query personalizado que maneja automáticamente:
 * - Autenticación con Bearer token
 * - Errores 401 (token expirado)
 * - Redirección automática al login
 */
export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: (import.meta as any).env.VITE_HOST_API || 'http://localhost:8000',
  prepareHeaders: (headers, { getState }) => {
    // Obtener token del estado global o localStorage
    const token = (getState() as RootState).auth?.token || localStorage.getItem('accessToken');

    if (token) {
      // Verificar si el token está expirado antes de usarlo
      if (isTokenExpired(token)) {
        console.warn('🔒 Token expired, will be cleared');
        localStorage.removeItem('accessToken');
        return headers;
      }

      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
});

/**
 * Base query con retry automático que maneja errores de autenticación
 */
export const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);

  // Manejar error 401 (Unauthorized)
  if (result.error && result.error.status === 401) {
    console.warn('🔒 401 Unauthorized - Token expired or invalid');

    // Limpiar credenciales del store
    api.dispatch(clearCredentials());

    // Limpiar localStorage
    localStorage.removeItem('accessToken');

    // Mostrar notificación
    enqueueSnackbar('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
      variant: 'warning',
      persist: true
    });

    // Redirigir al login después de un breve delay
    setTimeout(() => {
      window.location.href = '/auth/jwt/login';
    }, 1000);
  }

  // Manejar otros errores de servidor
  if (result.error && Number(result.error.status) >= 500) {
    enqueueSnackbar('Error del servidor. Inténtalo nuevamente.', {
      variant: 'error'
    });
  }

  return result;
};
