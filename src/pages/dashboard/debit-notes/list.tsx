import { Helmet } from 'react-helmet-async';
// sections
import { DebitNoteListView } from 'src/sections/debit-notes/view';

// ----------------------------------------------------------------------

export default function DebitNoteListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Notas Débito</title>
      </Helmet>

      <DebitNoteListView />
    </>
  );
}
