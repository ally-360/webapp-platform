// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useTranslation } from 'react-i18next';
//
import JournalEntryNewForm from '../journal-entry-new-form';

// ----------------------------------------------------------------------

export default function JournalEntryCreateView() {
  const settings = useSettingsContext();
  const { t } = useTranslation();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Crear Asiento Contable"
        icon="solar:document-add-bold-duotone"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'Contabilidad',
            href: paths.dashboard.accounting.root
          },
          {
            name: 'Asientos Contables',
            href: paths.dashboard.accounting.journal.root
          },
          {
            name: 'Nuevo'
          }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <JournalEntryNewForm />
    </Container>
  );
}
