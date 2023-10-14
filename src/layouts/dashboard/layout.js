import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
//
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { getAllPDVS } from 'src/redux/inventory/pdvsSlice';
import PopupCreateCategory from 'src/sections/categories/PopupCreateCategory';
import PopupCreateBrand from 'src/sections/brands/PopupCreateBrand';
import FormPDVS from 'src/sections/PDVS/pdv-new-edit-form';
import { useLocation } from 'react-router';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllPDVS());
  }, [dispatch]);

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  const location = useLocation(); // Obtiene la ubicación actual desde React Router

  useEffect(() => {
    if (
      location.pathname === '/dashboard/pos' &&
      settings.themeStretch === false &&
      settings.themeLayout === 'horizontal'
    ) {
      settings.onUpdate('themeStretch', true);
      settings.onUpdate('themeLayout', 'mini');
    }
    if (location.pathname !== '/dashboard/pos' && settings.themeStretch === true && settings.themeLayout === 'mini') {
      settings.onUpdate('themeStretch', false);
      settings.onUpdate('themeLayout', 'horizontal');
    }
  }, [location, settings]);

  if (isHorizontal) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main>{children}</Main>
      </>
    );
  }

  if (isMini) {
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
          {lgUp ? renderNavMini : renderNavVertical}

          <Main>{children}</Main>
        </Box>
      </>
    );
  }

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
        {renderNavVertical}

        <Main>{children}</Main>
        <PopupCreateCategory />
        <PopupCreateBrand />
        <FormPDVS />
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node
};
