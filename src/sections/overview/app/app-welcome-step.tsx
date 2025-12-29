// @mui
import { useTheme } from '@mui/material/styles';
import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  styled,
  Box,
  Button,
  useMediaQuery,
  Chip
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// hooks
import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import { useAuthContext } from 'src/auth/hooks';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { useWelcomeStepStatus } from './hooks/use-welcome-step-status';

const steps = [
  {
    title: 'Crea tu primer producto',
    description:
      'Puedes crear tu primer producto haciendo click en el botón "Nuevo producto" o en el menú lateral. Puedes crear categorías, marcas y asociarlas a tu producto.',
    icon: 'solar:box-bold-duotone',
    action: 'Crear productos',
    img: '/assets/icons/faqs/ic_package.svg',
    url: paths.dashboard.inventory.newProduct
  },
  {
    title: 'Agrega tu primer cliente',
    description: 'Ve a la sección de contactos y registra tu primer cliente. Así podrás asociarlo a tus ventas.',
    icon: 'solar:user-plus-bold-duotone',
    action: 'Agregar cliente',
    img: '/assets/icons/faqs/ic_account.svg',
    url: '/dashboard/contacts'
  },
  {
    title: 'Genera tu primera factura',
    description:
      'Haz tu primera venta desde el POS o desde la sección de ventas y genera tu primera factura compatible con la DIAN.',
    icon: 'solar:document-add-bold-duotone',
    action: 'Generar factura',
    img: '/assets/icons/faqs/ic_assurances.svg',
    url: paths.dashboard.sales.newSale
  }
];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
    minHeight: 2
  }
}));

