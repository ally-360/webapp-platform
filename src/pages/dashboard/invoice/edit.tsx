import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hook';
// sections
import { InvoiceEditView } from 'src/sections/sales/invoice/view';

// ----------------------------------------------------------------------

export default function InvoiceEditPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title> Ally360: Invoice Edit</title>
      </Helmet>

      <InvoiceEditView id={`${id}`} />
    </>
  );
}
