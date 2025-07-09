import { Helmet } from 'react-helmet-async';
// sections
import { FaqsView } from 'src/sections/faqs/view';

// ----------------------------------------------------------------------

export default function FaqsPage() {
  return (
    <>
      <Helmet>
        <title> Ally360: Preguntas Frecuentes </title>
        <meta
          name="description"
          content="Preguntas frecuentes sobre Ally360, incluyendo cómo funciona, cómo registrarse, y más."
        />
        <link rel="canonical" href="https://ally360.com/faqs" />
        <meta property="og:title" content="Ally360: Preguntas Frecuentes" />
        <meta
          property="og:description"
          content="Preguntas frecuentes sobre Ally360, incluyendo cómo funciona, cómo registrarse, y más."
        />
        <meta property="og:url" content="https://ally360.com/faqs" />
        <meta property="og:type" content="website" />
      </Helmet>

      <FaqsView />
    </>
  );
}
