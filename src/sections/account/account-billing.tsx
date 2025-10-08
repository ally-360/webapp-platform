// @mui
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useGetPlansQuery, useGetCurrentSubscriptionQuery } from 'src/redux/services/subscriptionsApi';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import AccountBillingPlan from './account-billing-plan';
import AccountBillingPayment from './account-billing-payment';
import AccountBillingHistory from './account-billing-history';

// ----------------------------------------------------------------------

export default function AccountBilling(): JSX.Element {
  // Fetch datos del backend
  const { data: plans, isLoading: plansLoading, error: plansError } = useGetPlansQuery({ is_active: true });

  const {
    data: currentSubscription,
    isLoading: subscriptionLoading,
    error: subscriptionError
  } = useGetCurrentSubscriptionQuery();

  // Mock data para componentes que aún no tienen backend
  const mockCards = [
    {
      id: '1',
      cardNumber: '**** **** **** 1234',
      cardType: 'visa',
      primary: true
    }
  ];

  const mockAddressBook = [
    {
      id: '1',
      name: 'Dirección Principal',
      fullAddress: 'Calle 123 #45-67, Bogotá, Colombia',
      phoneNumber: '+57 300 123 4567',
      primary: true
    }
  ];

  const mockInvoices = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      createdAt: '2024-01-15T10:00:00Z',
      price: 29900
    }
  ];

  // Loading state
  if (plansLoading || subscriptionLoading) {
    return <LoadingScreen />;
  }

  // Error handling
  if (plansError || subscriptionError) {
    console.error('Error loading billing data:', { plansError, subscriptionError });
  }

  return (
    <Grid container spacing={5} disableEqualOverflow>
      <Grid xs={12} md={8}>
        <AccountBillingPlan
          plans={plans || []}
          currentSubscription={currentSubscription}
          cardList={mockCards}
          addressBook={mockAddressBook}
        />

        <AccountBillingPayment cards={mockCards} />
      </Grid>

      <Grid xs={12} md={4}>
        <AccountBillingHistory invoices={mockInvoices} />
      </Grid>
    </Grid>
  );
}
