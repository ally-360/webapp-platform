import { Helmet } from 'react-helmet-async';

import { QuoteEditView } from 'src/sections/sales/quotes/view';

// ----------------------------------------------------------------------

export default function QuoteEditPage() {
  return (
    <>
      <Helmet>
        <title>Editar Cotización</title>
      </Helmet>

      <QuoteEditView />
    </>
  );
}
