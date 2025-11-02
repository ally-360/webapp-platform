import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  Stack,
  Container,
  styled,
  StepProps,
  StepLabelProps
} from '@mui/material';

import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import { useAuthContext } from 'src/auth/hooks';
import RegisterCompanyForm from 'src/pages/authentication/steps/RegisterCompanyForm';
import RegisterPDVForm from 'src/pages/authentication/steps/RegisterPDVForm';
import { PlanSelectionForm } from 'src/pages/authentication/steps/PlanSelectionForm';
import RegisterSummary from 'src/pages/authentication/steps/RegisterSummary';
import { useAppSelector, useAppDispatch } from 'src/hooks/store';
import { paths } from 'src/routes/paths';
import { StepType } from 'src/interfaces/stepByStep';
import {
  setStep,
  resetStep,
  goToPreviousStep,
  setCompanyResponse,
  setPDVResponse,
  setPlanData,
  setSubscriptionResponse
} from 'src/redux/slices/stepByStepSlice';
import { useStepByStepData } from 'src/hooks/use-step-by-step-data';
import { SplashScreen } from 'src/components/loading-screen';

const getStepsConfig = (isUniquePDV: boolean | undefined) => {
  if (isUniquePDV) {
    return [
      { key: StepType.COMPANY, label: 'Crear empresa' },
      { key: StepType.PLAN, label: 'Seleccionar plan' },
      { key: StepType.SUMMARY, label: 'Resumen' }
    ];
  }
  return [
    { key: StepType.COMPANY, label: 'Crear empresa' },
    { key: StepType.PDV, label: 'Puntos de venta' },
    { key: StepType.PLAN, label: 'Seleccionar plan' },
    { key: StepType.SUMMARY, label: 'Resumen' }
  ];
};

const RootStyle = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 900,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  padding: theme.spacing(6, 0),
  gap: '2rem'
}));

/**
 * Componente de registro paso a paso para crear una empresa, agregar PDV y ver resumen.
 */
