import { Helmet } from 'react-helmet-async';
// sections
import { DebitNoteDetailsView } from 'src/sections/debit-notes/view';

// ----------------------------------------------------------------------

export default function DebitNoteDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Detalle Nota Débito</title>
      </Helmet>

      <DebitNoteDetailsView />
    </>
  );
}
