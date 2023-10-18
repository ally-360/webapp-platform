import { Helmet } from 'react-helmet-async';
// sections
import { AccountView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Mi cuenta</title>
      </Helmet>

      <AccountView />
    </>
  );
}
