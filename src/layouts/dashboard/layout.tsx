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
import GlobalModals from './global-modals';

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
        <PopupCreateCategory />
        <PopupCreateBrand />
        <GlobalModals />
        <FormPDVS />
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node
};
