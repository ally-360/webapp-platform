// @mui
import Box from '@mui/material/Box';
// hooks
// components
//
import React, { useEffect, useMemo, useState } from 'react';
import { getAllPDVS } from 'src/redux/inventory/pdvsSlice';
import { useAppDispatch } from 'src/hooks/store';
import GlobalModals from 'src/layouts/dashboard/global-modals';
import PosTopbar from 'src/sections/pos/components/pos-topbar';
import { useLocation } from 'react-router-dom';
import PosSettingsDrawer from 'src/sections/pos/pos-settings-drawer';

// ----------------------------------------------------------------------

interface PosLayoutProps {
  children: React.ReactNode;
}

export default function PosLayout({ children }: PosLayoutProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(getAllPDVS());
  }, [dispatch]);

  // Drawer settings for main POS view
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // local bridge to tell topbar if drawer is open (only relevant in main POS route)
  const isMainPosRoute = useMemo(() => location.pathname === '/pos', [location.pathname]);

  useEffect(() => {
    // whenever route changes to non-pos, reset the flag and notify listeners
    if (!isMainPosRoute) {
      try {
        localStorage.setItem('pos_open_drawer', 'false');
        window.dispatchEvent(new Event('pos:open-drawer-changed'));
      } catch (e) {
        // ignore
      }
    }
  }, [isMainPosRoute]);

  return (
    <Box
      sx={{
        minHeight: 1,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}
    >
      {/* POS Topbar always visible */}
      <PosTopbar onOpenSettings={() => setShowSettingsDrawer(true)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: 1,
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          pt: { xs: 10, md: 12 } // offset for fixed AppBar
        }}
      >
        {children}
      </Box>

      {/* Settings Drawer accessible from any POS screen */}
      <PosSettingsDrawer open={showSettingsDrawer} onClose={() => setShowSettingsDrawer(false)} />

      {/* Shared global modals (lazy-loaded) */}
      <GlobalModals />
    </Box>
  );
}
