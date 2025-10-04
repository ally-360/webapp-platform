import { Helmet } from 'react-helmet-async';
import { BillEditView } from 'src/sections/bill/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function BillInvoiceEditPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Editar factura de compra</title>
      </Helmet>

      <BillEditView />
    </>
  );
}
