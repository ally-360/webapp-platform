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
import { useGetSalesInvoiceByIdQuery } from 'src/redux/services/salesInvoicesApi';
//
import InvoiceDetails from '../invoice-details';

// ----------------------------------------------------------------------

export default function InvoiceDetailsView({ id: propId }) {
  const settings = useSettingsContext();
  const params = useParams();

  const id = propId || params.id;

  const {
    data: currentInvoice,
    isLoading,
    isError,
    error
  } = useGetSalesInvoiceByIdQuery(id, {
    skip: !id
  });

  console.log('🔍 RTK Query state:', { currentInvoice, isLoading, isError, error });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!id || isError || !currentInvoice) {
    console.error('❌ Error loading invoice:', error);
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          icon="solar:bill-list-bold-duotone"
          heading="Error"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root
            },
            {
              name: 'Facturas',
              href: paths.dashboard.sales.root
            },
            { name: 'Error' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <div>
          {!id
            ? 'ID de factura no proporcionado'
            : `Error al cargar la factura: ${error?.toString() || 'Error desconocido'}`}
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon="solar:bill-list-bold-duotone"
        heading={currentInvoice?.number}
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'Facturas',
            href: paths.dashboard.sales.root
          },
          { name: currentInvoice?.number }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <InvoiceDetails invoice={currentInvoice} />
    </Container>
  );
}

InvoiceDetailsView.propTypes = {
  id: PropTypes.string
};
