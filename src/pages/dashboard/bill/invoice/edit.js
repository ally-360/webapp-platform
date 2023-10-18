import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hook';
import { InvoiceEditView } from 'src/sections/bill/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function InvoiceEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Ally360: Editar factura de compra</title>
      </Helmet>

      <InvoiceEditView id={`${id}`} />
    </>
  );
}
