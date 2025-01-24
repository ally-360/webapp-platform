import React, { useState, useEffect } from 'react';

// material
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step, { StepProps } from '@mui/material/Step';
import StepLabel, { StepLabelProps } from '@mui/material/StepLabel';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Stack, styled } from '@mui/material';

import { useNavigate } from 'react-router';
import { useSnackbar } from 'notistack';
import Container from '@mui/material/Container';
import { useAuthContext } from 'src/auth/hooks';
import RegisterCompanyForm from 'src/pages/authentication/company/RegisterCompanyForm';
import RegisterPDVForm from 'src/pages/authentication/company/RegisterPDVForm';
import RegisterSummary from 'src/pages/authentication/company/RegisterSummary';
import { useDispatch, useSelector } from 'react-redux';
import { setPrevValuesCompany, setPrevValuesPDV, setStep } from 'src/redux/inventory/stepByStepSlice';

const steps = ['Crear empresa', 'Puntos de venta', 'Resumen'];

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
  paddingTop: '10vh !important',
  gap: '2rem'
}));

export default function StepByStep() {
  const dispatch = useDispatch();

  const { activeStep } = useSelector((state) => state.stepByStep);

  // Setp by step
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const { company, pdvCompany } = useAuthContext();

  // State steps
  const isStepOptional = (step: number) => step === 3;
  const isStepSkipped = (step: number) => skipped.has(step);

  useEffect(() => {
    console.log(company);
    if (company && company.id) {
      dispatch(setStep(1));
      dispatch(setPrevValuesCompany(company));
    }
  }, [company, dispatch]);

  useEffect(() => {
    if (pdvCompany && pdvCompany.id) {
      console.log(pdvCompany);
      dispatch(setStep(2));
      dispatch(setPrevValuesPDV(pdvCompany));
    }
  }, [pdvCompany, dispatch]);

  // Logout
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout', { variant: 'error' });
    }
  };

  return (
    <RootStyle>
      <Container>
        <ContentStyle>
          <Box sx={{ width: '100%' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => {
                const stepProps: StepProps = {};
                const labelProps: StepLabelProps = {};
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
          {activeStep === 0 && <RegisterCompanyForm />}

          {activeStep === 1 && <RegisterPDVForm />}

          {activeStep === 2 && <RegisterSummary />}
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
