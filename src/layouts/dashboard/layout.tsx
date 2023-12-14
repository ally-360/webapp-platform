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
import PopupCreateCategory from 'src/sections/categories/PopupCreateCategory';
import PopupCreateBrand from 'src/sections/brands/PopupCreateBrand';
import FormPDVS from 'src/sections/PDVS/pdv-new-edit-form';
import { useAppDispatch } from 'src/hooks/store';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const settings = useSettingsContext();

  console.log(settings);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllPDVS());
  }, [dispatch]);

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean(false);

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const hiddenNav = settings.themeLayout === 'hidden';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

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
          <PopupCreateCategory />
          <PopupCreateBrand />
          <FormPDVS />
        </Box>
      </>
    );
  }

  if (hiddenNav) {
    return <>{children}</>;
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
