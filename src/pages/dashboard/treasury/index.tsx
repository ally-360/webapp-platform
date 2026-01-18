import { Helmet } from 'react-helmet-async';
// sections
import { TreasuryView } from 'src/sections/treasury/view';

// ----------------------------------------------------------------------

export default function TreasuryPage() {
  return (
    <>
      <Helmet>
        <title>Bancos | Ally360</title>
      </Helmet>

      <TreasuryView />
    </>
  );
}
