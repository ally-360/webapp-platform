import { Helmet } from 'react-helmet-async';
import { BillListView } from 'src/sections/bill/invoice/view';
import React from 'react';

// sections

// ----------------------------------------------------------------------

export default function BillInvoiceListPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Facturas de compra</title>
      </Helmet>

      <BillListView />
    </>
  );
}
