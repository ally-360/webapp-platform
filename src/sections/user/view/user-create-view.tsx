// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { Icon } from '@iconify/react';
import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        icon="icons8:add-user"
        heading="Nuevo contacto"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root
          },
          {
            name: 'Contactos',
            href: paths.dashboard.user.list
          },
          { name: 'Nuevo contacto' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <UserNewEditForm />
    </Container>
  );
}
