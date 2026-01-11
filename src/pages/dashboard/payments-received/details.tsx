import { Helmet } from 'react-helmet-async';
// sections
import { PaymentReceivedDetailsView } from 'src/sections/payments-received/view';

// ----------------------------------------------------------------------

export default function PaymentReceivedDetailsPage() {
  return (
    <>
      <Helmet>
        <title> Detalle de Pago Recibido | Ally360</title>
      </Helmet>

      <PaymentReceivedDetailsView />
    </>
  );
}
