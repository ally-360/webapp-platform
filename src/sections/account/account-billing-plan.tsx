import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useUpdateSubscriptionMutation, useCancelSubscriptionMutation } from 'src/redux/services/subscriptionsApi';
import { useSnackbar } from 'src/components/snackbar';
// assets
import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
// types
import type { Plan, Subscription } from 'src/redux/services/subscriptionsApi';
import type { BillingAddress, PaymentCard } from 'src/interfaces/billing';
//
import { AddressListDialog } from '../address';
import PaymentCardListDialog from '../payment/payment-card-list-dialog';

// ----------------------------------------------------------------------

interface AccountBillingPlanProps {
  plans: Plan[];
  currentSubscription?: Subscription;
  cardList: PaymentCard[];
  addressBook: BillingAddress[];
}

export default function AccountBillingPlan({
  plans,
  currentSubscription,
  cardList,
  addressBook
}: AccountBillingPlanProps) {
  const { enqueueSnackbar } = useSnackbar();
  const openAddress = useBoolean(false);
  const openCards = useBoolean(false);

  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [cancelSubscription] = useCancelSubscriptionMutation();

  const primaryAddress = addressBook.find((address) => address.primary) || addressBook[0];
  const primaryCard = cardList.find((card) => card.primary) || cardList[0];

  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(primaryAddress);
  const [selectedCard, setSelectedCard] = useState(primaryCard);

  const handleSelectPlan = useCallback(
    (planId: string) => {
      // Find the plan by id to get its code for comparison
      const plan = plans.find((p) => p.id === planId);
      if (plan && currentSubscription?.plan_code !== plan.code) {
        setSelectedPlan(planId);
      }
    },
    [currentSubscription, plans]
  );

  const handleSelectAddress = useCallback((newValue: BillingAddress) => {
    setSelectedAddress(newValue);
  }, []);

  const handleSelectCard = useCallback((newValue: PaymentCard) => {
    setSelectedCard(newValue);
  }, []);

  const handleUpdatePlan = useCallback(async () => {
    if (!selectedPlan || !currentSubscription) return;

    try {
      await updateSubscription({
        id: currentSubscription.id,
        data: { plan_id: selectedPlan }
      }).unwrap();

      enqueueSnackbar('Plan actualizado correctamente', { variant: 'success' });
      setSelectedPlan('');
    } catch (error) {
      console.error('Error updating plan:', error);
      enqueueSnackbar('Error al actualizar el plan', { variant: 'error' });
    }
  }, [selectedPlan, currentSubscription, updateSubscription, enqueueSnackbar]);

  const handleCancelPlan = useCallback(async () => {
    if (!currentSubscription) return;

    try {
      await cancelSubscription(currentSubscription.id).unwrap();
      enqueueSnackbar('Plan cancelado correctamente', { variant: 'success' });
    } catch (error) {
      console.error('Error canceling plan:', error);
      enqueueSnackbar('Error al cancelar el plan', { variant: 'error' });
    }
  }, [currentSubscription, cancelSubscription, enqueueSnackbar]);

  const getPlanIcon = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'free':
        return <PlanFreeIcon />;
      case 'basic':
      case 'starter':
        return <PlanStarterIcon />;
      case 'professional':
      case 'premium':
      case 'enterprise':
        return <PlanPremiumIcon />;
      default:
        return <PlanFreeIcon />;
    }
  };

  const formatPrice = (monthlyPrice: string, yearlyPrice: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    const monthly = parseFloat(monthlyPrice);
    const yearly = parseFloat(yearlyPrice);

    if (monthly === 0 && yearly === 0) return 'Gratis';

    const price = billingCycle === 'yearly' ? yearly : monthly;
    return `$${price.toLocaleString('es-CO')}`;
  };

  const renderPlans = plans.map((plan) => {
    const isCurrentPlan = currentSubscription?.plan_code === plan.code;
    const isSelected = selectedPlan === plan.id;

    return (
      <Grid xs={12} md={4} key={plan.id}>
        <Stack
          component={Paper}
          variant="outlined"
          onClick={() => handleSelectPlan(plan.id)}
          sx={{
            p: 2.5,
            position: 'relative',
            cursor: 'pointer',
            ...(isCurrentPlan && {
              opacity: 0.48,
              cursor: 'default'
            }),
            ...(isSelected && {
              boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`
            })
          }}
        >
          {isCurrentPlan && (
            <Label
              color="info"
              startIcon={<Iconify icon="eva:star-fill" />}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              Actual
            </Label>
          )}

          <Box sx={{ width: 48, height: 48 }}>{getPlanIcon(plan.type)}</Box>

          <Box sx={{ typography: 'subtitle2', mt: 2, mb: 0.5 }}>{plan.name}</Box>

          {plan.description && (
            <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>{plan.description}</Box>
          )}

          <Stack direction="row" alignItems="center" sx={{ typography: 'h4' }}>
            {formatPrice(plan.monthly_price, plan.yearly_price, currentSubscription?.billing_cycle || 'monthly')}

            {(parseFloat(plan.monthly_price) > 0 || parseFloat(plan.yearly_price) > 0) && (
              <Box component="span" sx={{ typography: 'body2', color: 'text.disabled', ml: 0.5 }}>
                /{currentSubscription?.billing_cycle === 'yearly' ? 'año' : 'mes'}
              </Box>
            )}
          </Stack>
        </Stack>
      </Grid>
    );
  });

  return (
    <>
      <Card>
        <CardHeader title="Plan de Facturación" />

        <Grid container spacing={2} sx={{ p: 3 }}>
          {renderPlans}
        </Grid>

        <Stack spacing={2} sx={{ p: 3, pt: 0, typography: 'body2' }}>
          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Plan
            </Grid>
            <Grid xs={12} md={8} sx={{ typography: 'subtitle2' }}>
              {currentSubscription?.plan_name || 'No hay suscripción activa'}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Estado
            </Grid>
            <Grid xs={12} md={8} sx={{ typography: 'subtitle2' }}>
              {currentSubscription?.status === 'active' && 'Activo'}
              {currentSubscription?.status === 'trial' &&
                `Prueba (${currentSubscription.days_remaining} días restantes)`}
              {currentSubscription?.status === 'cancelled' && 'Cancelado'}
              {currentSubscription?.status === 'expired' && 'Expirado'}
              {!currentSubscription && 'Sin suscripción'}
            </Grid>
          </Grid>

          {/* Información de límites del plan (si existen) */}
          {currentSubscription && (
            <>
              {(currentSubscription.max_users !== null || currentSubscription.max_pdvs !== null) && (
                <Grid container spacing={{ xs: 0.5, md: 2 }}>
                  <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
                    Límites
                  </Grid>
                  <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
                    {currentSubscription.max_users !== null && `${currentSubscription.max_users} usuarios`}
                    {currentSubscription.max_users !== null && currentSubscription.max_pdvs !== null && ' • '}
                    {currentSubscription.max_pdvs !== null && `${currentSubscription.max_pdvs} PDVs`}
                    {!currentSubscription.max_users && !currentSubscription.max_pdvs && 'Sin límites'}
                  </Grid>
                </Grid>
              )}
            </>
          )}

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Nombre de facturación
            </Grid>
            <Grid xs={12} md={8}>
              <Button
                onClick={openAddress.onTrue}
                endIcon={<Iconify width={16} icon="eva:arrow-ios-downward-fill" />}
                sx={{ typography: 'subtitle2', p: 0, borderRadius: 0 }}
              >
                {selectedAddress?.name || 'No configurado'}
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Dirección de facturación
            </Grid>
            <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
              {selectedAddress?.fullAddress || 'No configurada'}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Teléfono de facturación
            </Grid>
            <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
              {selectedAddress?.phoneNumber || 'No configurado'}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Método de pago
            </Grid>
            <Grid xs={12} md={8}>
              <Button
                onClick={openCards.onTrue}
                endIcon={<Iconify width={16} icon="eva:arrow-ios-downward-fill" />}
                sx={{ typography: 'subtitle2', p: 0, borderRadius: 0 }}
              >
                {selectedCard?.cardNumber || 'No configurado'}
              </Button>
            </Grid>
          </Grid>

          {currentSubscription?.next_billing_date && (
            <Grid container spacing={{ xs: 0.5, md: 2 }}>
              <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
                Próxima facturación
              </Grid>
              <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
                {new Date(currentSubscription.next_billing_date).toLocaleDateString('es-CO')}
              </Grid>
            </Grid>
          )}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={1.5} direction="row" justifyContent="flex-end" sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCancelPlan}
            disabled={!currentSubscription || currentSubscription.status === 'cancelled'}
          >
            Cancelar Plan
          </Button>
          <Button variant="contained" onClick={handleUpdatePlan} disabled={!selectedPlan}>
            {selectedPlan ? 'Actualizar Plan' : 'Seleccionar Plan'}
          </Button>
        </Stack>
      </Card>

      <PaymentCardListDialog
        list={cardList}
        open={openCards.value}
        onClose={openCards.onFalse}
        selected={(selectedId) => selectedCard?.id === selectedId}
        onSelect={handleSelectCard}
      />

      <AddressListDialog
        list={addressBook}
        open={openAddress.value}
        onClose={openAddress.onFalse}
        selected={(selectedId) => selectedAddress?.id === selectedId}
        onSelect={handleSelectAddress}
        action={
          <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />} sx={{ alignSelf: 'flex-end' }}>
            Nueva
          </Button>
        }
      />
    </>
  );
}
