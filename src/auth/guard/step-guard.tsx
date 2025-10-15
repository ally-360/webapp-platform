import React, { useCallback, useEffect } from 'react';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams, usePathname } from 'src/routes/hook';
// hooks
import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

/**
 * Configuración de rutas para el flujo de onboarding
 */
const ONBOARDING_PATHS = {
  stepByStep: paths.stepByStep.root,
  selectBusiness: paths.select_business,
  login: paths.auth.jwt.login
} as const;

// ----------------------------------------------------------------------

interface StepGuardProps {
  children: React.ReactNode;
}

/**
 * 🛤️ StepGuard - Componente que protege las rutas del flujo de onboarding
 *
 * Funcionalidades:
 * - Redirige a login si no está autenticado
 * - Redirige a step-by-step si es el primer login
 * - Redirige a select-business si no tiene empresa seleccionada y no es el primer login
 */
export default function StepGuard({ children }: StepGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { authenticated, isFirstLogin, selectedCompany, loading } = useAuthContext();

  const returnTo = searchParams.get('returnTo') || ONBOARDING_PATHS.stepByStep;

  const [checked, setChecked] = React.useState(false);

  /**
   * 🔐 Validación principal de autenticación y primer login
   */
  const check = useCallback(() => {
    // Caso 1: Usuario autenticado + primer login + no está en step-by-step → Redirigir a step-by-step
    if (authenticated && isFirstLogin === true && pathname !== ONBOARDING_PATHS.stepByStep) {
      router.replace(returnTo);
      setChecked(true);
      return;
    }

    // Caso 2: Usuario no autenticado + no está cargando → Redirigir a login
    if (!authenticated && !loading) {
      router.replace(ONBOARDING_PATHS.login);
      setChecked(true);
      return;
    }

    // Caso 3: No está cargando + no es primer login + está en step-by-step → Permitir acceso
    if (!loading && isFirstLogin === false && pathname === ONBOARDING_PATHS.stepByStep) {
      setChecked(true);
    }
  }, [authenticated, returnTo, router, isFirstLogin, pathname, loading]);

  /**
   * 🏢 Validación de selección de empresa (business)
   */
  const checkBusiness = useCallback(() => {
    if (!selectedCompany && authenticated && isFirstLogin === false && !loading) {
      if (pathname !== ONBOARDING_PATHS.selectBusiness) {
        router.replace(ONBOARDING_PATHS.selectBusiness);
      }
      setChecked(true);
    }
  }, [router, selectedCompany, authenticated, isFirstLogin, pathname, loading]);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    checkBusiness();
  }, [checkBusiness]);

  if (!checked) {
    return null;
  }

  return <>{children}</>;
}
