import { useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { isTokenExpired, willTokenExpireSoon, getTokenTimeToExpiry } from '../utils/token-validation';
import { useAuthContext } from './use-auth-context';

interface UseTokenValidationOptions {
  /**
   * Minutos antes de la expiración para mostrar warning
   * @default 5
   */
  warningMinutes?: number;
  /**
   * Si debe auto-refrescar el token cuando esté por expirar
   * @default false
   */
  autoRefresh?: boolean;
  /**
   * Si debe redirigir automáticamente al login cuando expire
   * @default true
   */
  autoRedirect?: boolean;
  /**
   * Intervalo de verificación en segundos
   * @default 60
   */
  checkInterval?: number;
}

/**
 * Hook para validar la expiración del token y manejar la sesión automáticamente
 */
export function useTokenValidation(options: UseTokenValidationOptions = {}) {
  const { warningMinutes = 5, autoRefresh = false, autoRedirect = true, checkInterval = 60 } = options;

  const { logout } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const intervalRef = useRef<number | null>(null);
  const warningShownRef = useRef(false);

  const checkTokenValidity = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      return;
    }

    try {
      if (isTokenExpired(token)) {
        if (autoRedirect) {
          enqueueSnackbar('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
            variant: 'warning',
            persist: true
          });

          await logout();
          router.replace(paths.auth.jwt.login);
        }
        return;
      }

      if (willTokenExpireSoon(token, warningMinutes) && !warningShownRef.current) {
        const timeToExpiry = getTokenTimeToExpiry(token);
        const minutesLeft = timeToExpiry ? Math.ceil(timeToExpiry / 60) : 0;

        console.log(`⚠️ Token will expire in ${minutesLeft} minutes`);

        enqueueSnackbar(
          `Tu sesión expirará en ${minutesLeft} minuto${minutesLeft !== 1 ? 's' : ''}. Guarda tu trabajo.`,
          {
            variant: 'warning',
            autoHideDuration: 8000
          }
        );

        warningShownRef.current = true;

        // Reset warning flag after showing it
        setTimeout(() => {
          warningShownRef.current = false;
        }, 5 * 60 * 1000); // Reset after 5 minutes
      }

      // TODO: Implementar auto-refresh si está habilitado
      if (autoRefresh && willTokenExpireSoon(token, 2)) {
        console.log('🔄 Auto-refresh token (not implemented yet)');
      }
    } catch (error) {
      console.error('❌ Error checking token validity:', error);
    }
  }, [warningMinutes, autoRefresh, autoRedirect, logout, enqueueSnackbar, router]);

  const startTokenValidation = useCallback(() => {
    checkTokenValidity();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(checkTokenValidity, checkInterval * 1000);
  }, [checkTokenValidity, checkInterval]);

  const stopTokenValidation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('🛑 Token validation stopped');
    }
  }, []);

  const validateTokenNow = useCallback(() => checkTokenValidity(), [checkTokenValidity]);

  // Iniciar validación cuando el hook se monta
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      startTokenValidation();
    }

    // Cleanup al desmontar
    return () => {
      stopTokenValidation();
    };
  }, [startTokenValidation, stopTokenValidation]);

  // Limpiar intervalo cuando la pestaña pierde el foco (opcional)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTokenValidation();
      } else {
        const token = localStorage.getItem('accessToken');
        if (token) {
          startTokenValidation();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTokenValidation, stopTokenValidation]);

  return {
    startTokenValidation,
    stopTokenValidation,
    validateTokenNow
  };
}
