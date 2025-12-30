import { Helmet } from 'react-helmet-async';
// sections
import { PaymentReceivedEditView } from 'src/sections/payments-received/view';

// ----------------------------------------------------------------------

export default function PaymentReceivedEditPage() {
  return (
    <>
      <Helmet>
        <title> Editar Pago Recibido | Ally360</title>
      </Helmet>

      <PaymentReceivedEditView />
    </>
  );
}
