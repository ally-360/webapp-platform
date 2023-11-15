import { Helmet } from 'react-helmet-async';
import { InvoiceCreateView } from 'src/sections/bill/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function SalesInvoiceCreatePage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Crear factura de compra</title>
      </Helmet>

      <InvoiceCreateView />
    </>
  );
}
