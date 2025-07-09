import React from 'react';
import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hook';
// sections
import { PosContainerView } from 'src/sections/pos/view';

// ----------------------------------------------------------------------

export default function OrderDetailsPage() {
  const params = useParams();

  return (
    <>
      <Helmet>
        <title> Ally360: POS app</title>
      </Helmet>

      <PosContainerView />
    </>
  );
}
