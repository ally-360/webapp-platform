/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { AppBar, Button, CardHeader, IconButton, Typography, useMediaQuery, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import { Stack } from '@mui/system';

// redux
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { addSaleWindow, openRegister, initializeFromStorage } from 'src/redux/pos/posSlice';
import { POSStorageKeys, loadFromLocalStorage, saveToLocalStorage } from 'src/redux/pos/posUtils';
import type { POSRegister } from 'src/redux/pos/posSlice';

// views
import PosWindowView from './pos-window-view-new';
import PosRegisterOpenDialog from '../pos-register-open-dialog';
import PosSettingsDrawer from '../pos-settings-drawer';
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
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  // Controls the modal visibility for opening register
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);

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
      setShowRegisterDialog(true); // show lock screen prompting to open register
    } else {
      setShowRegisterDialog(false);
      // Set active tab if we have windows
      if (salesWindows.length > 0 && openTab === 0) {
        setOpenTab(salesWindows[0].id);
      }
    }
  }, [currentRegister, salesWindows, openTab]);

  // Handle post-sale window selection
  // When a sale is completed and windows count changes, select the first available window
  useEffect(() => {
    const previousCount = salesWindows.length;
    if (previousCount > 0) {
      // If current tab doesn't exist anymore (was completed), select the first available
      const currentWindowExists = salesWindows.some((window) => window.id === openTab);
      if (!currentWindowExists && salesWindows.length > 0) {
        setOpenTab(salesWindows[0].id);
      }
      // If no windows left after completion, the Redux slice automatically creates a new one
    }
  }, [salesWindows, openTab]);

  const hiddenDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  // Persist openDrawer for PosTopbar width calculation and notify listeners
  useEffect(() => {
    try {
      localStorage.setItem('pos_open_drawer', openDrawer ? 'true' : 'false');
      window.dispatchEvent(new Event('pos:open-drawer-changed'));
    } catch (e) {
      // ignore storage errors
    }
  }, [openDrawer]);

  const handleChangeTab = (newValue: number) => {
    setOpenTab(newValue);
  };

  const handleAddTab = () => {
    if (!currentRegister || currentRegister.status !== 'open') {
      setShowRegisterDialog(true);
      setOpenRegisterDialog(true); // open the dialog directly when trying to add without register
      return;
    }
    dispatch(addSaleWindow());
    setAddingNewSale(true);
  };

  const handleRegisterOpen = (registerData: {
    pdv_name: string;
    opening_amount: number;
    opening_date: Date;
    operator_name: string;
    notes?: string;
  }) => {
    dispatch(
      openRegister({
        user_id: 'mock_user_id', // En producción, obtener del contexto de auth
        user_name: registerData.operator_name,
        pdv_id: 'mock_pdv_id', // En producción, obtener del contexto
        pdv_name: registerData.pdv_name,
        opening_amount: registerData.opening_amount,
        notes: registerData.notes
      })
    );
    setShowRegisterDialog(false);
    setOpenRegisterDialog(false);
  };

  // Si no hay registro abierto, mostrar pantalla con botón para abrir modal
  if (showRegisterDialog && (!currentRegister || currentRegister.status !== 'open')) {
    return (
      <Container
        maxWidth={false}
        sx={{ pt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}
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
            onClick={() => setOpenRegisterDialog(true)}
          >
            Abrir Caja
          </Button>

          {/* Modal de Apertura de Caja */}
          <PosRegisterOpenDialog
            open={openRegisterDialog}
            onClose={() => setOpenRegisterDialog(false)}
            onConfirm={handleRegisterOpen}
            defaultValues={{
              operator_name: 'Usuario Demo',
              pdv_name: 'PDV Principal - Palmira',
              opening_amount: 50000,
              opening_date: new Date()
            }}
          />
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth={false} sx={{ pt: 2 }}>
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
      </Container>

      {/* Bottom Tab Bar - unaffected */}
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.background.paper,
          left: 0,
          bottom: 0,
          top: 'auto',
          boxShadow: theme.shadows[1],
          width:
            openDrawer && salesWindows.length > 0
              ? isLargeScreen
                ? `calc(100% - ${drawerWidthLg})`
                : `calc(100% - ${drawerWidth})`
              : '100%',
          zIndex: 99,
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

      {/* Register Opening Dialog (also available in main view) */}
      <PosRegisterOpenDialog
        open={openRegisterDialog}
        onClose={() => setOpenRegisterDialog(false)}
        onConfirm={handleRegisterOpen}
        defaultValues={{
          operator_name: 'Usuario Demo',
          pdv_name: 'PDV Principal - Palmira',
          opening_amount: 50000,
          opening_date: new Date()
        }}
      />

      {/* Settings Drawer */}
      <PosSettingsDrawer open={showSettingsDrawer} onClose={() => setShowSettingsDrawer(false)} />
    </>
  );
}
