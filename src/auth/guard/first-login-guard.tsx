import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hook';
import { useAuthContext } from '../hooks';

export default function FirstLoginGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, isFirstLogin, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (!authenticated) {
      // No decide aquí; AuthGuard externo llevará al login
      return;
    }

    // Si NO es first_login, bloquear acceso a step-by-step
    if (isFirstLogin === false && pathname === paths.stepByStep.root) {
      router.replace(paths.dashboard.root);
    }
  }, [authenticated, isFirstLogin, loading, pathname, router]);

  return <>{children}</>;
}

FirstLoginGuard.propTypes = {
  children: PropTypes.node
};
