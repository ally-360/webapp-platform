import { useParams } from 'react-router';
// @mui
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
// RTK Query
import { useGetBillByIdQuery } from 'src/redux/services/billsApi';
//
import BillNewEditForm from '../bill-new-edit-form';

// ----------------------------------------------------------------------

export default function BillEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { id } = params;

  // Fetch bill details
  const { data: bill, isLoading, error } = useGetBillByIdQuery(id!);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !bill) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon="mdi:file-document-edit"
          heading="Factura no encontrada"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
            { name: 'Editar' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      </Container>
    );
  }

  // Only allow editing draft bills
  if (bill.status !== 'draft') {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon="mdi:file-document-edit"
          heading="No se puede editar"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
            { name: bill.number }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Container sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Solo las facturas en estado &quot;Borrador&quot; pueden ser editadas.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estado actual: {bill.status}
          </Typography>
        </Container>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon="mdi:file-document-edit"
        heading="Editar Factura de Compra"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
          { name: bill.number },
          { name: 'Editar' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BillNewEditForm currentBill={bill} />
    </Container>
  );
}
