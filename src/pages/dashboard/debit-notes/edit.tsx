import { Helmet } from 'react-helmet-async';
// sections
import { DebitNoteEditView } from 'src/sections/debit-notes/view';

// ----------------------------------------------------------------------

export default function DebitNoteEditPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Editar Nota Débito</title>
      </Helmet>

      <DebitNoteEditView />
    </>
  );
}
