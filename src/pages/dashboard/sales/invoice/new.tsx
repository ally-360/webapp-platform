import { Helmet } from 'react-helmet-async';
import { InvoiceCreateView } from 'src/sections/sales/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function SalesInvoiceCreatePage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Crear factura</title>
      </Helmet>

      <InvoiceCreateView />
    </>
  );
}
