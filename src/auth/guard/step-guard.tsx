import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export default function StepGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || paths.stepByStep.root;

  const { authenticated, isFirstLogin } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated && isFirstLogin === true) {
      router.replace(returnTo);
    }
  }, [authenticated, returnTo, router, isFirstLogin]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

StepGuard.propTypes = {
  children: PropTypes.node
};
