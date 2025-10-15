import React, { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams, usePathname } from 'src/routes/hook';
//
import { useAuthContext } from '../hooks';
// ----------------------------------------------------------------------

interface GuestGuardProps {
  children: React.ReactNode;
}

export default function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo') || paths.dashboard.root;

  const { authenticated, isFirstLogin } = useAuthContext();
  console.log('authenticated', authenticated);

  const check = useCallback(() => {
    if (!authenticated) return;

    // Si no es el primer login, redirigir a la ruta de retorno o al dashboard
    if (isFirstLogin === false) {
      if (pathname !== returnTo) {
        router.replace(returnTo);
      }
      return;
    }

    // Si es el primer login, redirigir al paso a paso
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
