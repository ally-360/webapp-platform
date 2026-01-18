import { Helmet } from 'react-helmet-async';
// sections
import { MovementsListView } from 'src/sections/treasury/view';

// ----------------------------------------------------------------------

export default function TreasuryMovementsPage() {
  return (
    <>
      <Helmet>
        <title>Movimientos de Tesorería | Ally360</title>
      </Helmet>

      <MovementsListView />
    </>
  );
}
