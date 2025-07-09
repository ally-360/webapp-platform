// @mui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
// theme
import React, { useState } from 'react';
// ----------------------------------------------------------------------
import { Stepper, Step, StepLabel, StepConnector, styled } from '@mui/material';
import { Box } from '@mui/system';
import Button from '@mui/material/Button';

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

export default function AppWelcomeStep({ title, description, action, img, ...other }: AppWelcomeStepProps) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  // TODO: agregar validaciones de los pasos, mejorar iconos y revisar los pasos necesarios, y lanzar popups o redirecciones al hacer click en los botones de acción.

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2
      }}
    >
      <Stepper activeStep={activeStep} connector={<CustomConnector />} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={`${step.title}-${index}`}>
            <StepLabel
              icon={
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    bgcolor:
                      activeStep === index || activeStep > index ? theme.palette.primary.main : theme.palette.grey[500],
                    boxShadow: activeStep === index ? 3 : 1,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20
                  }}
                >
                  {index + 1}
                </Box>
              }
            >
              <Typography variant="subtitle1">{step.title}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box mt={4}>
        <Box mt={2} display="flex" alignItems="center">
          <Box
            component="img"
            src={steps[activeStep].img}
            alt={steps[activeStep].title}
            sx={{ width: 100, height: 100, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{steps[activeStep].title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {steps[activeStep].description}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
              }}
            >
              {steps[activeStep].action}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
