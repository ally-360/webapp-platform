import React, { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hook';
// hooks
import { useAuthContext } from '../hooks';
import { useTokenValidation } from '../hooks/use-token-validation';

// ----------------------------------------------------------------------

/**
 * Configuración de paths de login por método de autenticación
 */
const LOGIN_PATHS = {
  jwt: paths.auth.jwt.login
} as const;

/**
 * Configuración del hook de validación de token
 */
const TOKEN_VALIDATION_CONFIG = {
  warningMinutes: 5,
  autoRefresh: false,
  autoRedirect: true,
  checkInterval: 60
} as const;

// ----------------------------------------------------------------------

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard - Componente que protege rutas requiriendo autenticación
 * Funcionalidades:
 * - Protege rutas de usuarios no autenticados
 * - Redirige al login preservando la URL destino
 * - Monitorea la validez del token automáticamente
 * - Maneja estados de loading elegantemente
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, method, loading } = useAuthContext();

  useTokenValidation(TOKEN_VALIDATION_CONFIG);

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (loading) return;

    if (!authenticated) {
      const loginPath = LOGIN_PATHS[method];
      const onLogin = pathname.startsWith(loginPath);
      if (onLogin) {
        return;
      }

      const searchParams = new URLSearchParams({ returnTo: pathname }).toString();
      const href = `${loginPath}?${searchParams}`;
      router.replace(href);
      return;
    }

    setChecked(true);
  }, [authenticated, method, router, pathname, loading]);

  useEffect(() => {
    check();
  }, [check]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
