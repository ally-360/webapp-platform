import { Helmet } from 'react-helmet-async';

import EmailVerificationView from 'src/sections/auth/email-verification-view';

// ----------------------------------------------------------------------

export default function EmailVerificationPage() {
  return (
    <>
      <Helmet>
        <title>Verify Email | Ally360</title>
      </Helmet>

      <EmailVerificationView />
    </>
  );
}
