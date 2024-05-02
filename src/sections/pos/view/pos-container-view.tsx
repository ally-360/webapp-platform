import React, { useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
// _mock
// components
import { useSettingsContext } from 'src/components/settings';
import { AppBar, Button, CardHeader, IconButton, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Icon } from '@iconify/react';
import { Stack } from '@mui/system';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { addSaleWindow, initializeSalesFromStorage } from 'src/redux/pos/posIndex';
import { paths } from 'src/routes/paths';
import PosWindowView from './pos-window-view';
//
const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('sales', serializedState);
  } catch (e) {
    // manejar errores
  }
};

const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('sales');
    if (serializedState === null) return undefined;
    const { salesWindows } = JSON.parse(serializedState);
    return salesWindows;
  } catch (e) {
    // manejar errores
    return undefined;
  }
};
// ----------------------------------------------------------------------

export default function PosContainerView() {
  const settings = useSettingsContext();
  const dispatch = useAppDispatch();
  const sales = useAppSelector((state) => state.pos.salesWindows);
  const [addingNewSale, setAddingNewSale] = useState(false);
  useEffect(() => {
    if (addingNewSale && sales.length > 0) {
      setOpenTab(sales[sales.length - 1].id);
      setAddingNewSale(false); // Restablecer el indicador
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addingNewSale]);
  useEffect(() => {
    const savedSalesWindows = loadFromLocalStorage();
    if (savedSalesWindows) {
      dispatch(initializeSalesFromStorage(savedSalesWindows));
    }
  }, [dispatch]);

  useEffect(() => {
    saveToLocalStorage({ salesWindows: sales });
  }, [sales]);
  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [openDrawer, setOpenDrawer] = useState(true);

  const hiddenDrawer = () => {
    // hidden drawer
    setOpenDrawer(!openDrawer);
  };

  const [openTab, setOpenTab] = useState(sales.length > 0 ? sales[sales.length - 1].id : 0);

  const handleChangeTab = (newValue) => {
    setOpenTab(newValue);
  };

  const handleAddTab = () => {
    dispatch(addSaleWindow());
    setAddingNewSale(true);
  };

  return (
    <Container maxWidth={false} sx={{ pt: 12 }}>
      {/* Header Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.background.paper,
          left: 0,
          width:
            // eslint-disable-next-line no-nested-ternary
            openDrawer ? (isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`) : '100%',
          // eslint-disable-next-line no-nested-ternary
          boxShadow: theme.shadows,
          zIndex: 99999,
          transition: theme.transitions.create('width ', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        <CardHeader
          avatar={
            <>
              <IconButton component={RouterLink} to={paths.dashboard.root}>
                {/* back icon */}
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButton>
              <img src="/logo/faviconBackgroundTransparent.svg" alt="logo" width="30" />
            </>
          }
          title={
            <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
              Venta POS
              <Typography component="span" sx={{ color: 'text.secondary' }}>
                &nbsp;(PDV: Palmira)
              </Typography>
            </Typography>
          }
          sx={{ p: 2 }}
          action={
            <IconButton>
              <Icon icon="ic:round-settings" />
            </IconButton>
          }
        />
      </AppBar>
      <Grid container spacing={3}>
        {sales.map(
          (sale) =>
            openTab === sale.id && (
              <PosWindowView key={sale.id} openDrawer={openDrawer} hiddenDrawer={hiddenDrawer} sale={sale} />
            )
        )}

        {/* Bottom container */}
        <AppBar
          position="fixed"
          sx={{
            background: theme.palette.background.paper,
            left: 0,
            bottom: 0,
            top: 'auto',
            boxShadow: theme.shadows,
            width:
              // eslint-disable-next-line no-nested-ternary
              openDrawer ? (isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`) : '100%',
            zIndex: 99999,
            transition: theme.transitions.create('width ', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen
            })
          }}
        >
          <CardHeader
            title={
              <Stack flexDirection="row" alignItems="center" p={0} gap={2}>
                {sales.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={openTab === tab.id ? 'contained' : 'outlined'}
                    startIcon={<Icon icon="mdi:cart" />}
                    onClick={() => handleChangeTab(tab.id)}
                  >
                    {tab.name}
                  </Button>
                ))}
                <IconButton onClick={handleAddTab}>
                  <Icon icon="mdi:plus" />
                </IconButton>
              </Stack>
            }
            sx={{ p: 1.5 }}
          />
          {/* add new window */}
        </AppBar>
      </Grid>
    </Container>
  );
}
