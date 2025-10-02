import PropTypes from 'prop-types';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// api
import { useGetContactByIdQuery } from 'src/redux/services/contactsApi';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
//
import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserEditView({ id }) {
  const settings = useSettingsContext();

  const { data: currentUser, isLoading, error } = useGetContactByIdQuery(id || '', { skip: !id });

  if (isLoading) return <LoadingScreen />;

  if (error || !currentUser) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Error"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Contactos', href: paths.dashboard.user.root },
            { name: 'Error' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <div>Contact not found</div>
      </Container>
    );
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Editar Contacto"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Contactos', href: paths.dashboard.user.root },
          { name: currentUser?.name || 'Contacto' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserNewEditForm currentUser={currentUser} />
    </Container>
  );
}

UserEditView.propTypes = {
  id: PropTypes.string
};
