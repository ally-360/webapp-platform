import { Helmet } from 'react-helmet-async';
// sections
import { PosListView } from 'src/sections/pos/view';

// ----------------------------------------------------------------------

export default function OrderListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Pos list</title>
      </Helmet>

      <PosListView />
    </>
  );
}
