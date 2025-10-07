import React, { useMemo, useEffect, useState } from 'react';
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
import RegisterCompanyForm from 'src/pages/authentication/company/RegisterCompanyFormRefactored';
import RegisterPDVForm from 'src/pages/authentication/company/RegisterPDVForm';
import { PlanSelectionForm } from 'src/pages/authentication/company/PlanSelectionForm';
import RegisterSummary from 'src/pages/authentication/company/RegisterSummaryRefactored';
import { useAppSelector, useAppDispatch } from 'src/hooks/store';
import { paths } from 'src/routes/paths';
import { StepType } from 'src/interfaces/stepByStep';
import { setStep, setCompanyResponse, setPDVResponse, setPlanData } from 'src/redux/slices/stepByStepSlice';
import { useGetMyCompaniesQuery, useGetAllPDVsQuery, useGetCurrentSubscriptionQuery } from 'src/redux/services/authApi';

// Configuración de pasos basada en uniquePDV
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

// Estilo contenedor principal
const RootStyle = styled(Container)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

// Estilo del contenido interno
const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 900,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  padding: theme.spacing(6, 0),
  paddingTop: '10vh !important',
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const activeStep = useAppSelector((state) => state.stepByStep.activeStep);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);
  const isUniquePDV = companyResponse?.uniquePDV;

  const stepsConfig = useMemo(() => getStepsConfig(isUniquePDV), [isUniquePDV]);

  // Consultar backend para determinar el paso inicial
  const { data: companies, isLoading: loadingCompanies, isSuccess: companiesLoaded } = useGetMyCompaniesQuery();
  const shouldLoadPDV = !loadingCompanies && companies && companies.length > 0;
  const {
    data: allPDVs,
    isLoading: loadingPDV,
    isSuccess: pdvLoaded
  } = useGetAllPDVsQuery(undefined, {
    skip: !shouldLoadPDV
  });
  const { data: currentSubscription, isLoading: loadingSubscription } = useGetCurrentSubscriptionQuery(undefined, {
    skip: !shouldLoadPDV
  });

  // Efecto inicial: cargar datos del backend y determinar paso correcto
  useEffect(() => {
    // Esperar a que terminen las consultas iniciales
    if (loadingCompanies || (shouldLoadPDV && loadingPDV) || (shouldLoadPDV && loadingSubscription)) {
      return;
    }

    // Solo ejecutar una vez
    if (initialLoadComplete) {
      return;
    }

    console.log('🔍 Iniciando validación de paso desde backend...');
    console.log('📦 Empresas:', companies);
    console.log('🏪 PDVs:', allPDVs);
    console.log('💳 Suscripción:', currentSubscription);

    // Caso 1: No hay empresa -> ir a paso de empresa
    if (!companies || companies.length === 0) {
      console.log('❌ No hay empresa, ir a paso COMPANY');
      dispatch(setStep(StepType.COMPANY));
      setInitialLoadComplete(true);
      return;
    }

    // Caso 2: Hay empresa -> cargar en Redux y determinar siguiente paso
    const company = companies[0];
    console.log('✅ Empresa encontrada:', company);

    // Actualizar Redux con data del backend
    dispatch(
      setCompanyResponse({
        id: company.id,
        name: company.name,
        description: company.description || '',
        address: company.address || '',
        phone_number: company.phone_number,
        nit: company.nit,
        economic_activity: company.economic_activity || '',
        quantity_employees: String(company.quantity_employees || ''),
        social_reason: company.social_reason || '',
        logo: company.logo || '',
        uniquePDV: company.uniquePDV || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );

    // Caso 3: Verificar PDVs
    const hasPDVs = allPDVs && allPDVs.pdvs && allPDVs.pdvs.length > 0;
    if (hasPDVs) {
      console.log('✅ PDVs encontrados:', allPDVs.pdvs);
      // Cargar el primer PDV en Redux (o el principal si existe)
      const mainPDV = allPDVs.pdvs.find((pdv) => pdv.is_active) || allPDVs.pdvs[0];
      dispatch(
        setPDVResponse({
          id: mainPDV.id,
          name: mainPDV.name,
          address: mainPDV.address,
          phone_number: mainPDV.phone_number || '',
          location: { id: '', name: '' },
          main: true,
          company_id: company.id,
          created_at: mainPDV.created_at,
          updated_at: mainPDV.updated_at
        })
      );

      // Caso 4: Verificar suscripción
      if (currentSubscription && currentSubscription.id) {
        console.log('✅ Suscripción encontrada, ir a SUMMARY');
        dispatch(
          setPlanData({
            plan_id: currentSubscription.plan_code,
            trial_days: currentSubscription.days_remaining,
            auto_renewal: true,
            payment_method: null
          })
        );
        dispatch(setStep(StepType.SUMMARY));
      } else {
        // Si hay empresa y PDV pero no suscripción, ir a plan
        console.log('🎯 Empresa y PDV completos, ir a PLAN');
        dispatch(setStep(StepType.PLAN));
      }
    } else {
      // No hay PDV, ir a crearlo
      console.log('📍 Empresa sin PDV, ir a PDV');
      dispatch(setStep(StepType.PDV));
    }

    setInitialLoadComplete(true);
  }, [
    companies,
    allPDVs,
    currentSubscription,
    loadingCompanies,
    loadingPDV,
    loadingSubscription,
    shouldLoadPDV,
    initialLoadComplete,
    dispatch,
    companiesLoaded,
    pdvLoaded
  ]);

  const isStepOptional = (_step: number) => false;
  const isStepSkipped = (_step: number) => false;

  const handleLogout = async () => {
    try {
      await logout();
      navigate(paths.auth.jwt.login);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('No se pudo cerrar sesión', { variant: 'error' });
    }
  };

  // Mapeo de componentes por paso
  const StepComponent = useMemo(() => {
    switch (activeStep) {
      case StepType.COMPANY:
        return <RegisterCompanyForm />;
      case StepType.PDV:
        return <RegisterPDVForm />;
      case StepType.PLAN:
        return <PlanSelectionForm />;
      case StepType.SUMMARY:
        return <RegisterSummary />;
      default:
        return <Typography>Paso desconocido</Typography>;
    }
  }, [activeStep]);

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
                }

                return (
                  <Step key={stepConfig.key} {...stepProps}>
                    <StepLabel {...labelProps}>{stepConfig.label}</StepLabel>
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
