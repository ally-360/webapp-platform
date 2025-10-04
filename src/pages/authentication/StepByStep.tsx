import React, { useEffect, useMemo, useState } from 'react';
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
import RegisterCompanyForm from 'src/pages/authentication/company/RegisterCompanyForm';
import RegisterPDVForm from 'src/pages/authentication/company/RegisterPDVForm';
import RegisterSummary from 'src/pages/authentication/company/RegisterSummary';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { setPrevValuesCompany, setPrevValuesPDV, setStep } from 'src/redux/inventory/stepByStepSlice';
import { paths } from 'src/routes/paths';

const steps = ['Crear empresa', 'Puntos de venta', 'Resumen'];

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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { logout, company, pdvCompany } = useAuthContext();

  const { activeStep } = useAppSelector((state) => state.stepByStep);

  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());

  const isStepOptional = (step: number) => step === 3;
  const isStepSkipped = (step: number) => skippedSteps.has(step);

  useEffect(() => {
    console.log('Company information:', company);
    if (company?.id) {
      console.log('Company already registered:', company);
      dispatch(setPrevValuesCompany(company));
      dispatch(setStep(1));
    }
  }, [company, dispatch]);

  // Sincroniza el paso activo si ya existe un PDV registrado
  useEffect(() => {
    if (pdvCompany) {
      dispatch(setPrevValuesPDV(pdvCompany[0]));
      dispatch(setStep(2));
    }
  }, [pdvCompany, dispatch]);

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
      case 0:
        return <RegisterCompanyForm />;
      case 1:
        return <RegisterPDVForm />;
      case 2:
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
              {steps.map((label, index) => {
                const stepProps: Partial<StepProps> = {};
                const labelProps: Partial<StepLabelProps> = {};

                if (isStepOptional(index)) {
                  labelProps.optional = <Typography variant="caption">Opcional</Typography>;
                }

                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }

                return (
                  <Step key={label} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
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
