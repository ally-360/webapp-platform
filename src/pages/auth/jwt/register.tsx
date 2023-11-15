import { Helmet } from 'react-helmet-async';
// sections
import { JwtRegisterView } from 'src/sections/auth/jwt';
import React from 'react';
// ----------------------------------------------------------------------

export default function RegisterPage() {
  return (
    <>
      <Helmet>
        <title> Ally 360: Registro</title>
      </Helmet>

      <JwtRegisterView />
    </>
  );
}
