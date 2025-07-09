import { Helmet } from 'react-helmet-async';
// sections
import { OverviewAppView } from 'src/sections/overview/app/view';
import React from 'react';
// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Dashboard</title>
      </Helmet>

      <OverviewAppView />
    </>
  );
}
