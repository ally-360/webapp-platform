import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import PaymentReceivedNewEditForm from '../payment-received-new-edit-form';

// ----------------------------------------------------------------------

export default function PaymentReceivedCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Nuevo Pago Recibido"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Pagos Recibidos', href: paths.dashboard.paymentsReceived.root },
          { name: 'Nuevo' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <PaymentReceivedNewEditForm />
    </Container>
  );
}
