import { Helmet } from 'react-helmet-async';
// sections
import { DebitNoteCreateView } from 'src/sections/debit-notes/view';

// ----------------------------------------------------------------------

export default function DebitNoteCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Nueva Nota Débito</title>
      </Helmet>

      <DebitNoteCreateView />
    </>
  );
}
