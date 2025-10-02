import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// api
import { useGetSalesInvoiceByIdQuery } from 'src/redux/services/salesInvoicesApi';
//
import SalesInvoiceNewEditForm from '../sales-invoice-new-edit-form';

// ----------------------------------------------------------------------

export default function InvoiceEditView({ id }) {
  const settings = useSettingsContext();

  const { data: currentInvoice, isLoading, error } = useGetSalesInvoiceByIdQuery(id);

  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <div>Cargando...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <div>Error al cargar la factura</div>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon="solar:bill-list-bold-duotone"
        heading="Editar Factura"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'Facturas de venta',
            href: paths.dashboard.sales.root
          },
          { name: currentInvoice?.number || 'Factura' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <SalesInvoiceNewEditForm currentInvoice={currentInvoice} />
    </Container>
  );
}

InvoiceEditView.propTypes = {
  id: PropTypes.string
};
