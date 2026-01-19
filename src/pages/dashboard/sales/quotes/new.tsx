import { Helmet } from 'react-helmet-async';
// sections
import QuoteNewEditForm from 'src/sections/sales/quotes/quote-new-edit-form';
// components
import { Container } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export default function QuotesNewPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Nueva Cotización | Ally360</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon=""
          heading="Crear Cotización"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root
            },
            {
              name: 'Ventas',
              href: paths.dashboard.sales.root
            },
            {
              name: 'Cotizaciones',
              href: paths.dashboard.sales.quotes.root
            },
            {
              name: 'Nueva'
            }
          ]}
          sx={{ mb: 3 }}
        />

        <QuoteNewEditForm />
      </Container>
    </>
  );
}
