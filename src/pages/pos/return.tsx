import { Helmet } from 'react-helmet-async';
import PosReturnView from 'src/sections/pos/view/pos-return-view';

export default function PosReturnPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Devoluciones POS</title>
      </Helmet>

      <PosReturnView />
    </>
  );
}
