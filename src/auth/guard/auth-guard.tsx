import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hook';
// hooks
import { useAuthContext } from '../hooks';
import { useTokenValidation } from '../hooks/use-token-validation';

// ----------------------------------------------------------------------

const loginPaths = {
  jwt: paths.auth.jwt.login
};

// ----------------------------------------------------------------------

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, method, isFirstLogin, loading } = useAuthContext();

  useTokenValidation({
    warningMinutes: 5,
    autoRefresh: false,
    autoRedirect: true,
    checkInterval: 60
  });

  console.log('AuthGuard', { authenticated, method, isFirstLogin });

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    // Esperar a que cargue el estado de autenticación para evitar redirecciones prematuras
    if (loading) return;

    if (!authenticated) {
      // Evitar redirigir si ya estamos en el login
      const loginPath = loginPaths[method];
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

  // Nota: la redirección al StepByStep se maneja en GuestGuard/StepGuard para evitar conflictos

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node
};
