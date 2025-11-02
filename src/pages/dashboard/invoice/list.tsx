import { Helmet } from 'react-helmet-async';
// sections
import { InvoiceListView } from 'src/sections/sales/invoice/view';

// ----------------------------------------------------------------------

export default function InvoiceListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Invoice List</title>
      </Helmet>

      <InvoiceListView />
    </>
  );
}