export default function AppWelcomeStep() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const { company } = useAuthContext();

  // Usar el hook personalizado para obtener el estado
  const { isCompleted: allStepsCompleted, hasProducts, hasContacts, hasInvoices, isLoading } = useWelcomeStepStatus();

  // También mantener las queries individuales para obtener el estado de loading
  const { isLoading: loadingProducts } = useGetProductsQuery({ limit: 1 }, { skip: !company?.id });
  const { isLoading: loadingContacts } = useGetContactsQuery({ limit: 1 }, { skip: !company?.id });
  const { isLoading: loadingInvoices } = useGetSalesInvoicesQuery({ limit: 1 }, { skip: !company?.id });

  // Auto-avanzar al siguiente paso si el actual está completado
  useEffect(() => {
    if (loadingProducts || loadingContacts || loadingInvoices) return;

    let nextStep = 0;

    if (hasProducts) nextStep = 1;
    if (hasProducts && hasContacts) nextStep = 2;
    if (hasProducts && hasContacts && hasInvoices) nextStep = 3; // Completado

    setActiveStep(Math.min(nextStep, steps.length - 1));
  }, [hasProducts, hasContacts, hasInvoices, loadingProducts, loadingContacts, loadingInvoices]);

  // Función para manejar el clic en el botón principal
  const handleStepAction = () => {
    const currentStep = steps[activeStep];
    if (currentStep.url) {
      navigate(currentStep.url);
    }
  };

  // Determinar si un paso está completado
  const isStepCompleted = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return hasProducts;
      case 1:
        return hasContacts;
      case 2:
        return hasInvoices;
      default:
        return false;
    }
  };

  // Determinar el estado del paso actual
  const getCurrentStepStatus = () => {
    if (activeStep >= steps.length) {
      return { completed: true, message: '¡Felicidades! Has completado todos los pasos.' };
    }

    const isCompleted = isStepCompleted(activeStep);
    if (isCompleted) {
      return { completed: true, message: '¡Paso completado! Continúa con el siguiente.' };
    }

    return { completed: false, message: 'Completa este paso para continuar.' };
  };

  const stepStatus = getCurrentStepStatus();

  // Debug para desarrollo
  console.log('🎯 Welcome Step Debug:', {
    activeStep,
    hasProducts,
    hasContacts,
    hasInvoices,
    stepStatus,
    allStepsCompleted,
    currentStepUrl: steps[activeStep]?.url
  });

  // Si todos los pasos están completados, no renderizar el componente
  if (allStepsCompleted && !isLoading) {
    return null;
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2.5, md: 3 },
        bgcolor: 'background.paper',
        borderRadius: { xs: 1.5, sm: 2 },
        boxShadow: 2,
        minHeight: { xs: 280, sm: 320, md: 400 },
        height: 'fit-content'
      }}
    >
      <Stepper
        activeStep={activeStep}
        connector={<CustomConnector />}
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{
          mb: { xs: 2, sm: 3, md: 4 },
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
            fontWeight: 500
          },
          '& .MuiStepLabel-root': {
            '& .Mui-completed': {
              color: theme.palette.primary.main
            },
            '& .Mui-active': {
              color: theme.palette.primary.main
            }
          }
        }}
      >
        {steps.map((step, index) => (
          <Step key={`${step.title}-${index}`}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    width: { xs: 28, sm: 34, md: 42 },
                    height: { xs: 28, sm: 34, md: 42 },
                    borderRadius: '50%',
                    bgcolor: (() => {
                      if (isStepCompleted(index)) return theme.palette.success.main;
                      if (activeStep === index) return theme.palette.primary.main;
                      return theme.palette.grey[400];
                    })(),
                    boxShadow: activeStep === index ? 3 : 1,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: 12, sm: 14, md: 20 },
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isStepCompleted(index) ? <Iconify icon="solar:check-circle-bold" width={20} /> : index + 1}
                </Box>
              }
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.875rem' },
                  textAlign: { xs: 'left', sm: 'center' },
                  mt: { xs: 0, sm: 1 },
                  lineHeight: { xs: 1.2, sm: 1.4 }
                }}
              >
                {step.title}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          gap={{ xs: 1.5, sm: 2, md: 3 }}
        >
          <Box
            component="img"
            src={steps[activeStep].img}
            alt={steps[activeStep].title}
            sx={{
              width: { xs: 60, sm: 80, md: 100 },
              height: { xs: 60, sm: 80, md: 100 },
              flexShrink: 0,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
              borderRadius: 1
            }}
          />

          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                fontWeight: 600,
                mb: { xs: 0.8, sm: 1, md: 1.5 },
                color: 'text.primary',
                lineHeight: { xs: 1.3, sm: 1.4 },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              {steps[activeStep].title}
              {isStepCompleted(activeStep) && (
                <Chip
                  label="Completado"
                  color="success"
                  size="small"
                  icon={<Iconify icon="solar:check-circle-bold" width={16} />}
                />
              )}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: { xs: 1.5, sm: 2, md: 3 },
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
                maxWidth: { xs: '100%', sm: 380, md: 450 }
              }}
            >
              {steps[activeStep].description}
            </Typography>

            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1, sm: 1.5, md: 2 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleStepAction}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                  py: { xs: 0.8, sm: 1, md: 1.2 },
                  px: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: { xs: 32, sm: 36, md: 40 },
                  background: isStepCompleted(activeStep) ? theme.palette.success.main : theme.palette.primary.main,
                  '&:hover': {
                    background: isStepCompleted(activeStep) ? theme.palette.success.dark : theme.palette.primary.dark
                  }
                }}
              >
                {(() => {
                  if (isStepCompleted(activeStep)) {
                    return activeStep === steps.length - 1 ? 'Ir al Dashboard' : 'Siguiente Paso';
                  }
                  return steps[activeStep].action;
                })()}
              </Button>

              <Box
                display="flex"
                gap={{ xs: 1, sm: 1.5 }}
                flexDirection={{ xs: 'row', sm: 'row' }}
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                {activeStep > 0 && (
                  <Button
                    variant="text"
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      py: { xs: 0.5, sm: 0.8, md: 1 },
                      px: { xs: 1, sm: 1.5, md: 2 },
                      textTransform: 'none',
                      color: 'text.secondary',
                      minHeight: { xs: 28, sm: 32, md: 36 }
                    }}
                  >
                    ← Anterior
                  </Button>
                )}

                {activeStep < steps.length - 1 && (
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep((prev) => prev + 1)}
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      py: { xs: 0.5, sm: 0.8, md: 1 },
                      px: { xs: 1.5, sm: 2, md: 2.5 },
                      borderRadius: 2,
                      textTransform: 'none',
                      minHeight: { xs: 28, sm: 32, md: 36 }
                    }}
                  >
                    Siguiente →
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 2, sm: 3, md: 4 },
            pt: { xs: 1.5, sm: 2, md: 3 },
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center'
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
            }}
          >
            Paso {activeStep + 1} de {steps.length}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
