import { Helmet } from 'react-helmet-async';
import { InvoiceListView } from 'src/sections/sales/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function InvoiceListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Facturas de venta</title>
      </Helmet>

      <InvoiceListView />
    </>
  );
}
