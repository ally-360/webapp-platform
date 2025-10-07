import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Stack,
  Alert,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useAppDispatch } from 'src/hooks/store';
import { setStep, setPlanData, goToPreviousStep } from 'src/redux/slices/stepByStepSlice';
import { PlanSelectionSchema } from 'src/interfaces/auth/yupSchemas';
import { PlanFormData } from 'src/interfaces/stepByStep';

// Plan options actualizados Ally360
const PLAN_OPTIONS = [
  {
    id: 'kickstart',
    name: 'Ally Kickstart',
    price: 50000,
    currency: 'COP',
    features: [
      'Facturación electrónica ilimitada DIAN',
      'Hasta 2 usuarios (Admin + Contador)',
      '1 bodega',
      'POS básico para ventas simples',
      'Contabilidad básica integrada',
      'Soporte vía chat estándar',
      '1 GB de almacenamiento',
      'Prueba gratis 30 días'
    ],
    recommended: false
  },
  {
    id: 'boost',
    name: 'Ally Boost',
    price: 75000,
    currency: 'COP',
    features: [
      'Todo lo de Kickstart +',
      'Chatbot IA Ally360 (asistente virtual inteligente)',
      'Hasta 600 facturas electrónicas/mes',
      'Hasta 5 usuarios (todos los roles)',
      'Hasta 3 bodegas + traslados',
      'POS avanzado',
      'Reportes avanzados y analítica',
      'Envío de facturas por WhatsApp',
      'Soporte prioritario',
      '3 GB de almacenamiento',
      'Solicitar demo'
    ],
    recommended: true
  },
  {
    id: 'supreme',
    name: 'Ally Supreme',
    price: 116000,
    currency: 'COP',
    features: [
      'Todo lo de Boost +',
      'Chatbot IA Ally360 Premium (análisis predictivos y recomendaciones)',
      'Facturación electrónica ilimitada',
      'Hasta 10 usuarios (todos los roles)',
      'Hasta 10 bodegas + traslados',
      'POS completo',
      'Integraciones y API abierta',
      'Envío masivo por WhatsApp',
      'Soporte personalizado + onboarding',
      '5 GB de almacenamiento',
      'Agendar llamada'
    ],
    recommended: false
  }
];

export function PlanSelectionForm() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { handleSubmit, watch, setValue } = useForm<PlanFormData>({
    resolver: yupResolver(PlanSelectionSchema),
    defaultValues: {
      plan_id: 'professional',
      trial_days: 15,
      auto_renewal: true,
      payment_method: null
    }
  });

  const selectedPlanId = watch('plan_id');
  const trialDays = watch('trial_days');
  const autoRenewal = watch('auto_renewal');

  const selectedPlan = PLAN_OPTIONS.find((plan) => plan.id === selectedPlanId);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      enqueueSnackbar(`Plan ${selectedPlan?.name} activado exitosamente. ${trialDays} días de prueba gratis.`, {
        variant: 'success'
      });

      dispatch(setPlanData(data));
      dispatch(setStep(3));
    } catch (error) {
      enqueueSnackbar('Error al activar el plan', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  });

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency === 'COP' ? 'COP' : currency
    }).format(price);

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        Elige tu Plan
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        🎉 <strong>15 días gratis</strong> para que pruebes todas las funciones. Cancela cuando quieras, sin
        compromisos.
      </Alert>

      <form onSubmit={onSubmit}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {PLAN_OPTIONS.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: selectedPlanId === plan.id ? 2 : 1,
                  borderColor: selectedPlanId === plan.id ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2
                  }
                }}
                onClick={() => setValue('plan_id', plan.id)}
              >
                {plan.recommended && (
                  <Chip
                    label="Recomendado"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12
                    }}
                  />
                )}

                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {plan.name}
                  </Typography>

                  <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                    {formatPrice(plan.price, plan.currency)}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /mes
                    </Typography>
                  </Typography>

                  <Stack spacing={1}>
                    {plan.features.map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} width={16} />
                        <Typography variant="body2">{feature}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Configuración del Plan
          </Typography>

          <FormControlLabel
            control={<Switch checked={autoRenewal} onChange={(e) => setValue('auto_renewal', e.target.checked)} />}
            label="Renovación automática después del período de prueba"
            sx={{ mb: 2 }}
          />

          <Alert severity="warning">
            Durante los primeros {trialDays} días no se realizará ningún cobro. Puedes cancelar en cualquier momento.
          </Alert>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button variant="outlined" onClick={() => dispatch(goToPreviousStep())} disabled={isSubmitting}>
            Volver
          </Button>

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Activar Plan'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
