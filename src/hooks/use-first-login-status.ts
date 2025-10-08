import { useEffect, useState, useMemo } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { useGetMyCompaniesQuery } from 'src/redux/services/authApi';
import { useGetCurrentSubscriptionQuery } from 'src/redux/services/subscriptionsApi';

export interface FirstLoginStatus {
  shouldShowStepByStep: boolean;
  isLoading: boolean;
  isReady: boolean;
  firstLogin: boolean | null;
  hasCompany: boolean;
  hasSubscription: boolean;
}

/**
 * Hook para determinar si el usuario debe ver el step-by-step o ir al dashboard
 *
 * Lógica:
 * - Si first_login es true: mostrar step-by-step
 * - Si first_login es false: validar si tiene empresa y suscripción completas
 * - Si falta algo crítico: mostrar step-by-step
 * - Si todo está completo: ir al dashboard
 */
export function useFirstLoginStatus(): FirstLoginStatus {
  const { user, authenticated } = useAuthContext();
  const [isReady, setIsReady] = useState(false);

  // Consultas para validar el estado del usuario
  const {
    data: companies,
    isLoading: companiesLoading,
    isSuccess: companiesSuccess
  } = useGetMyCompaniesQuery(undefined, {
    skip: !authenticated
  });

  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    isSuccess: subscriptionSuccess
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !authenticated
  });

  // Estados derivados
  const firstLogin = user?.firstLogin ?? null;
  const hasCompany = companies && companies.length > 0;
  const hasSubscription = currentSubscription && currentSubscription.id;
  const allQueriesComplete = companiesSuccess && subscriptionSuccess;
  const isLoading = companiesLoading || subscriptionLoading;

  // Determinar si debe mostrar step-by-step
  const shouldShowStepByStep = useMemo(() => {
    // Si no está autenticado, no mostrar step-by-step
    if (!authenticated) {
      return false;
    }

    // Si first_login es explícitamente true, mostrar step-by-step
    if (firstLogin === true) {
      console.log('🔄 First login is true, showing step-by-step');
      return true;
    }

    // Si first_login es false, validar completitud
    if (firstLogin === false) {
      // Si no tiene empresa, mostrar step-by-step
      if (!hasCompany) {
        console.log('🏢 No company found, showing step-by-step');
        return true;
      }

      // Si no tiene suscripción activa, mostrar step-by-step
      if (!hasSubscription) {
        console.log('💳 No subscription found, showing step-by-step');
        return true;
      }

      // Si tiene todo, no mostrar step-by-step
      console.log('✅ All setup complete, going to dashboard');
      return false;
    }

    // Si first_login es null/undefined, asumir que necesita step-by-step
    console.log('❓ First login status unknown, showing step-by-step');
    return true;
  }, [authenticated, firstLogin, hasCompany, hasSubscription]);

  // Marcar como listo cuando todas las consultas terminen
  useEffect(() => {
    if (!isLoading && allQueriesComplete && authenticated) {
      setIsReady(true);
    }
  }, [isLoading, allQueriesComplete, authenticated]);

  return {
    shouldShowStepByStep,
    isLoading,
    isReady,
    firstLogin,
    hasCompany: Boolean(hasCompany),
    hasSubscription: Boolean(hasSubscription)
  };
}
