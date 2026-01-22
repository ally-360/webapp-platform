import { Helmet } from 'react-helmet-async';
import { BankReconciliationsListView } from 'src/sections/treasury/view';

// ----------------------------------------------------------------------

export default function BankReconciliationsPage() {
  return (
    <>
      <Helmet>
        <title>Conciliaciones Bancarias | Tesorería</title>
      </Helmet>

      <BankReconciliationsListView />
    </>
  );
}
