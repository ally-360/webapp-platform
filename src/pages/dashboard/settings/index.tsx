import { Helmet } from 'react-helmet-async';
// sections
import { SettingsView } from 'src/sections/settings/view';

// ----------------------------------------------------------------------

export default function SettingsPage() {
  return (
    <>
      <Helmet>
        <title>Configuración General | Ally360</title>
      </Helmet>

      <SettingsView />
    </>
  );
}
