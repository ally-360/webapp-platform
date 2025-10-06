import { Helmet } from 'react-helmet-async';
// sections
import { AcceptInvitationView } from 'src/sections/auth/accept-invitation';

// ----------------------------------------------------------------------

export default function AcceptInvitationPage() {
  return (
    <>
      <Helmet>
        <title>Ally360: Aceptar Invitación</title>
      </Helmet>

      <AcceptInvitationView />
    </>
  );
}
