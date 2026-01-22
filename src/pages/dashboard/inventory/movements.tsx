import { Helmet } from 'react-helmet-async';

import MovementsListView from 'src/sections/inventory/view/movements-list-view';

// ----------------------------------------------------------------------

export default function InventoryMovementsPage() {
  return (
    <>
      <Helmet>
        <title>Movimientos de Inventario | Ally360</title>
      </Helmet>

      <MovementsListView />
    </>
  );
}
