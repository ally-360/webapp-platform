import { useParams } from 'react-router-dom';

// @mui
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// routes
import { paths } from 'src/routes/paths';

// redux
import { useGetPurchaseOrderByIdQuery } from 'src/redux/services/billsApi';

// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';

import PurchaseOrderEditForm from '../purchase-order-edit-form';

export default function PurchaseOrderEditView() {
  const params = useParams();
  const id = params.id || '';

  const settings = useSettingsContext();

  const { data, isLoading, isError } = useGetPurchaseOrderByIdQuery(id, { skip: !id });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        icon=""
        heading="Editar Orden de Compra"
        subHeading="Actualiza proveedor, fechas, moneda, términos y líneas de productos."
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Gastos', href: paths.dashboard.bill.root },
          { name: 'Órdenes de Compra', href: paths.dashboard.expenses.purchaseOrders.root },
          { name: 'Editar' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {isLoading && (
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Cargando...
          </Typography>
        </Card>
      )}

      {isError && <Alert severity="error">No fue posible cargar la orden de compra.</Alert>}

      {!!data && <PurchaseOrderEditForm id={id} currentPO={data} />}
    </Container>
  );
}
