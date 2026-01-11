import { Helmet } from 'react-helmet-async';
// sections
import { PaymentReceivedListView } from 'src/sections/payments-received/view';

// ----------------------------------------------------------------------

export default function PaymentReceivedListPage() {
  return (
    <>
      <Helmet>
        <title> Pagos Recibidos | Ally360</title>
      </Helmet>

      <PaymentReceivedListView />
    </>
  );
}
