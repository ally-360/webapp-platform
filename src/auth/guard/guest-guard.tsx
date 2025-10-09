import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams, usePathname } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';
// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  console.log('GuestGuard');
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || paths.dashboard.root;

  const { authenticated, isFirstLogin } = useAuthContext();
  console.log('authenticated', authenticated);

  const check = useCallback(() => {
    if (!authenticated) return;

    if (isFirstLogin === false) {
      // Evitar redireccionar si ya estamos en el destino
      if (pathname !== returnTo) {
        router.replace(returnTo);
      }
      return;
    }

    if (isFirstLogin === true) {
      if (pathname !== paths.stepByStep.root) {
        router.replace(paths.stepByStep.root);
      }
    }
  }, [authenticated, returnTo, router, isFirstLogin, pathname]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node
};
