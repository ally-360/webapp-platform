import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hook';
import { InvoiceDetailsView } from 'src/sections/bill/invoice/view';
// sections

// ----------------------------------------------------------------------

export default function InvoiceDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Ally360: Factura de compra</title>
      </Helmet>

      <InvoiceDetailsView id={`${id}`} />
    </>
  );
}
