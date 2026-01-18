import { Helmet } from 'react-helmet-async';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// sections
import PurchaseOrderNewForm from 'src/sections/expenses/purchase-order-new-form';

// ----------------------------------------------------------------------

export default function PurchaseOrderNewPage() {
  const settings = useSettingsContext();

  return (
    <>
      <Helmet>
        <title>Nueva Orden de Compra | Gastos</title>
      </Helmet>

      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          icon=""
          heading="Nueva Orden de Compra"
          subHeading="Crea una orden de compra para solicitar productos a un proveedor. Este documento no genera movimientos en inventario ni contables."
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Gastos', href: paths.dashboard.bill.root },
            { name: 'Órdenes de Compra', href: paths.dashboard.expenses.purchaseOrders.root },
            { name: 'Nueva' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <PurchaseOrderNewForm />
      </Container>
    </>
  );
}
