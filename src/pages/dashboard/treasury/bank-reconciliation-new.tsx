import { Helmet } from 'react-helmet-async';

import BankReconciliationNewView from 'src/sections/treasury/view/bank-reconciliation-new-view';

// ----------------------------------------------------------------------

export default function BankReconciliationNewPage() {
  return (
    <>
      <Helmet>
        <title>Nueva Conciliación Bancaria | Ally360</title>
      </Helmet>

      <BankReconciliationNewView />
    </>
  );
}
