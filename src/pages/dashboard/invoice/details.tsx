import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hook';
// sections
import { InvoiceDetailsView } from 'src/sections/sales/invoice/view';

// ----------------------------------------------------------------------

export default function InvoiceDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Ally360: Invoice Details</title>
      </Helmet>

      <InvoiceDetailsView id={`${id}`} />
    </>
  );
}
