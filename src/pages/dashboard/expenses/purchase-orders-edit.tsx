import { Helmet } from 'react-helmet-async';

import PurchaseOrderEditView from 'src/sections/expenses/view/purchase-order-edit-view';

export default function PurchaseOrderEditPage() {
  return (
    <>
      <Helmet>
        <title>Editar Orden de Compra | Gastos</title>
      </Helmet>

      <PurchaseOrderEditView />
    </>
  );
}
