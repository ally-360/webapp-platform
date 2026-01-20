import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useGetQuoteByIdQuery } from 'src/redux/services/quotesApi';
import { LoadingScreen } from 'src/components/loading-screen';
import QuoteNewEditForm from '../quote-new-edit-form';

// ----------------------------------------------------------------------

export default function QuoteEditView() {
  const settings = useSettingsContext();
  const params = useParams();
  const { id } = params;

  const {
    data: currentQuote,
    isLoading,
    error
  } = useGetQuoteByIdQuery(id!, {
    skip: !id
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !currentQuote) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon=""
          heading="Editar Cotización"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Ventas', href: paths.dashboard.sales.root },
            { name: 'Cotizaciones', href: paths.dashboard.sales.quotes.root },
            { name: 'Editar' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <div>Error cargando la cotización</div>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon=""
        heading="Editar Cotización"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Ventas', href: paths.dashboard.sales.root },
          { name: 'Cotizaciones', href: paths.dashboard.sales.quotes.root },
          { name: currentQuote.quote_number || 'Editar' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <QuoteNewEditForm currentQuote={currentQuote} />
    </Container>
  );
}
