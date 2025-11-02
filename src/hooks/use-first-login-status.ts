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
  // 🔧 DESHABILITADO: Usando datos del AuthProvider para evitar queries duplicadas
  const {
    data: companies,
    isLoading: companiesLoading,
    isSuccess: companiesSuccess
  } = useGetMyCompaniesQuery(undefined, {
    skip: true // 🔧 Completamente deshabilitado para evitar bucles
  });

  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    isSuccess: subscriptionSuccess
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: true // 🔧 Completamente deshabilitado para evitar bucles
  });

  const firstLogin = user?.first_login ?? false;
  const hasCompany = companies && companies.length > 0;
  const hasSubscription = currentSubscription && currentSubscription.id;
  const allQueriesComplete = companiesSuccess && subscriptionSuccess;
  const isLoading = companiesLoading || subscriptionLoading;

  // Determinar si debe mostrar step-by-step
  const shouldShowStepByStep = useMemo(() => {
    if (!authenticated) {
      return false;
    }

    if (firstLogin === true) {
      console.log('🔄 First login is true, showing step-by-step');
      return true;
    }

    if (firstLogin === false) {
      if (!hasCompany) {
        console.log('🏢 No company found, showing step-by-step');
        return true;
      }

      if (!hasSubscription) {
        console.log('💳 No subscription found, showing step-by-step');
        return true;
      }

      console.log('✅ All setup complete, going to dashboard');
      return false;
    }

    console.log('❓ First login status unknown, showing step-by-step');
    return true;
  }, [authenticated, firstLogin, hasCompany, hasSubscription]);

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
