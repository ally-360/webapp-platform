import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
// Redux
import { useGetQuoteByIdQuery } from 'src/redux/services/quotesApi';
//
import QuotesDetails from '../quotes-details';

// ----------------------------------------------------------------------

export default function QuotesDetailsView({ id: propId }) {
  const settings = useSettingsContext();
  const params = useParams();

  const id = propId || params.id;

  const {
    data: currentQuote,
    isLoading,
    isError,
    error
  } = useGetQuoteByIdQuery(id, {
    skip: !id
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!id || isError || !currentQuote) {
    console.error('❌ Error loading quote:', error);
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon=""
          heading="Error"
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
            { name: 'Error' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <div>
          {!id
            ? 'ID de cotización no proporcionado'
            : `Error al cargar la cotización: ${error?.toString() || 'Error desconocido'}`}
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon=""
        heading={currentQuote?.quote_number}
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
          { name: currentQuote?.quote_number }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <QuotesDetails quote={currentQuote} />
    </Container>
  );
}

QuotesDetailsView.propTypes = {
  id: PropTypes.string
};
