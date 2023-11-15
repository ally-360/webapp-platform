import { Helmet } from 'react-helmet-async';
// sections
import { PDVSListView } from 'src/sections/PDVS/view';

// ----------------------------------------------------------------------

export default function PDVSListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Puntos de venta</title>
      </Helmet>

      <PDVSListView />
    </>
  );
}
