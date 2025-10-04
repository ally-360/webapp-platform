import { Helmet } from 'react-helmet-async';
import { BillDetailsView } from 'src/sections/bill/invoice/view';

// ----------------------------------------------------------------------

export default function BillInvoiceDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Factura de compra</title>
      </Helmet>

      <BillDetailsView />
    </>
  );
}
