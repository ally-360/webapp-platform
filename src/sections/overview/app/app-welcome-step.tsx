// @mui
import { useTheme } from '@mui/material/styles';
import { Typography, Stepper, Step, StepLabel, StepConnector, styled, Box, Button, useMediaQuery } from '@mui/material';
import React, { useState } from 'react';

interface AppWelcomeStepProps {
  title: string;
  description: string;
  action: React.ReactNode;
  img: React.ReactNode;
}

const steps = [
  {
    title: 'Crea tu primer producto',
    description:
      'Puedes crear tu primer producto haciendo click en el botón "Nuevo producto" o en el menú lateral. Puedes crear categorías, marcas y asociarlas a tu producto.',
    icon: 'ic:round-add-box',
    action: 'Crear producto',
    img: '/assets/icons/faqs/ic_package.svg',
    url: '/products/new'
  },
  {
    title: 'Agrega tu primer cliente',
    description: 'Ve a la sección de contactos y registra tu primer cliente. Así podrás asociarlo a tus ventas.',
    icon: 'ic:round-person-add',
    action: 'Agregar cliente',
    img: '/assets/icons/faqs/ic_account.svg',
    url: '/contacts/new'
  },
  {
    title: 'Genera tu primera factura',
    description:
      'Haz tu primera venta desde el POS o desde la sección de ventas y genera tu primera factura compatible con la DIAN.',
    icon: 'ic:round-receipt-long',
    action: 'Generar factura',
    img: '/assets/icons/faqs/ic_assurances.svg',
    url: '/sales/new'
  }
];

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: theme.palette.divider,
    borderTopWidth: 2,
    minHeight: 2
  }
}));

export default function AppWelcomeStep({
  title: _title,
  description: _description,
  action: _action,
  img: _img,
  ...other
}: AppWelcomeStepProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 3 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
        minHeight: { xs: 300, sm: 350, md: 400 }
      }}
      {...other}
    >
      <Stepper
        activeStep={activeStep}
        connector={<CustomConnector />}
        alternativeLabel={!isMobile}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{
          mb: { xs: 3, sm: 4 },
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
            fontWeight: 500
          }
        }}
      >
        {steps.map((step, index) => (
          <Step key={`${step.title}-${index}`}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    width: { xs: 32, sm: 38, md: 42 },
                    height: { xs: 32, sm: 38, md: 42 },
                    borderRadius: '50%',
                    bgcolor:
                      activeStep === index || activeStep > index ? theme.palette.primary.main : theme.palette.grey[500],
                    boxShadow: activeStep === index ? 3 : 1,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: { xs: 14, sm: 16, md: 20 },
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {index + 1}
                </Box>
              }
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                  textAlign: { xs: 'left', sm: 'center' },
                  mt: { xs: 0, sm: 1 }
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
          gap={{ xs: 2, sm: 3 }}
        >
          <Box
            component="img"
            src={steps[activeStep].img}
            alt={steps[activeStep].title}
            sx={{
              width: { xs: 80, sm: 90, md: 100 },
              height: { xs: 80, sm: 90, md: 100 },
              flexShrink: 0,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />

          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                fontWeight: 600,
                mb: { xs: 1, sm: 1.5 },
                color: 'text.primary'
              }}
            >
              {steps[activeStep].title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: { xs: 2, sm: 3 },
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.875rem' },
                lineHeight: 1.6,
                maxWidth: { xs: '100%', sm: 400, md: 450 }
              }}
            >
              {steps[activeStep].description}
            </Typography>

            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 1.5, sm: 2 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  console.log(`Navigating to: ${steps[activeStep].url}`);
                }}
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  py: { xs: 1, sm: 1.2 },
                  px: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                {steps[activeStep].action}
              </Button>

              {activeStep < steps.length - 1 && (
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    py: { xs: 1, sm: 1.2 },
                    px: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    textTransform: 'none'
                  }}
                >
                  Siguiente paso
                </Button>
              )}

              {activeStep > 0 && (
                <Button
                  variant="text"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    py: { xs: 0.5, sm: 1 },
                    px: { xs: 1, sm: 2 },
                    textTransform: 'none',
                    color: 'text.secondary'
                  }}
                >
                  Anterior
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: { xs: 3, sm: 4 },
            pt: { xs: 2, sm: 3 },
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Paso {activeStep + 1} de {steps.length}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
