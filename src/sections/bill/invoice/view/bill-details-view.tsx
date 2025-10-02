import { useParams } from 'react-router';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
// RTK Query
import { useGetBillByIdQuery } from 'src/redux/services/billsApi';
//
import BillDetails from '../bill-details';

// ----------------------------------------------------------------------

export default function BillDetailsView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { id } = params;

  const { data: bill, isLoading, error } = useGetBillByIdQuery(id!);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !bill) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon="mdi:file-document"
          heading="Factura no encontrada"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
            { name: 'Detalle' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon="mdi:file-document"
        heading={`Factura ${bill.number}`}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
          { name: bill.number }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BillDetails bill={bill} />
    </Container>
  );
}
