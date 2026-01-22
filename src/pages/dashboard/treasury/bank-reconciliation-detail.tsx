import { Helmet } from 'react-helmet-async';
import BankReconciliationDetailView from 'src/sections/treasury/view/bank-reconciliation-detail-view';

// ----------------------------------------------------------------------

export default function BankReconciliationDetailPage() {
  return (
    <>
      <Helmet>
        <title>Detalle de Conciliación | Tesorería</title>
      </Helmet>

      <BankReconciliationDetailView />
    </>
  );
}
