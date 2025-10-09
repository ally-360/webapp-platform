import { useEffect, useState, useCallback } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { useGetMyCompaniesQuery, useGetAllPDVsQuery } from 'src/redux/services/authApi';
import { useGetCurrentSubscriptionQuery } from 'src/redux/services/subscriptionsApi';

export interface StepByStepData {
  companies?: any[];
  allPDVs?: any;
  currentSubscription?: any;
  isLoading: boolean;
  isReady: boolean;
  hasError: boolean;
}

/**
 * Hook optimizado para obtener datos del step-by-step sin bucles infinitos
 * IMPORTANTE: Este hook debe ser usado SOLO en StepByStep para evitar queries duplicadas
 */
export function useStepByStepData(): StepByStepData {
  const { authenticated, isFirstLogin } = useAuthContext();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // 🔧 Query de empresas DESHABILITADA para evitar bucles infinitos
  const {
    data: companies,
    isLoading: loadingCompanies,
    error: companiesError,
    isSuccess: companiesSuccess
  } = useGetMyCompaniesQuery(undefined, {
    skip: true // 🔧 Completamente deshabilitado - usando solo auth-provider
  });

  // 🔧 Solo cargar PDVs si tenemos empresas - DESHABILITADO temporalmente
  const {
    data: allPDVs,
    isLoading: loadingPDV,
    error: pdvError,
    isSuccess: pdvSuccess
  } = useGetAllPDVsQuery(undefined, {
    skip: true // 🔧 DESHABILITADO para debugging
  });

  // 🔧 Solo cargar suscripción si tenemos empresas - DESHABILITADO temporalmente
  const {
    data: currentSubscription,
    isLoading: loadingSubscription,
    error: subscriptionError,
    isSuccess: subscriptionSuccess
  } = useGetCurrentSubscriptionQuery(undefined, {
    skip: true // 🔧 DESHABILITADO para debugging
  });

  // 🔧 Determinar cuando están todas las consultas completas
  const allQueriesComplete = useCallback(() => {
    if (!authenticated) return false;

    // Si no hay empresas, solo necesitamos que la consulta de empresas esté completa
    if (!companies || companies.length === 0) {
      return companiesSuccess || (companiesError && (companiesError as any)?.status === 404);
    }

    // Si hay empresas, necesitamos PDVs y suscripción
    return (
      companiesSuccess &&
      (pdvSuccess || (pdvError && (pdvError as any)?.status === 404)) &&
      (subscriptionSuccess || (subscriptionError && (subscriptionError as any)?.status === 404))
    );
  }, [
    authenticated,
    companies,
    companiesSuccess,
    companiesError,
    pdvSuccess,
    pdvError,
    subscriptionSuccess,
    subscriptionError
  ]);

  // 🔧 Manejar errores de manera inteligente
  useEffect(() => {
    const hasValidationErrors = [companiesError, pdvError, subscriptionError].some(
      (error) => error && (error as any)?.status !== 404
    );
    setHasError(hasValidationErrors);
  }, [companiesError, pdvError, subscriptionError]);

  // 🔧 Si es first_login, no necesitamos esperar nada externo: dejamos listo con companies vacías
  useEffect(() => {
    if (authenticated && isFirstLogin === true && !isDataLoaded) {
      setIsDataLoaded(true);
      setHasError(false);
    }
  }, [authenticated, isFirstLogin, isDataLoaded]);

  // 🔧 Marcar datos como cargados cuando todo esté listo
  useEffect(() => {
    if (allQueriesComplete() && !isDataLoaded) {
      console.log('✅ Step-by-step data loading complete');
      setIsDataLoaded(true);
    }
  }, [allQueriesComplete, isDataLoaded]);

  const networksLoading = (loadingCompanies || loadingPDV || loadingSubscription) && !isDataLoaded;
  const isLoading = isFirstLogin === true ? false : networksLoading;
  const isReady = isDataLoaded && authenticated;

  return {
    companies: isFirstLogin === true ? [] : companies,
    allPDVs,
    currentSubscription,
    isLoading,
    isReady,
    hasError
  };
}
