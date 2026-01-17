import { Helmet } from 'react-helmet-async';
// sections
import ExpenseDebitNotesListView from 'src/sections/expenses/view/expense-debit-notes-list-view';

// ----------------------------------------------------------------------

export default function ExpenseDebitNotesPage() {
  return (
    <>
      <Helmet>
        <title>Notas Débito | Gastos</title>
      </Helmet>

      <ExpenseDebitNotesListView />
    </>
  );
}
