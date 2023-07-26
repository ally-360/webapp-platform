import { Helmet } from 'react-helmet-async';
import JWTForgotPasswordView from 'src/sections/auth/jwt/jwt-forgot-password-view';
// sections

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> POS: Olvide contraseña</title>
      </Helmet>

      <JWTForgotPasswordView />
    </>
  );
}
