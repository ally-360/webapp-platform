import { Helmet } from 'react-helmet-async';
// sections
import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title> ERP Ally360</title>
        <meta name="description" content="ERP Ally360 - Tu aliado en la gestión empresarial" />
        <link rel="canonical" href="https://www.ally360.com" />
        <meta property="og:title" content="ERP Ally360" />
        <meta property="og:description" content="ERP Ally360 - Tu aliado en la gestión empresarial" />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="ERP, Ally360, gestión empresarial, software de gestión, administración de empresas"
        />
        <meta name="author" content="Ally360 Team" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <HomeView />
    </>
  );
}
