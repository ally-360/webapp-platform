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
  currentStep: number;
}

/**
 * Hook optimizado para obtener datos del step-by-step sin bucles infinitos
 * IMPORTANTE: Este hook debe ser usado SOLO en StepByStep para evitar queries duplicadas
 *
 * Flujo de validación:
 * 1. Valida que sea first_login = true
 * 2. Obtiene datos de empresas, PDVs y suscripciones
 * 3. Determina en qué paso del onboarding se encuentra el usuario
 */
export function useStepByStepData(): StepByStepData {
  const { authenticated, isFirstLogin, selectedCompany, selectCompany } = useAuthContext();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // StepType.COMPANY por defecto
  const [autoSelecting, setAutoSelecting] = useState(false);

  // Empresas: habilitar solo cuando el usuario está en onboarding (first_login) y aún no marcamos datos cargados
  const {
    data: companies,
    isLoading: loadingCompanies,
    error: companiesError,
    isSuccess: companiesSuccess
  } = useGetMyCompaniesQuery(undefined, {
    skip: !authenticated || isFirstLogin !== true || isDataLoaded,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false
  });

  // PDVs: cargar únicamente si hay empresas
  const {
    data: allPDVs,
    isLoading: loadingPDV,
    error: pdvError,
    isSuccess: pdvSuccess
  } = useGetAllPDVsQuery(undefined, {
    // Requiere empresa, pero intentar cargar PDVs siempre que haya empresa
    // para determinar correctamente el paso del onboarding
    skip: !authenticated || !companiesSuccess || !companies || companies.length === 0,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false
  });

  // Suscripción: cargar igualmente si hay empresas
  const {
    data: currentSubscription,
    isLoading: loadingSubscription,
    error: subscriptionError,
    isSuccess: subscriptionSuccess
  } = useGetCurrentSubscriptionQuery(undefined, {
    // Cargar suscripción siempre que haya empresa, sin importar si hay selectedCompany
    // porque en onboarding la suscripción es importante para determinar el paso
    skip: !authenticated || !companiesSuccess || !companies || companies.length === 0,
    refetchOnFocus: false,
    refetchOnReconnect: false,
    refetchOnMountOrArgChange: false
  });

  const allQueriesComplete = useCallback(() => {
    if (!authenticated) return false;

    if (!companies || companies.length === 0) {
      return companiesSuccess || (companiesError && (companiesError as any)?.status === 404);
    }

    // En onboarding, es suficiente con que las queries hayan terminado (éxito o error controlado)
    // No necesariamente necesitamos selectedCompany ya que auto-seleccionamos después
    return (
      companiesSuccess &&
      (pdvSuccess ||
        (pdvError && (pdvError as any)?.status === 404) ||
        (pdvError && (pdvError as any)?.status === 401) ||
        (pdvError && (pdvError as any)?.status === 403)) &&
      (subscriptionSuccess ||
        (subscriptionError && (subscriptionError as any)?.status === 404) ||
        (subscriptionError && (subscriptionError as any)?.status === 401) ||
        (subscriptionError && (subscriptionError as any)?.status === 403))
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
    // En onboarding, ignorar 401/403 de PDVs/suscripción (suelen ocurrir antes de seleccionar empresa)
    const isFatal = (error: any) =>
      !!error && error.status !== 404 && (isFirstLogin ? error.status !== 401 && error.status !== 403 : true);

    const hasValidationErrors = [companiesError, pdvError, subscriptionError].some((error) => isFatal(error as any));
    setHasError(hasValidationErrors);
  }, [companiesError, pdvError, subscriptionError, isFirstLogin]);

  // 🧭 Determinar el paso actual basado en los datos disponibles
  const determineCurrentStep = useCallback(() => {
    if (!authenticated || isFirstLogin !== true) return 0;

    // Sin empresas → Paso 0 (COMPANY)
    if (!companies || companies.length === 0) {
      return 0;
    }

    const company = companies[0];

    // Si es uniquePDV, saltar paso PDV
    if (company.uniquePDV) {
      // Con empresa uniquePDV pero sin suscripción → Paso 2 (PLAN)
      if (!currentSubscription) return 2;
      // Con empresa uniquePDV y suscripción → Paso 3 (SUMMARY)
      return 3;
    }

    // Empresa no uniquePDV sin PDVs → Paso 1 (PDV)
    if (!allPDVs || !allPDVs.pdvs || allPDVs.pdvs.length === 0) return 1;
    // Con empresa y PDVs pero sin suscripción → Paso 2 (PLAN)
    if (!currentSubscription) return 2;
    // Con empresa, PDVs y suscripción → Paso 3 (SUMMARY)
    return 3;
  }, [authenticated, isFirstLogin, companies, allPDVs, currentSubscription]);

  // 🧭 Seleccionar empresa automáticamente si ya existe alguna y no hay tenant seleccionado
  useEffect(() => {
    if (
      authenticated &&
      !isDataLoaded &&
      companiesSuccess &&
      companies &&
      companies.length > 0 &&
      !selectedCompany &&
      !autoSelecting
    ) {
      setAutoSelecting(true);
      // Seleccionar la primera empresa por defecto durante el onboarding
      selectCompany(companies[0].id, false)
        .catch(() => {
          // Silenciar; si falla seguiremos mostrando el formulario sin bloquear
        })
        .finally(() => {
          setAutoSelecting(false);
        });
    }
  }, [authenticated, isDataLoaded, companiesSuccess, companies, selectedCompany, autoSelecting, selectCompany]);

  // Actualizar el paso actual cuando cambien los datos
  useEffect(() => {
    if (allQueriesComplete()) {
      const newStep = determineCurrentStep();
      setCurrentStep(newStep);
      console.log('📍 Current step determined:', newStep);
    }
  }, [allQueriesComplete, determineCurrentStep]);

  // Si es first_login y no hay empresas (404 o lista vacía), marcamos datos como listos
  useEffect(() => {
    if (!authenticated || isDataLoaded) return;

    // Caso: no hay empresas → companiesSuccess con length 0 o error 404
    const noCompanies =
      (companiesSuccess && companies && companies.length === 0) ||
      (!!companiesError && (companiesError as any)?.status === 404);

    if (isFirstLogin === true && noCompanies) {
      setIsDataLoaded(true);
      setHasError(false);
    }
  }, [authenticated, isFirstLogin, isDataLoaded, companiesSuccess, companies, companiesError]);

  // 🔧 Marcar datos como cargados cuando todo esté listo
  useEffect(() => {
    if (allQueriesComplete() && !isDataLoaded) {
      console.log('✅ Step-by-step data loading complete');
      setIsDataLoaded(true);
    }
  }, [allQueriesComplete, isDataLoaded]);

  const networksLoading = (loadingCompanies || loadingPDV || loadingSubscription) && !isDataLoaded;
  const isLoading = networksLoading;
  const isReady = isDataLoaded && authenticated;

  return {
    companies,
    allPDVs,
    currentSubscription,
    isLoading,
    isReady,
    hasError,
    currentStep
  };
}
