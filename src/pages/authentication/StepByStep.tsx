import React, { useMemo, useEffect } from 'react';
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
import {
  setStep,
  setCompanyResponse,
  setPDVResponse,
  setPlanData,
  setSubscriptionResponse
} from 'src/redux/slices/stepByStepSlice';
import { useStepByStepData } from 'src/hooks/use-step-by-step-data';

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

  const activeStep = useAppSelector((state) => state.stepByStep.activeStep);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);
  const isUniquePDV = companyResponse?.uniquePDV;

  const stepsConfig = useMemo(() => getStepsConfig(isUniquePDV), [isUniquePDV]);

  // 🔧 Hook optimizado para obtener datos sin bucles infinitos
  const { companies, allPDVs, currentSubscription, isLoading, isReady, hasError } = useStepByStepData();

  //  Efecto para validar y establecer el paso correcto
  useEffect(() => {
    if (!isReady || hasError) {
      return;
    }

    console.log('🔍 Iniciando validación de paso desde backend...');
    console.log('📦 Empresas:', companies);
    console.log('🏪 PDVs:', allPDVs);
    console.log('💳 Suscripción:', currentSubscription);

    // 📌 PASO 1: Sin empresa → ir a crear empresa
    if (!companies || companies.length === 0) {
      console.log('❌ No hay empresa, ir a paso COMPANY');
      dispatch(setStep(StepType.COMPANY));
      return;
    }

    // 📌 PASO 2: Empresa encontrada → configurar estado
    const company = companies[0];
    console.log('✅ Empresa encontrada:', company);

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
        uniquePDV: company.uniquePDV || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    );

    // 📌 PASO 3: Validar PDVs
    const hasPDVs = allPDVs && allPDVs.pdvs && allPDVs.pdvs.length > 0;
    if (hasPDVs) {
      console.log('✅ PDVs encontrados:', allPDVs.pdvs);
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

      // 📌 PASO 4: Validar suscripción
      if (currentSubscription && currentSubscription.id) {
        console.log('✅ Suscripción encontrada, ir a SUMMARY');

        dispatch(setSubscriptionResponse(currentSubscription));

        dispatch(
          setPlanData({
            plan_id: currentSubscription.plan_code,
            billing_cycle: currentSubscription.billing_cycle,
            auto_renew: true,
            currency: 'COP'
          })
        );
        dispatch(setStep(StepType.SUMMARY));
      } else {
        console.log('🎯 Empresa y PDV completos, ir a PLAN');
        dispatch(setStep(StepType.PLAN));
      }
    } else {
      console.log('📍 Empresa sin PDV, ir a PDV');
      dispatch(setStep(StepType.PDV));
    }
  }, [isReady, hasError, companies, allPDVs, currentSubscription, dispatch]);

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

  // 🔄 Mostrar loading mientras se cargan los datos iniciales
  if (isLoading && !isReady) {
    return (
      <RootStyle>
        <Container>
          <ContentStyle>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
              <Typography variant="h6">Cargando configuración...</Typography>
            </Box>
          </ContentStyle>
        </Container>
      </RootStyle>
    );
  }

  // ⚠️ Mostrar error si hay problemas de conectividad
  if (hasError) {
    return (
      <RootStyle>
        <Container>
          <ContentStyle>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '50vh' }}>
              <Typography variant="h6" color="error" gutterBottom>
                Error de conexión
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No se pudo cargar la configuración. Verifica tu conexión e intenta nuevamente.
              </Typography>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </Box>
          </ContentStyle>
        </Container>
      </RootStyle>
    );
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
