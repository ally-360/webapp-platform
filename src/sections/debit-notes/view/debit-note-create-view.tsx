import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import DebitNoteNewEditForm from '../debit-note-new-edit-form';

// ----------------------------------------------------------------------

export default function DebitNoteCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Nueva Nota Débito"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notas Débito', href: paths.dashboard.debitNotes.root },
          { name: 'Nueva' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <DebitNoteNewEditForm />
    </Container>
  );
}
