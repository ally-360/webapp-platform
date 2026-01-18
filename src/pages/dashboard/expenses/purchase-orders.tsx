import { Helmet } from 'react-helmet-async';
// sections
import PurchaseOrdersListView from 'src/sections/expenses/view/purchase-orders-list-view';

// ----------------------------------------------------------------------

export default function PurchaseOrdersPage() {
  return (
    <>
      <Helmet>
        <title>Órdenes de Compra | Gastos</title>
      </Helmet>

      <PurchaseOrdersListView />
    </>
  );
}
