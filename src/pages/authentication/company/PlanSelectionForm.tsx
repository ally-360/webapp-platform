import React, { useState, useEffect, useMemo } from 'react';
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
  CircularProgress,
  Skeleton
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { setStep, setPlanData, goToPreviousStep, setSubscriptionResponse } from 'src/redux/slices/stepByStepSlice';
import { PlanSelectionSchema } from 'src/interfaces/auth/yupSchemas';
import { PlanFormData } from 'src/interfaces/stepByStep';
import {
  useGetPlansQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useGetCurrentSubscriptionQuery,
  Plan
} from 'src/redux/services/subscriptionsApi';

export function PlanSelectionForm() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Hooks
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError
  } = useGetPlansQuery({
    is_active: true,
    limit: 50
  });
  const { data: currentSubscription } = useGetCurrentSubscriptionQuery();
  const [createSubscription] = useCreateSubscriptionMutation();
  const [updateSubscription] = useUpdateSubscriptionMutation();

  // Redux state
  const subscriptionResponse = useAppSelector((state) => state.stepByStep.subscriptionResponse);

  const { handleSubmit, watch, setValue, reset } = useForm<PlanFormData>({
    resolver: yupResolver(PlanSelectionSchema),
    defaultValues: {
      plan_id: '',
      billing_cycle: 'monthly',
      auto_renew: true,
      currency: 'COP'
    }
  });

  const selectedPlanId = watch('plan_id');
  const autoRenew = watch('auto_renew');

  const plans = useMemo(() => plansData || [], [plansData]);
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  // Also consider subscription response when detecting selected plan
  useEffect(() => {
    if (subscriptionResponse && plans.length > 0 && !selectedPlanId) {
      // Find and select the plan that matches the current subscription
      const currentPlan = plans.find((plan) => plan.code === subscriptionResponse.plan_code);
      if (currentPlan) {
        setValue('plan_id', currentPlan.id);
      }
    }
  }, [subscriptionResponse, selectedPlanId, setValue, plans]);

  // Auto-load existing subscription data
  useEffect(() => {
    if (currentSubscription && !subscriptionResponse) {
      console.log('🔄 Loading subscription from API:', currentSubscription);

      // Update Redux state with current subscription
      dispatch(setSubscriptionResponse(currentSubscription));

      // Find the plan_id from the plan_code in the subscription
      const planForSubscription = plans.find((plan) => plan.code === currentSubscription.plan_code);

      if (planForSubscription) {
        // Update form with existing data - set the plan that matches the current subscription
        reset({
          plan_id: planForSubscription.id,
          billing_cycle: currentSubscription.billing_cycle,
          auto_renew: true, // Default value since it's not in the response
          currency: 'COP'
        });
      }
    }
  }, [currentSubscription, subscriptionResponse, dispatch, reset, plans]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const hasExistingSubscription = !!currentSubscription?.id;
      let result;

      console.log('🔄 Submitting plan selection:', {
        hasExistingSubscription,
        planId: data.plan_id,
        planCode: selectedPlan?.code,
        currentSubscriptionId: currentSubscription?.id,
        action: hasExistingSubscription ? 'UPDATE (PATCH)' : 'CREATE (POST)'
      });

      if (hasExistingSubscription) {
        // Use PATCH for existing subscriptions
        const updatePayload = {
          plan_id: data.plan_id,
          billing_cycle: data.billing_cycle || 'monthly',
          auto_renew: data.auto_renew || true,
          notes: data.notes
        };

        result = await updateSubscription({
          id: currentSubscription.id,
          data: updatePayload
        }).unwrap();

        const planName = selectedPlan?.name || 'plan';
        enqueueSnackbar(`Plan actualizado a ${planName} exitosamente`, { variant: 'success' });
      } else {
        // Use POST for new subscriptions
        const subscriptionPayload = {
          plan_id: data.plan_id,
          billing_cycle: data.billing_cycle || 'monthly',
          auto_renew: data.auto_renew || true,
          currency: data.currency || 'COP',
          amount: selectedPlan?.monthly_price ? parseFloat(selectedPlan.monthly_price) : undefined,
          notes: data.notes
        };

        result = await createSubscription(subscriptionPayload).unwrap();

        const planName = selectedPlan?.name || 'plan';
        const isFreePlan = selectedPlan?.type === 'free';

        if (isFreePlan) {
          enqueueSnackbar(`${planName} activado exitosamente`, { variant: 'success' });
        } else {
          enqueueSnackbar(`${planName} activado exitosamente. Periodo de prueba iniciado.`, {
            variant: 'success'
          });
        }
      }

      // Update Redux state with the subscription response
      dispatch(setSubscriptionResponse(result));

      // Cast data to PlanFormData since we know it has the right structure
      const planData: PlanFormData = {
        plan_id: data.plan_id,
        billing_cycle: data.billing_cycle || 'monthly',
        auto_renew: data.auto_renew || true,
        currency: data.currency || 'COP',
        start_date: data.start_date,
        end_date: data.end_date,
        trial_end_date: data.trial_end_date,
        amount: data.amount,
        notes: data.notes
      };

      dispatch(setPlanData(planData));
      dispatch(setStep(3)); // Go to summary
    } catch (error: any) {
      console.error('Error creating/updating subscription:', error);
      let errorMessage = 'Error al activar el plan';

      if (error?.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  });

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(numPrice);
  };

  const getPlanFeatures = (plan: Plan): string[] => {
    const features: string[] = [];

    if (plan.max_users) {
      features.push(`Hasta ${plan.max_users} usuarios`);
    } else if (plan.max_users === null) {
      features.push('Usuarios ilimitados');
    }

    if (plan.max_pdvs) {
      features.push(`${plan.max_pdvs} puntos de venta`);
    } else if (plan.max_pdvs === null) {
      features.push('Puntos de venta ilimitados');
    }

    if (plan.max_products) {
      features.push(`Hasta ${plan.max_products} productos`);
    } else if (plan.max_products === null) {
      features.push('Productos ilimitados');
    }

    features.push(`${plan.max_storage_gb}GB de almacenamiento`);

    if (plan.max_invoices_month) {
      features.push(`${plan.max_invoices_month} facturas/mes`);
    } else if (plan.max_invoices_month === null) {
      features.push('Facturas ilimitadas');
    }

    if (plan.has_advanced_reports) features.push('Reportes avanzados');
    if (plan.has_api_access) features.push('Acceso API');
    if (plan.has_multi_currency) features.push('Multi-moneda');
    if (plan.has_inventory_alerts) features.push('Alertas de inventario');
    if (plan.has_email_support) features.push('Soporte por email');
    if (plan.has_phone_support) features.push('Soporte telefónico');
    if (plan.has_priority_support) features.push('Soporte prioritario');

    return features;
  };

  // Show loading state
  if (plansLoading) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
          Elige tu Plan
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <Card sx={{ p: 3 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {[1, 2, 3].map((featureIndex) => (
                    <Skeleton key={featureIndex} variant="text" width="80%" />
                  ))}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Show error state
  if (plansError) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error al cargar los planes. Por favor, inténtalo de nuevo.
        </Alert>
        <Button variant="outlined" onClick={() => dispatch(goToPreviousStep())}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        {currentSubscription ? 'Cambiar Plan' : 'Elige tu Plan'}
      </Typography>

      {currentSubscription && !currentSubscription.is_trial && (
        <Alert severity="success" sx={{ mb: 4 }}>
          <strong>Plan activo:</strong> {currentSubscription.plan_name}
        </Alert>
      )}

      {currentSubscription && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          Al cambiar de plan, tu suscripción actual será actualizada inmediatamente.
        </Alert>
      )}

      {!currentSubscription && plans.some((plan) => plan.type !== 'free') && (
        <Alert severity="info" sx={{ mb: 4 }}>
          🎉 <strong>15 días gratis</strong> para que pruebes todas las funciones de los planes pagos. Cancela cuando
          quieras, sin compromisos.
        </Alert>
      )}

      <form onSubmit={onSubmit}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {plans.map((plan) => (
            <Grid item xs={12} md={6} lg={4} key={plan.id}>
              <Card
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                  border: selectedPlanId === plan.id ? 2 : 1,
                  borderColor: selectedPlanId === plan.id ? 'primary.main' : 'grey.300',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2
                  },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  // Highlight current subscription plan
                  ...(currentSubscription?.plan_code === plan.code && {
                    backgroundColor: 'action.selected',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      backgroundColor: 'success.main'
                    }
                  })
                }}
                onClick={() => setValue('plan_id', plan.id)}
              >
                {plan.is_popular && (
                  <Chip
                    label="Recomendado"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      zIndex: 1
                    }}
                  />
                )}

                {currentSubscription?.plan_code === plan.code && (
                  <Chip
                    label="Plan Actual"
                    color="success"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: plan.is_popular ? 44 : 12,
                      right: 12,
                      zIndex: 1
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {plan.name}
                  </Typography>

                  {plan.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" color="primary" sx={{ mb: 0.5 }}>
                      {formatPrice(plan.monthly_price)}
                      <Typography component="span" variant="body2" color="text.secondary">
                        /mes
                      </Typography>
                    </Typography>
                    {parseFloat(plan.yearly_price) > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        {formatPrice(plan.yearly_price)}/año (ahorra 2 meses)
                      </Typography>
                    )}
                  </Box>

                  <Stack spacing={1} sx={{ flexGrow: 1 }}>
                    {getPlanFeatures(plan).map((feature, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Iconify
                          icon="eva:checkmark-circle-2-fill"
                          sx={{ color: 'success.main', mt: 0.5, flexShrink: 0 }}
                          width={16}
                        />
                        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  {plan.type === 'free' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      🎉 Plan gratuito para siempre
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentSubscription ? 'Configuración de Actualización' : 'Configuración del Plan'}
          </Typography>

          {selectedPlan?.type !== 'free' && (
            <>
              <FormControlLabel
                control={<Switch checked={autoRenew} onChange={(e) => setValue('auto_renew', e.target.checked)} />}
                label="Renovación automática"
                sx={{ mb: 2 }}
              />

              {currentSubscription?.is_trial && (
                <Alert severity="info">
                  {currentSubscription && selectedPlan?.code === currentSubscription.plan_code
                    ? `Mantienes tu plan actual con ${currentSubscription.days_remaining} días restantes de prueba.`
                    : `Al cambiar de plan, conservarás los ${currentSubscription.days_remaining} días restantes de tu período de prueba.`}
                </Alert>
              )}

              {currentSubscription && !currentSubscription.is_trial && (
                <Alert severity="info">
                  {selectedPlan?.code === currentSubscription.plan_code
                    ? 'El plan se renovará automáticamente según el ciclo de facturación configurado.'
                    : 'El cambio de plan será efectivo inmediatamente y se ajustará la facturación.'}
                </Alert>
              )}

              {!currentSubscription && (
                <Alert severity="info">
                  El plan se renovará automáticamente según el ciclo de facturación seleccionado.
                </Alert>
              )}
            </>
          )}

          {selectedPlan?.type === 'free' && (
            <Alert severity="info">
              ✨ El plan gratuito no requiere configuración adicional. Puedes actualizarlo en cualquier momento.
            </Alert>
          )}
        </Card>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="outlined" onClick={() => dispatch(goToPreviousStep())} disabled={isSubmitting}>
            Volver
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{ flexGrow: 1 }}
            size="large"
            disabled={isSubmitting || !selectedPlanId}
          >
            {isSubmitting && <CircularProgress size={24} />}
            {!isSubmitting && currentSubscription && 'Cambiar Plan'}
            {!isSubmitting && !currentSubscription && 'Activar Plan'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
