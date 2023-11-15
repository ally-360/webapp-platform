import { Helmet } from 'react-helmet-async';
import { InvoiceListView } from 'src/sections/bill/invoice/view';
import React from 'react';

// sections

// ----------------------------------------------------------------------

export default function InvoiceListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Facturas de compra</title>
      </Helmet>

      <InvoiceListView />
    </>
  );
}
