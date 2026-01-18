import { Helmet } from 'react-helmet-async';

import PurchaseOrderDetailsView from 'src/sections/expenses/view/purchase-order-details-view';

export default function PurchaseOrderDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Detalle Orden de Compra | Gastos</title>
      </Helmet>

      <PurchaseOrderDetailsView />
    </>
  );
}
