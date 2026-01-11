import { useParams } from 'react-router';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
// redux
import { useGetPaymentByIdQuery } from 'src/redux/services/paymentsReceivedApi';
//
import PaymentReceivedNewEditForm from '../payment-received-new-edit-form';

// ----------------------------------------------------------------------

export default function PaymentReceivedEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { id } = params;

  const { data: currentPayment, isLoading } = useGetPaymentByIdQuery(id!, {
    skip: !id
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Pago Recibido"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Pagos Recibidos', href: paths.dashboard.paymentsReceived.root },
          { name: currentPayment?.payment_number || id }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <PaymentReceivedNewEditForm currentPayment={currentPayment} />
    </Container>
  );
}
