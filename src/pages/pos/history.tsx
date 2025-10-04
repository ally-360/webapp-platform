import { Helmet } from 'react-helmet-async';
// sections
import { PosSalesHistoryView } from 'src/sections/pos/view';

export default function PosSalesHistoryPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Historial POS</title>
      </Helmet>

      <PosSalesHistoryView />
    </>
  );
}
