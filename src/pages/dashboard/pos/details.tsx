import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettingsContext } from 'src/components/settings';
// routes
import { useParams } from 'src/routes/hook';
// sections
import { PosContainerView } from 'src/sections/pos/view';

// ----------------------------------------------------------------------

export default function OrderDetailsPage() {
  const params = useParams();

  const { id } = params;

  const settings = useSettingsContext();

  // Verifica si themeStretch es false y actualiza su valor a true
  useEffect(() => {
    if (!settings.themeStretch) {
      settings.onUpdate('themeStretch', true);
    }
  }, [settings]);

  return (
    <>
      <Helmet>
        <title> Ally360: POS app</title>
      </Helmet>

      <PosContainerView id={`${id}`} />
    </>
  );
}
