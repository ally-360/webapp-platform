import { Helmet } from 'react-helmet-async';
// sections
import { JournalEntryCreateView } from 'src/sections/accounting/view';

// ----------------------------------------------------------------------

export default function JournalEntryNewPage() {
  return (
    <>
      <Helmet>
        <title>Ally360: Crear Asiento Contable</title>
      </Helmet>

      <JournalEntryCreateView />
    </>
  );
}
