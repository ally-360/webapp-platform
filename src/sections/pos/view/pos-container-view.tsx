import React, { useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { AppBar, Button, CardHeader, IconButton, Typography, useMediaQuery, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { Stack } from '@mui/system';

// components
import Iconify from 'src/components/iconify';

// redux
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { addSaleWindow, openRegister, initializeFromStorage } from 'src/redux/pos/posSlice';
import { POSStorageKeys, loadFromLocalStorage, saveToLocalStorage } from 'src/redux/pos/posUtils';
import { paths } from 'src/routes/paths';
import type { POSRegister } from 'src/redux/pos/posSlice';

// views
import PosWindowView from './pos-window-view';
//
// ----------------------------------------------------------------------

export default function PosContainerView() {
  const dispatch = useAppDispatch();
  const { currentRegister, salesWindows, error } = useAppSelector((state) => state.pos);

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [addingNewSale, setAddingNewSale] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(true);
  const [openTab, setOpenTab] = useState(0);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';

  // Initialize POS data from localStorage
  useEffect(() => {
    const savedRegister = loadFromLocalStorage(POSStorageKeys.CURRENT_REGISTER) as POSRegister | null;
    const savedWindows = loadFromLocalStorage(POSStorageKeys.SALES_WINDOWS) as any[] | null;
    const savedCompletedSales = loadFromLocalStorage(POSStorageKeys.COMPLETED_SALES) as any[] | null;

    if (savedRegister || savedWindows || savedCompletedSales) {
      dispatch(
        initializeFromStorage({
          currentRegister: savedRegister || undefined,
          salesWindows: savedWindows || undefined,
          completedSales: savedCompletedSales || undefined
        })
      );
    }
  }, [dispatch]);

  // Save to localStorage whenever POS state changes
  useEffect(() => {
    if (currentRegister) {
      saveToLocalStorage(POSStorageKeys.CURRENT_REGISTER, currentRegister);
    }
    if (salesWindows) {
      saveToLocalStorage(POSStorageKeys.SALES_WINDOWS, salesWindows);
    }
  }, [currentRegister, salesWindows]);

  // Handle new sale tab creation
  useEffect(() => {
    if (addingNewSale && salesWindows.length > 0) {
      setOpenTab(salesWindows[salesWindows.length - 1].id);
      setAddingNewSale(false);
    }
  }, [addingNewSale, salesWindows]);

  // Check if register is open
  useEffect(() => {
    if (!currentRegister || currentRegister.status !== 'open') {
      setShowRegisterDialog(true);
    } else {
      setShowRegisterDialog(false);
      // Set active tab if we have windows
      if (salesWindows.length > 0 && openTab === 0) {
        setOpenTab(salesWindows[0].id);
      }
    }
  }, [currentRegister, salesWindows, openTab]);

  const hiddenDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleChangeTab = (newValue: number) => {
    setOpenTab(newValue);
  };

  const handleAddTab = () => {
    if (!currentRegister || currentRegister.status !== 'open') {
      setShowRegisterDialog(true);
      return;
    }
    dispatch(addSaleWindow());
    setAddingNewSale(true);
  };

  const handleRegisterOpen = (registerData: {
    user_name: string;
    pdv_name: string;
    opening_amount: number;
    notes?: string;
  }) => {
    dispatch(
      openRegister({
        user_id: 'mock_user_id', // En producción, obtener del contexto de auth
        user_name: registerData.user_name,
        pdv_id: 'mock_pdv_id', // En producción, obtener del contexto
        pdv_name: registerData.pdv_name,
        opening_amount: registerData.opening_amount,
        notes: registerData.notes
      })
    );
    setShowRegisterDialog(false);
  };

  // Si no hay registro abierto, mostrar dialog
  if (showRegisterDialog && (!currentRegister || currentRegister.status !== 'open')) {
    return (
      <Container
        maxWidth={false}
        sx={{ pt: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}
      >
        <Stack spacing={2} alignItems="center">
          <Icon icon="mdi:cash-register" style={{ fontSize: '64px', color: theme.palette.primary.main }} />
          <Typography variant="h4" gutterBottom>
            Apertura de Caja
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth="400px">
            Para comenzar a usar el POS, primero debe abrir la caja del día. Ingrese el monto inicial y confirme la
            apertura.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Icon icon="mdi:cash-multiple" />}
            onClick={() =>
              handleRegisterOpen({
                user_name: 'Usuario Demo',
                pdv_name: 'PDV Principal - Palmira',
                opening_amount: 50000,
                notes: 'Apertura automática para demo'
              })
            }
          >
            Abrir Caja (Demo)
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ pt: 12 }}>
      {/* Header Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.background.paper,
          left: 0,
          width: openDrawer
            ? isLargeScreen
              ? `calc(100% - ${drawerWidthLg})`
              : `calc(100% - ${drawerWidth})`
            : '100%',
          boxShadow: theme.shadows[1],
          zIndex: 99999,
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
              Venta POS
              <Typography component="span" sx={{ color: 'text.secondary' }}>
                &nbsp;({currentRegister?.pdv_name || 'Sin PDV'})
              </Typography>
            </Typography>
          }
          sx={{ p: 2 }}
          action={
            <Stack direction="row" spacing={1}>
              {currentRegister && (
                <Typography variant="body2" color="text.secondary">
                  Caja: {currentRegister.user_name}
                </Typography>
              )}
              <IconButton>
                <Icon icon="ic:round-settings" />
              </IconButton>
            </Stack>
          }
        />
      </AppBar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Sales Windows */}
      <Grid container spacing={3}>
        {salesWindows.map(
          (sale) =>
            openTab === sale.id && (
              <PosWindowView key={sale.id} openDrawer={openDrawer} hiddenDrawer={hiddenDrawer} sale={sale} />
            )
        )}

        {/* No windows message */}
        {salesWindows.length === 0 && (
          <Grid xs={12}>
            <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
              <Icon icon="mdi:cart-outline" style={{ fontSize: '48px', color: theme.palette.text.disabled }} />
              <Typography variant="h6" color="text.secondary">
                No hay ventanas de venta abiertas
              </Typography>
              <Button variant="contained" onClick={handleAddTab} startIcon={<Icon icon="mdi:plus" />}>
                Crear Primera Venta
              </Button>
            </Stack>
          </Grid>
        )}
      </Grid>

      {/* Bottom Tab Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.background.paper,
          left: 0,
          bottom: 0,
          top: 'auto',
          boxShadow: theme.shadows[1],
          width: openDrawer
            ? isLargeScreen
              ? `calc(100% - ${drawerWidthLg})`
              : `calc(100% - ${drawerWidth})`
            : '100%',
          zIndex: 99999,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        <CardHeader
          title={
            <Stack flexDirection="row" alignItems="center" p={0} gap={2}>
              {salesWindows.map((tab) => (
                <Button
                  key={tab.id}
                  variant={openTab === tab.id ? 'contained' : 'outlined'}
                  startIcon={<Icon icon="mdi:cart" />}
                  onClick={() => handleChangeTab(tab.id)}
                  size="small"
                >
                  {tab.name}
                  {tab.products.length > 0 && (
                    <Typography component="span" sx={{ ml: 0.5, opacity: 0.7 }}>
                      ({tab.products.length})
                    </Typography>
                  )}
                </Button>
              ))}
              <IconButton
                onClick={handleAddTab}
                color="primary"
                disabled={!currentRegister || currentRegister.status !== 'open'}
              >
                <Icon icon="mdi:plus" />
              </IconButton>
            </Stack>
          }
          sx={{ p: 1.5 }}
        />
      </AppBar>
    </Container>
  );
}
