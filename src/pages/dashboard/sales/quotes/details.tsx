import { Helmet } from 'react-helmet-async';
// sections
import { QuotesDetailsView } from 'src/sections/sales/quotes/view';

// ----------------------------------------------------------------------

export default function QuotesDetailsPage() {
  return (
    <>
      <Helmet>
        <title>Detalle de Cotización</title>
      </Helmet>

      <QuotesDetailsView />
    </>
  );
}
