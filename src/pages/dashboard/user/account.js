import { Helmet } from 'react-helmet-async';
// sections
import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title> POS: Mi cuenta</title>
      </Helmet>

      <AccountView />
    </>
  );
}
