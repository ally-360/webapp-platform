import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
//
import React, { useEffect } from 'react';
import { getAllPDVS } from 'src/redux/inventory/pdvsSlice';
import { useAppDispatch } from 'src/hooks/store';
import { useAuthContext } from 'src/auth/hooks';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import GlobalModals from './global-modals';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();

  const dispatch = useAppDispatch();
  const { isFirstLogin, authenticated, selectedCompany } = useAuthContext();

  useEffect(() => {
    // Evitar cargar PDVs si es first_login o no hay company seleccionada
    if (authenticated && isFirstLogin === false && selectedCompany) {
      dispatch(getAllPDVS());
    }
  }, [dispatch, authenticated, isFirstLogin, selectedCompany]);

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
