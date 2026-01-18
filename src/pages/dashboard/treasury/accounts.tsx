import { Helmet } from 'react-helmet-async';
// sections
import { AccountsListView } from 'src/sections/treasury/view';

// ----------------------------------------------------------------------

export default function TreasuryAccountsPage() {
  return (
    <>
      <Helmet>
        <title>Cuentas de Tesorería | Ally360</title>
      </Helmet>

      <AccountsListView />
    </>
  );
}
