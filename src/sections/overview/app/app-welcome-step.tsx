// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
// theme
import { bgGradient } from 'src/theme/css';
import React from 'react';
import { Step, StepContent, StepLabel, Stepper } from '@mui/material';
// ----------------------------------------------------------------------

interface AppWelcomeStepProps {
  title: string;
  description: string;
  action: React.ReactNode;
  img: React.ReactNode;
}

export default function AppWelcomeStep({ title, description, action, img, ...other }: AppWelcomeStepProps) {
  const theme = useTheme();
  const steps = [
    {
      label: 'Crea tu primer producto',
      description: `Puedes crear tu primer producto haciendo click en el botón "Nuevo producto" o en el menú lateral. puedes crear categorias, marcas y asociarlas a tu producto.`
    },
    {
      label: 'Crea tu primer producto',
      description: `Puedes crear tu primer producto haciendo click en el botón "Nuevo producto" o en el menú lateral. puedes crear categorias, marcas y asociarlas a tu producto.`
    },
    {
      label: 'Crea tu primer producto',
      description: `Puedes crear tu primer producto haciendo click en el botón "Nuevo producto" o en el menú lateral. puedes crear categorias, marcas y asociarlas a tu producto.`
    }
  ];
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  return (
    <Stack
      flexDirection={{ xs: 'column', md: 'row' }}
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.light, 0.2),
          endColor: alpha(theme.palette.primary.main, 0.2)
        }),
        height: { md: 1 },
        borderRadius: 2,
        position: 'relative',
        color: 'primary.darker',
        backgroundColor: 'common.white'
      }}
      {...other}
    >
      <Stack
        flexGrow={1}
        justifyContent="center"
        alignItems={{ xs: 'center', md: 'flex-start' }}
        sx={{
          p: {
            xs: theme.spacing(5, 3, 0, 3),
            md: theme.spacing(5)
          },
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        <Stepper sx={{ width: '100%' }} activeStep={activeStep}>
          {steps.map((stepInfo, index) => {
            const stepProps = {};
            const labelProps = {};
            return (
              <Step sx={{ maxWidth: 'calc(100% / 3)' }} key={stepInfo.label} {...stepProps}>
                <StepLabel {...labelProps}>{stepInfo.label}</StepLabel>
                <StepContent>
                  <Typography>{stepInfo.description}</Typography>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
      </Stack>
    </Stack>
  );
}
