import { useState, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import AccountCompany from 'src/sections/account/account-company';
import AccountGeneral from '../account-general';
import AccountBilling from '../account-billing';
import AccountSocialLinks from '../account-social-links';
import AccountNotifications from '../account-notifications';
import AccountChangePassword from '../account-change-password';
import AccountInvitations from '../account-invitations';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />
  },
  {
    value: 'invitations',
    label: 'Gestión de Usuarios',
    icon: <Iconify icon="tabler:mail-forward" width={24} />
  },
  {
    value: 'company',
    label: 'Empresa',
    icon: <Iconify icon="ion:business" width={24} />
  },
  {
    value: 'billing',
    label: 'Facturación',
    icon: <Iconify icon="solar:bill-list-bold" width={24} />
  },
  {
    value: 'security',
    label: 'Cambiar contraseña',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />
  }
];

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext();

  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Mi cuenta"
        icon="ic:round-account-circle"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuario', href: paths.dashboard.user.root },
          { name: 'Gestión de Usuarios', href: paths.dashboard.user.invitations },
          { name: 'Mi cuenta' }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} icon={tab.icon} value={tab.value} />
        ))}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral />}

      {currentTab === 'company' && <AccountCompany />}

      {currentTab === 'billing' && <AccountBilling />}

      {currentTab === 'invitations' && <AccountInvitations />}

      {currentTab === 'notifications' && <AccountNotifications />}

      {currentTab === 'social' && <AccountSocialLinks socialLinks={[]} />}

      {currentTab === 'security' && <AccountChangePassword />}
    </Container>
  );
}
