// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BillNewEditForm from '../bill-new-edit-form';

// ----------------------------------------------------------------------

export default function BillCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon="mdi:file-document-plus"
        heading="Nueva Factura de Compra"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
          { name: 'Nueva' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BillNewEditForm />
    </Container>
  );
}
