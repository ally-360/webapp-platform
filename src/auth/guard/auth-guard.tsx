import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useState } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
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
  const { authenticated, method, isFirstLogin } = useAuthContext();

  // 🔒 Configurar validación automática de token
  useTokenValidation({
    warningMinutes: 5,
    autoRefresh: false,
    autoRedirect: true,
    checkInterval: 60
  });

  console.log('AuthGuard', { authenticated, method, isFirstLogin });

  const [checked, setChecked] = useState(false);

  const check = useCallback(() => {
    if (!authenticated) {
      const searchParams = new URLSearchParams({ returnTo: window.location.pathname }).toString();

      const loginPath = loginPaths[method];

      const href = `${loginPath}?${searchParams}`;

      router.replace(href);
    } else {
      setChecked(true);
    }
  }, [authenticated, method, router]);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstLogin === true) {
      router.push(paths.stepByStep.root);
    }
  }, [isFirstLogin, router]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.propTypes = {
  children: PropTypes.node
};
