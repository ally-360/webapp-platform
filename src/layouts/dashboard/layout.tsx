import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
//
import React from 'react';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import { useAuthContext } from 'src/auth/hooks';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import GlobalModals from './global-modals';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();

  const { isFirstLogin, authenticated, selectedCompany } = useAuthContext();

  // Fetch PDVs using RTK Query - solo si está autenticado, no es first login y hay company
  const shouldFetch = authenticated && isFirstLogin === false && selectedCompany;
  useGetPDVsQuery(undefined, {
    skip: !shouldFetch
  });

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean(false);

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  return (
    <>
      <Header onOpenNav={nav.onTrue} />

      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {isMini && lgUp ? renderNavMini : renderNavVertical}

        <Main>{children}</Main>
        <GlobalModals />
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node
};
