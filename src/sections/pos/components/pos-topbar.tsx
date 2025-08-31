import React, { useEffect, useMemo, useState } from 'react';
import { AppBar, CardHeader, IconButton, Typography, useTheme, Button, useMediaQuery } from '@mui/material';
import { Stack } from '@mui/system';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { useAppSelector } from 'src/hooks/store';
import { Icon } from '@iconify/react';
import { useLocation } from 'react-router-dom';

export interface PosTopbarProps {
  title?: string;
  rightActions?: React.ReactNode;
  onOpenSettings?: () => void;
}

export default function PosTopbar({ title = 'Venta POS', rightActions, onOpenSettings }: PosTopbarProps) {
  const theme = useTheme();
  const location = useLocation();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));
  const { currentRegister, salesWindows } = useAppSelector((state) => state.pos);

  // Bridge UI state from container via localStorage + custom event
  const [openDrawer, setOpenDrawer] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('pos_open_drawer');
      return saved ? saved === 'true' : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleChange = () => {
      try {
        const saved = localStorage.getItem('pos_open_drawer');
        setOpenDrawer(saved === 'true');
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener('pos:open-drawer-changed', handleChange);
    return () => window.removeEventListener('pos:open-drawer-changed', handleChange);
  }, []);

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';

  const isMainPosRoute = useMemo(() => location.pathname === paths.dashboard.pos, [location.pathname]);

  const computedWidth = useMemo(() => {
    if (isMainPosRoute && openDrawer && (salesWindows?.length || 0) > 0) {
      return isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`;
    }
    return '100%';
  }, [isMainPosRoute, openDrawer, salesWindows, isLargeScreen]);

  return (
    <AppBar
      position="fixed"
      sx={{
        background: theme.palette.background.paper,
        left: 0,
        width: computedWidth,
        boxShadow: theme.shadows[1],
        zIndex: 99,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        })
      }}
    >
      <CardHeader
        avatar={
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton href={paths.dashboard.root}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButton>
            <img src="/logo/faviconBackgroundTransparent.svg" alt="logo" width="30" />
          </Stack>
        }
        title={
          <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
            {title}
            <Typography component="span" sx={{ color: 'text.secondary' }}>
              &nbsp;({currentRegister?.pdv_name || 'Sin PDV'})
            </Typography>
          </Typography>
        }
        sx={{ p: 2 }}
        action={
          rightActions ?? (
            <Stack direction="row" spacing={1} alignItems="center">
              {!currentRegister || currentRegister.status !== 'open' ? (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<Icon icon="mdi:cash-multiple" />}
                  onClick={() => console.log(true)}
                >
                  Abrir Caja
                </Button>
              ) : (
                currentRegister && (
                  <Typography variant="body2" color="text.secondary">
                    Caja: {currentRegister.user_name}
                  </Typography>
                )
              )}
              <IconButton onClick={onOpenSettings}>
                <Icon icon="ic:round-settings" />
              </IconButton>
            </Stack>
          )
        }
      />
    </AppBar>
  );
}

//   <Container maxWidth={false} sx={{ pt: 12 }}>
//     {/* Header Bar */}
//     <AppBar
//       position="fixed"
//       sx={{
//         background: theme.palette.background.paper,
//         left: 0,
//         width:
//           openDrawer && salesWindows.length > 0
//             ? isLargeScreen
//               ? `calc(100% - ${drawerWidthLg})`
//               : `calc(100% - ${drawerWidth})`
//             : '100%',
//         boxShadow: theme.shadows[1],
//         zIndex: 99,
//         transition: theme.transitions.create('width', {
//           easing: theme.transitions.easing.easeOut,
//           duration: theme.transitions.duration.enteringScreen
//         })
//       }}
//     >
//       <CardHeader
//         avatar={
//           <Stack direction="row" alignItems="center" spacing={1}>
//             <IconButton href={paths.dashboard.root}>
//               <Iconify icon="eva:arrow-ios-back-fill" />
//             </IconButton>
//             <img src="/logo/faviconBackgroundTransparent.svg" alt="logo" width="30" />
//           </Stack>
//         }
//         title={
//           <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
//             Venta POS
//             <Typography component="span" sx={{ color: 'text.secondary' }}>
//               &nbsp;({currentRegister?.pdv_name || 'Sin PDV'})
//             </Typography>
//           </Typography>
//         }
//         sx={{ p: 2 }}
//         action={
//           <Stack direction="row" spacing={1} alignItems="center">
//             {!currentRegister || currentRegister.status !== 'open' ? (
//               <Button
//                 size="small"
//                 variant="contained"
//                 startIcon={<Icon icon="mdi:cash-multiple" />}
//                 onClick={() => setOpenRegisterDialog(true)}
//               >
//                 Abrir Caja
//               </Button>
//             ) : (
//               currentRegister && (
//                 <Typography variant="body2" color="text.secondary">
//                   Caja: {currentRegister.user_name}
//                 </Typography>
//               )
//             )}
//             <IconButton onClick={() => setShowSettingsDrawer(true)}>
//               <Icon icon="ic:round-settings" />
//             </IconButton>
//           </Stack>
//         }
//       />
//     </AppBar>
