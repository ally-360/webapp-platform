// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { useTranslation } from 'react-i18next';
import InvoiceNewEditForm from '../invoice-new-edit-form';

// ----------------------------------------------------------------------

export default function InvoiceCreateView() {
  const settings = useSettingsContext();

  const { t } = useTranslation();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('Crear factura')}
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'Facturas de venta',
            href: paths.dashboard.sales.root
          },
          {
            name: 'Nueva factura'
          }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <InvoiceNewEditForm />
    </Container>
  );
}
