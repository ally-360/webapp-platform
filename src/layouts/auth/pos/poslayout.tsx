// @mui
import Box from '@mui/material/Box';
// hooks
// components
import { useSettingsContext } from 'src/components/settings';
//
import React, { useEffect } from 'react';
import { getAllPDVS } from 'src/redux/inventory/pdvsSlice';
import PopupCreateCategory from 'src/sections/categories/PopupCreateCategory';
import PopupCreateBrand from 'src/sections/brands/PopupCreateBrand';
import FormPDVS from 'src/sections/PDVS/pdv-new-edit-form';
import { useAppDispatch } from 'src/hooks/store';
import { UserPopupCreateView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

interface PosLayoutProps {
  children: React.ReactNode;
}

export default function PosLayout({ children }: PosLayoutProps) {
  const settings = useSettingsContext();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getAllPDVS());
  }, [dispatch]);

  return (
    <Box
      sx={{
        minHeight: 1,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}
    >
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: 1,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
      <PopupCreateCategory />
      <PopupCreateBrand />
      <UserPopupCreateView />
      <FormPDVS />
    </Box>
  );
}
