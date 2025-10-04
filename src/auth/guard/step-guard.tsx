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

  const { authenticated, isFirstLogin, selectedCompany } = useAuthContext();

  const check = useCallback(() => {
    if (authenticated && isFirstLogin === true) {
      router.replace(returnTo);
    }
  }, [authenticated, returnTo, router, isFirstLogin]);

  const checkBussiness = useCallback(() => {
    if (!selectedCompany) {
      router.replace(paths.select_business);
    }
  }, [router, selectedCompany]);

  useEffect(() => {
    checkBussiness();
  }, [checkBussiness]);

  useEffect(() => {
    check();
  }, [check]);

  return <>{children}</>;
}

StepGuard.propTypes = {
  children: PropTypes.node
};