export default function StepByStep() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { logout } = useAuthContext();
  const dispatch = useAppDispatch();

  // Ref para rastrear la última acción del usuario
  const lastUserAction = useRef<'auto' | 'manual-forward' | 'manual-back' | null>(null);

  const { activeStep, completedSteps } = useAppSelector((state) => state.stepByStep);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);
  const pdvResponse = useAppSelector((state) => state.stepByStep.pdvResponse);
  const subscriptionResponse = useAppSelector((state) => state.stepByStep.subscriptionResponse);
  const planData = useAppSelector((state) => state.stepByStep.planData);
  const isUniquePDV = companyResponse?.uniquePDV;
  const stepsConfig = useMemo(() => getStepsConfig(isUniquePDV), [isUniquePDV]);
  const { companies, allPDVs, currentSubscription, isLoading, isReady, hasError, currentStep } = useStepByStepData();

  useEffect(() => {
    if (!isReady || hasError) {
      return;
    }
    const maxStep = isUniquePDV ? 2 : 3;
    const safeStep = Math.min(Math.max(currentStep, 0), maxStep);

    dispatch(setStep(safeStep));
  }, [isReady, hasError, currentStep, isUniquePDV, dispatch]);

  useEffect(() => {
    if (!isReady || hasError) {
      return;
    }

    const hasCompleteSubscriptionData = !!(subscriptionResponse || (currentSubscription && currentSubscription.id));
    const shouldGoToSummary = isUniquePDV && hasCompleteSubscriptionData && completedSteps.includes(StepType.PLAN);

    if (shouldGoToSummary && lastUserAction.current === 'manual-back' && activeStep === StepType.PLAN) {
      lastUserAction.current = null;
    }

    if (shouldGoToSummary && activeStep !== 2 && lastUserAction.current !== 'manual-back') {
      lastUserAction.current = 'auto';
      dispatch(setStep(2));
    }
  }, [isReady, hasError, isUniquePDV, subscriptionResponse, currentSubscription, completedSteps, activeStep, dispatch]);

  useEffect(() => {
    if (!isReady || hasError) {
      return;
    }

    if (companies && companies.length > 0) {
      const company = companies[0];

      dispatch(
        setCompanyResponse({
          id: company.id,
          name: company.name,
          description: company.description || '',
          address: company.address || '',
          phone_number: company.phone_number || '',
          nit: company.nit,
          economic_activity: company.economic_activity || '',
          quantity_employees: String(company.quantity_employees || ''),
          social_reason: company.social_reason || '',
          logo: company.logo || '',
          uniquePDV: company.unique_pdv || false,
          created_at: company.created_at || new Date().toISOString(),
          updated_at: company.updated_at || new Date().toISOString()
        })
      );
    }

    if (allPDVs && allPDVs.pdvs && allPDVs.pdvs.length > 0) {
      const mainPDV = allPDVs.pdvs.find((pdv) => pdv.is_active) || allPDVs.pdvs[0];

      dispatch(
        setPDVResponse({
          id: mainPDV.id,
          name: mainPDV.name,
          address: mainPDV.address,
          phone_number: mainPDV.phone_number || '',
          location: { id: '', name: '' },
          main: true,
          company_id: companies?.[0]?.id || '',
          created_at: mainPDV.created_at,
          updated_at: mainPDV.updated_at
        })
      );
    }

    if (currentSubscription && currentSubscription.id) {
      dispatch(setSubscriptionResponse(currentSubscription));
      dispatch(
        setPlanData({
          plan_id: currentSubscription.plan_code,
          billing_cycle: currentSubscription.billing_cycle,
          auto_renew: true,
          currency: 'COP'
        })
      );
    }
  }, [
    isReady,
    hasError,
    companies,
    allPDVs,
    currentSubscription,
    subscriptionResponse,
    completedSteps,
    currentStep,
    dispatch,
    isUniquePDV
  ]);

  useEffect(() => {
    if (!isReady) return;
    const maxStep = isUniquePDV ? 2 : 3;
    const currentActive = activeStep;

    if (currentActive > maxStep) {
      dispatch(setStep(maxStep));
      return;
    }

    if (isUniquePDV && currentActive === 2 && !completedSteps.includes(StepType.PLAN)) {
      dispatch(setStep(1));
      return;
    }

    if (
      !isUniquePDV &&
      currentActive === StepType.PDV && // Solo verificar cuando estamos exactamente en el paso PDV
      (!allPDVs || !allPDVs.pdvs || allPDVs.pdvs.length === 0) &&
      !pdvResponse
    ) {
      // Mantenerse en el paso PDV si no hay data, pero no retroceder desde pasos posteriores
    }
  }, [
    activeStep,
    completedSteps,
    isUniquePDV,
    currentSubscription,
    subscriptionResponse,
    planData,
    allPDVs,
    isReady,
    dispatch,
    pdvResponse
  ]);

  useEffect(() => {
    if (!isReady) return;

    const hasAnySubscriptionData = !!(currentSubscription || subscriptionResponse);

    if (isUniquePDV && !hasAnySubscriptionData) {
      if (activeStep > StepType.PLAN) {
        dispatch(resetStep(StepType.PLAN));
      }
    }
  }, [isReady, isUniquePDV, currentSubscription, subscriptionResponse, dispatch, activeStep]);

  const isStepOptional = (_step: number) => false;
  const isStepSkipped = (_step: number) => false;
  const isStepCompleted = (step: number) => completedSteps.includes(step);

  /**
   * Maneja el clic en un paso del Stepper.
   * Permite navegar solo a pasos completados o al siguiente paso inmediato.
   * @param {number} step - Índice del paso clicado.
   */
  const handleStepClick = (step: number) => {
    const maxAllowedStep = Math.max(...completedSteps, 0) + 1;

    if (step <= maxAllowedStep || isStepCompleted(step)) {
      // Marcar la dirección de la navegación manual
      if (step < activeStep) {
        lastUserAction.current = 'manual-back';
      } else if (step > activeStep) {
        lastUserAction.current = 'manual-forward';
      }

      dispatch(setStep(step));
    }
  };

  /**
   * Maneja el cierre de sesión del usuario.
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate(paths.auth.jwt.login);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('No se pudo cerrar sesión', { variant: 'error' });
    }
  };

  /**
   * Maneja la navegación manual hacia atrás desde componentes hijo.
   */
  const handleManualBackNavigation = useCallback(() => {
    lastUserAction.current = 'manual-back';
    dispatch(goToPreviousStep());
  }, [dispatch]);

  /**
   * Renderiza el componente del paso actual.
   * @returns {JSX.Element} Componente del paso actual.
   * Flujo 1: uniquePDV → 3 pasos (Company, Plan, Summary)
   * Flujo 2: no uniquePDV → 4 pasos (Company, PDV, Plan, Summary)
   */
  const StepComponent = useMemo(() => {
    if (isUniquePDV) {
      if (activeStep === 0) return <RegisterCompanyForm />;
      if (activeStep === 1) return <PlanSelectionForm />;
      if (activeStep === 2) return <RegisterSummary onManualBack={handleManualBackNavigation} />;
      return <RegisterCompanyForm />;
    }
    if (activeStep === StepType.COMPANY) return <RegisterCompanyForm />;
    if (activeStep === StepType.PDV) return <RegisterPDVForm />;
    if (activeStep === StepType.PLAN) return <PlanSelectionForm />;
    if (activeStep === StepType.SUMMARY) return <RegisterSummary onManualBack={handleManualBackNavigation} />;
    return <RegisterCompanyForm />;
  }, [activeStep, isUniquePDV, handleManualBackNavigation]);

  if (isLoading && !isReady) {
    return <SplashScreen />;
  }

  return (
    <RootStyle>
      <Container>
        <ContentStyle>
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {stepsConfig.map((stepConfig, index) => {
                const stepProps: Partial<StepProps> = {};
                const labelProps: Partial<StepLabelProps> = {};

                if (isStepOptional(index)) {
                  labelProps.optional = <Typography variant="caption">Opcional</Typography>;
                }

                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                } else if (isStepCompleted(index)) {
                  stepProps.completed = true;
                }

                return (
                  <Step key={stepConfig.key} {...stepProps}>
                    <StepLabel
                      {...labelProps}
                      sx={{
                        cursor:
                          isStepCompleted(index) || index <= Math.max(...completedSteps, 0) + 1 ? 'pointer' : 'default',
                        '& .MuiStepLabel-label': {
                          color: isStepCompleted(index) || index === activeStep ? 'primary.main' : 'text.secondary'
                        }
                      }}
                      onClick={() => handleStepClick(index)}
                    >
                      {stepConfig.label}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }} justifyContent="flex-end">
              <Button color="error" size="small" variant="outlined" onClick={handleLogout}>
                Cerrar sesión
              </Button>
            </Stack>
          </Box>

          {StepComponent}
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
