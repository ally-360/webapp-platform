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
      return;
    }

    if (isFirstLogin === false && pathname === paths.stepByStep.root) {
      router.replace(paths.dashboard.root);
    }
  }, [authenticated, isFirstLogin, loading, pathname, router]);

  if (!authenticated || isFirstLogin === null || loading) {
    return null;
  }

  return <>{children}</>;
}

FirstLoginGuard.propTypes = {
  children: PropTypes.node
};
