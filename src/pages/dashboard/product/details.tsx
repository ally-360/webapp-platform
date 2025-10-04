import { Helmet } from 'react-helmet-async';
// routes
import { useParams } from 'src/routes/hook';
// sections
import { ProductDetailsView } from 'src/sections/product/view';
import React from 'react';
// ----------------------------------------------------------------------

export default function ProductDetailsPage() {
  const params = useParams();

  const { id } = params;

  return (
    <>
      <Helmet>
        <title>Ally360: Detalle del producto</title>
      </Helmet>

      <ProductDetailsView id={`${id}`} />
    </>
  );
}
