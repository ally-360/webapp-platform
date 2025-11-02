import React, { useState } from 'react';
// @mui
import { Tab, Tabs, Box, Container, Typography } from '@mui/material';
// components
import AccountGeneral from '../account-general';
import AccountInvitations from '../account-invitations';
import AccountCompany from '../account-company';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'Información General',
    component: <AccountGeneral />
  },
  {
    value: 'company',
    label: 'Información de Empresa',
    component: <AccountCompany />
  },
  {
    value: 'invitations',
    label: 'Gestión de Usuarios',
    component: <AccountInvitations />
  }
];

// ----------------------------------------------------------------------

export default function AccountView() {
  const [currentTab, setCurrentTab] = useState('general');

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Mi Cuenta
      </Typography>

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>

      {TABS.map((tab) => tab.value === currentTab && <Box key={tab.value}>{tab.component}</Box>)}
    </Container>
  );
}
