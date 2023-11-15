import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';
// ----------------------------------------------------------------------

export default function GuestGuard({ children }) {
  console.log('GuestGuard');
  const router = useRouter();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || paths.dashboard.root;

  const { authenticated, isFirstLogin } = useAuthContext();
  console.log('authenticated', authenticated);

  const check = useCallback(() => {
    if (authenticated && isFirstLogin === false) {
      router.replace(returnTo);
    }
    if (authenticated && isFirstLogin === true) {
      router.replace(paths.stepByStep.root);
    }
  }, [authenticated, returnTo, router, isFirstLogin]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

GuestGuard.propTypes = {
  children: PropTypes.node
};
