import { Helmet } from 'react-helmet-async';
// sections
import { QuotesListView } from 'src/sections/sales/quotes/view';

// ----------------------------------------------------------------------

export default function QuotesListPage() {
  return (
    <>
      <Helmet>
        <title>Ally360: Cotizaciones</title>
      </Helmet>

      <QuotesListView />
    </>
  );
}
