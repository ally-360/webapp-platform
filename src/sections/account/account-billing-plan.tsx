import PropTypes from 'prop-types';
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
// assets
import { PlanFreeIcon, PlanStarterIcon, PlanPremiumIcon } from 'src/assets/icons';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
//
import { AddressListDialog } from '../address';
import PaymentCardListDialog from '../payment/payment-card-list-dialog';

// ----------------------------------------------------------------------

export default function AccountBillingPlan({ cardList, addressBook, plans }) {
  const openAddress = useBoolean();

  const openCards = useBoolean();

  const primaryAddress = addressBook.filter((address) => address.primary)[0];

  const primaryCard = cardList.filter((card) => card.primary)[0];

  const [selectedPlan, setSelectedPlan] = useState('');

  const [selectedAddress, setSelectedAddress] = useState(primaryAddress);

  const [selectedCard, setSelectedCard] = useState(primaryCard);

  const handleSelectPlan = useCallback(
    (newValue) => {
      const currentPlan = plans.filter((plan) => plan.primary)[0].subscription;
      if (currentPlan !== newValue) {
        setSelectedPlan(newValue);
      }
    },
    [plans]
  );

  const handleSelectAddress = useCallback((newValue) => {
    setSelectedAddress(newValue);
  }, []);

  const handleSelectCard = useCallback((newValue) => {
    setSelectedCard(newValue);
  }, []);

  const renderPlans = plans.map((plan) => (
    <Grid xs={12} md={4} key={plan.subscription}>
      <Stack
        component={Paper}
        variant="outlined"
        onClick={() => handleSelectPlan(plan.subscription)}
        sx={{
          p: 2.5,
          position: 'relative',
          cursor: 'pointer',
          ...(plan.primary && {
            opacity: 0.48,
            cursor: 'default'
          }),
          ...(plan.subscription === selectedPlan && {
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.text.primary}`
          })
        }}
      >
        {plan.primary && (
          <Label
            color="info"
            startIcon={<Iconify icon="eva:star-fill" />}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            Actual
          </Label>
        )}

        <Box sx={{ width: 48, height: 48 }}>
          {(plan.subscription === 'ally-kickstart' || plan.subscription === 'basic') && <PlanFreeIcon />}
          {(plan.subscription === 'ally-boost' || plan.subscription === 'starter') && <PlanStarterIcon />}
          {(plan.subscription === 'ally-supreme' || plan.subscription === 'premium') && <PlanPremiumIcon />}
        </Box>

        <Box sx={{ typography: 'subtitle2', mt: 2, mb: 0.5 }}>{plan.name || plan.subscription}</Box>

        {plan.description && (
          <Box sx={{ typography: 'caption', color: 'text.secondary', mb: 1 }}>{plan.description}</Box>
        )}

        <Stack direction="row" alignItems="center" sx={{ typography: 'h4' }}>
          {plan.price ? `$${plan.price.toLocaleString('es-CO')}` : 'Gratis'}

          {!!plan.price && (
            <Box component="span" sx={{ typography: 'body2', color: 'text.disabled', ml: 0.5 }}>
              /mes
            </Box>
          )}
        </Stack>
      </Stack>
    </Grid>
  ));

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
              {plans.find((p) => p.subscription === selectedPlan)?.name || selectedPlan || '-'}
            </Grid>
          </Grid>

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
                {selectedAddress?.name}
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Dirección de facturación
            </Grid>
            <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
              {selectedAddress?.fullAddress}
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 0.5, md: 2 }}>
            <Grid xs={12} md={4} sx={{ color: 'text.secondary' }}>
              Teléfono de facturación
            </Grid>
            <Grid xs={12} md={8} sx={{ color: 'text.secondary' }}>
              {selectedAddress?.phoneNumber}
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
                {selectedCard?.cardNumber}
              </Button>
            </Grid>
          </Grid>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack spacing={1.5} direction="row" justifyContent="flex-end" sx={{ p: 3 }}>
          <Button variant="outlined">Cancelar Plan</Button>
          <Button variant="contained">Actualizar Plan</Button>
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

AccountBillingPlan.propTypes = {
  addressBook: PropTypes.array,
  cardList: PropTypes.array,
  plans: PropTypes.array
};
