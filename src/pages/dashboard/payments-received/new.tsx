import { Helmet } from 'react-helmet-async';
// sections
import { PaymentReceivedCreateView } from 'src/sections/payments-received/view';

// ----------------------------------------------------------------------

export default function PaymentReceivedNewPage() {
  return (
    <>
      <Helmet>
        <title> Nuevo Pago Recibido | Ally360</title>
      </Helmet>

      <PaymentReceivedCreateView />
    </>
  );
}
