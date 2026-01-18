import { Helmet } from 'react-helmet-async';

// Sections
import { AccountDetailView } from 'src/sections/treasury/view';

// ----------------------------------------------------------------------

export default function AccountDetailPage() {
  return (
    <>
      <Helmet>
        <title>Detalle de Cuenta | Tesorería</title>
      </Helmet>

      <AccountDetailView />
    </>
  );
}
