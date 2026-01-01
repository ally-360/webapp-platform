import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';
// redux
import { useGetDebitNoteByIdQuery } from 'src/redux/services/debitNotesApi';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
//
import DebitNoteNewEditForm from '../debit-note-new-edit-form';

// ----------------------------------------------------------------------

export default function DebitNoteEditView() {
  const settings = useSettingsContext();
  const params = useParams();

  const { id } = params;

  const { data: currentDebitNote, isLoading } = useGetDebitNoteByIdQuery(id!, {
    skip: !id
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Nota Débito"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notas Débito', href: paths.dashboard.debitNotes.root },
          { name: currentDebitNote?.number || 'Editar' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <DebitNoteNewEditForm currentDebitNote={currentDebitNote} />
    </Container>
  );
}
