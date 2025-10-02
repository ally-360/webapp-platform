import { Helmet } from 'react-helmet-async';
import { BillCreateView } from 'src/sections/bill/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function BillInvoiceCreatePage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Crear factura de compra</title>
      </Helmet>

      <BillCreateView />
    </>
  );
}
