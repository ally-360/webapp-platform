import { useCallback, useState, useEffect } from 'react';
import { Button, Divider, Grid, Typography, Stack, Box, Alert, Card, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { completeOnboarding, setSubscriptionResponse, setPlanData } from 'src/redux/slices/stepByStepSlice';
import { useGetAllPDVsQuery, authApi } from 'src/redux/services/authApi';
import {
  useUpdateFirstLoginMutation,
  useGetCurrentSubscriptionQuery,
  useGetPlansQuery,
  subscriptionsApi
} from 'src/redux/services/subscriptionsApi';

interface RegisterSummaryProps {
  onManualBack?: () => void;
}

/**
 * Renderiza un bloque de información con título y contenido.
 */
function InfoBlock({ title, value }: { title: string; value?: string | number | null }) {
  return (
    <Grid item xs={12} md={4}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {value || '-'}
      </Typography>
    </Grid>
  );
}

/**
 * Obtiene el texto del ciclo de facturación.
 */
function getBillingCycleText(billingCycle?: string) {
  if (billingCycle === 'monthly') return 'Mensual';
  if (billingCycle === 'yearly') return 'Anual';
  return '-';
}

/**
 * Componente resumen del registro para empresa y PDV principal.
 */
export default function RegisterSummary({ onManualBack }: RegisterSummaryProps) {
  const { company, pdvCompany } = useAuthContext();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isFinishing, setIsFinishing] = useState(false);
  const companyData = useAppSelector((state) => state.stepByStep.companyData);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);
  const pdvData = useAppSelector((state) => state.stepByStep.pdvData);
  const pdvResponse = useAppSelector((state) => state.stepByStep.pdvResponse);
  const planData = useAppSelector((state) => state.stepByStep.planData);
  const subscriptionResponse = useAppSelector((state) => state.stepByStep.subscriptionResponse);
  const { data: apiPDVs } = useGetAllPDVsQuery();
  const firstApiPDV = apiPDVs?.pdvs?.[0];
  const { data: apiSubscription } = useGetCurrentSubscriptionQuery(undefined, {
    skip: false
  });

  const { data: allPlans } = useGetPlansQuery({ is_active: true, limit: 50 });
  const [updateFirstLogin] = useUpdateFirstLoginMutation();

  const getPlanName = useCallback(() => {
    if (subscriptionResponse?.plan_name) {
      return subscriptionResponse.plan_name;
    }

    if (planData?.plan_id && allPlans) {
      const selectedPlan = allPlans.find((plan) => plan.id === planData.plan_id);
      if (selectedPlan) {
        return selectedPlan.name;
      }
    }

    if ((subscriptionResponse?.plan_code || apiSubscription?.plan_code) && allPlans) {
      const planCode = subscriptionResponse?.plan_code || apiSubscription?.plan_code;
      const selectedPlan = allPlans.find((plan) => plan.code === planCode);
      if (selectedPlan) {
        return selectedPlan.name;
      }
    }

    return 'Plan seleccionado';
  }, [subscriptionResponse, planData, allPlans, apiSubscription]);

  useEffect(() => {
    if (apiSubscription && !subscriptionResponse) {
      dispatch(setSubscriptionResponse(apiSubscription));

      if (!planData) {
        dispatch(
          setPlanData({
            plan_id: apiSubscription.plan_code || '',
            billing_cycle: apiSubscription.billing_cycle || 'monthly',
            auto_renew: true,
            currency: 'COP'
          })
        );
      }
    }
  }, [apiSubscription, subscriptionResponse, planData, dispatch]);

  const handleFinish = useCallback(async () => {
    if (isFinishing) return;

    setIsFinishing(true);
    try {
      dispatch(completeOnboarding());
      localStorage.removeItem('ally360-step-by-step');
      await updateFirstLogin({ first_login: false }).unwrap();
      dispatch(authApi.util.invalidateTags(['User']));
      dispatch(subscriptionsApi.util.invalidateTags(['User']));
      navigate(paths.dashboard.root);

      enqueueSnackbar('¡Registro completado exitosamente! Bienvenido a Ally360', {
        variant: 'success',
        autoHideDuration: 5000
      });
    } catch (error) {
      console.error('❌ Error al finalizar el registro:', error);
      enqueueSnackbar('Error al finalizar el registro. Por favor, intenta nuevamente.', {
        variant: 'error'
      });
    } finally {
      setIsFinishing(false);
    }
  }, [dispatch, navigate, enqueueSnackbar, updateFirstLogin, isFinishing]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" gutterBottom>
        Resumen del Registro
      </Typography>

      <Alert severity="success">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>¡Felicidades! Tu empresa ha sido registrada exitosamente.</Typography>
        </Box>
      </Alert>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información de la Empresa
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <InfoBlock title="Nombre" value={companyResponse?.name || companyData?.name || company?.name} />
          <InfoBlock title="NIT" value={companyResponse?.nit || companyData?.nit || company?.nit} />
          <InfoBlock title="Teléfono" value={companyResponse?.phone_number || companyData?.phone_number} />
          <InfoBlock title="Dirección" value={companyResponse?.address || companyData?.address || company?.address} />
          <InfoBlock title="Punto de venta único" value={companyResponse?.uniquePDV ? 'Sí' : 'No'} />
        </Grid>
      </Card>

      {(!companyResponse?.uniquePDV || pdvResponse || pdvData || firstApiPDV) &&
        (pdvResponse || pdvData || firstApiPDV || pdvCompany?.[0]) && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Punto de Venta Principal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <InfoBlock
                title="Nombre"
                value={pdvResponse?.name || pdvData?.name || firstApiPDV?.name || pdvCompany?.[0]?.name}
              />
              <InfoBlock
                title="Dirección"
                value={pdvResponse?.address || pdvData?.address || firstApiPDV?.address || pdvCompany?.[0]?.address}
              />
              <InfoBlock
                title="Teléfono"
                value={
                  pdvResponse?.phone_number ||
                  pdvData?.phone_number ||
                  firstApiPDV?.phone_number ||
                  pdvCompany?.[0]?.phone_number
                }
              />
              <InfoBlock title="Principal" value={pdvResponse?.main ? 'Sí' : 'No'} />
              <InfoBlock title="Estado" value={pdvResponse || firstApiPDV ? 'Activo' : '-'} />
            </Grid>
          </Card>
        )}

      {(planData || subscriptionResponse) && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Plan de Suscripción
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <InfoBlock title="Plan" value={getPlanName()} />
            <InfoBlock title="Ciclo de facturación" value={getBillingCycleText(planData?.billing_cycle)} />
            {subscriptionResponse?.is_trial && (
              <InfoBlock title="Días restantes" value={subscriptionResponse.days_remaining} />
            )}
            <InfoBlock title="Renovación automática" value={planData?.auto_renew ? 'Sí' : 'No'} />
            {subscriptionResponse?.max_users && (
              <InfoBlock title="Usuarios máximos" value={subscriptionResponse.max_users} />
            )}
            {subscriptionResponse?.max_pdvs && <InfoBlock title="PDVs máximos" value={subscriptionResponse.max_pdvs} />}
          </Grid>
        </Card>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={onManualBack} disabled={isFinishing}>
          Volver
        </Button>
        <Button
          variant="contained"
          size="large"
          sx={{ flexGrow: 1 }}
          onClick={handleFinish}
          disabled={isFinishing}
          startIcon={isFinishing ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {isFinishing ? 'Finalizando...' : 'Finalizar y acceder al dashboard'}
        </Button>
      </Stack>
    </Stack>
  );
}
