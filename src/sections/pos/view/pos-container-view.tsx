import React, { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { Alert } from '@mui/material';

// redux
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

// hooks
import {
  usePosInitialization,
  usePosStatePersistence,
  useTabManagement,
  useDrawerPersistence,
  useDrawerWidth,
  useCashRegister,
  useSyncCashRegister
} from '../hooks';
import { useSaleDraftsLoader } from '../hooks/useSaleDraftsLoader';
import { useCreateWindowWithDraft } from '../hooks/useCreateWindowWithDraft';

// components
import PosWindowView from './pos-window-view-new';
import PosRegisterOpenDialog from '../pos-register-open-dialog';
import PosSettingsDrawer from '../pos-settings-drawer';
import { RegisterOpenScreen, EmptyWindowsMessage, PosBottomBar } from '../components';

// ----------------------------------------------------------------------
// TYPES & CONSTANTS
// ----------------------------------------------------------------------

interface RegisterOpenData {
  pdv_id: string;
  pdv_name: string;
  opening_amount: number;
  seller_id?: string;
  seller_name?: string;
  notes?: string;
}

const DEFAULT_REGISTER_VALUES = {
  pdv_name: 'PDV Principal - Palmira',
  opening_amount: 50000
} as const;

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

/**
 * Contenedor principal del POS
 *
 * Este componente maneja:
 * - Estado de la caja/registro
 * - Gestión de ventanas de venta
 * - Persistencia en localStorage
 * - Interfaz de usuario principal
 */
export default function PosContainerView() {
  const dispatch = useAppDispatch();
  const { currentRegister, salesWindows, error } = useAppSelector((state) => state.pos);
  const { computeContentWidth } = useDrawerWidth();

  // Estado local
  const [addingNewSale, setAddingNewSale] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(true);
  const [openTab, setOpenTab] = useState(0);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);

  // Hooks personalizados
  usePosInitialization();
  usePosStatePersistence(currentRegister, salesWindows);
  useTabManagement(salesWindows, addingNewSale, openTab, setOpenTab, setAddingNewSale);
  useDrawerPersistence(openDrawer);

  // Hook para sincronización con backend
  const { hasOpenRegister, needsToOpenRegister, isLoading: isSyncLoading } = useSyncCashRegister();

  // Hook para cargar drafts desde backend (persistencia)
  const { isLoadingDrafts, loadedWindowsCount, reloadDrafts } = useSaleDraftsLoader();

  // Hook para crear ventanas con draft automático
  const { createNewWindow, isCreating: isCreatingWindow } = useCreateWindowWithDraft();

  // Hook para gestión de caja registradora con backend
  const { handleOpenRegister } = useCashRegister();

  // Effect para abrir automáticamente la primera ventana cuando se cargan drafts
  useEffect(() => {
    if (loadedWindowsCount > 0 && salesWindows.length > 0 && openTab === 0) {
      console.log('🎯 Abriendo automáticamente la primera ventana cargada');
      setOpenTab(salesWindows[0].id);
    }
  }, [loadedWindowsCount, salesWindows, openTab]);

  // Valores derivados (memoized para performance)
  const isRegisterOpen = useMemo(
    () => Boolean(currentRegister?.status === 'open') || hasOpenRegister,
    [currentRegister?.status, hasOpenRegister]
  );

  const shouldShowRegisterDialog = useMemo(
    () => !isSyncLoading && ((showRegisterDialog && !isRegisterOpen) || needsToOpenRegister),
    [isSyncLoading, showRegisterDialog, isRegisterOpen, needsToOpenRegister]
  );

  const computedBottomBarWidth = useMemo(
    () => (openDrawer && salesWindows.length > 0 ? computeContentWidth(openDrawer) : '100%'),
    [openDrawer, salesWindows.length, computeContentWidth]
  );

  // Event handlers (memoized para evitar re-renders innecesarios)
  const toggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const handleChangeTab = useCallback((newValue: number) => {
    setOpenTab(newValue);
  }, []);

  const handleAddTab = useCallback(async () => {
    if (!isRegisterOpen) {
      setShowRegisterDialog(true);
      setOpenRegisterDialog(true);
      return;
    }

    // Crear ventana con draft en backend
    await createNewWindow();
    setAddingNewSale(true);
  }, [isRegisterOpen, createNewWindow]);

  const handleRegisterOpen = useCallback(
    async (registerData: RegisterOpenData) => {
      try {
        const result = await handleOpenRegister(registerData);
        if (result.success) {
          setShowRegisterDialog(false);
          setOpenRegisterDialog(false);
        }
      } catch (err) {
        console.error('Error al abrir la caja:', err);
      }
    },
    [handleOpenRegister]
  );

  const handleOpenRegisterDialog = useCallback(() => {
    setOpenRegisterDialog(true);
  }, []);

  const handleCloseRegisterDialog = useCallback(() => {
    setOpenRegisterDialog(false);
  }, []);

  const handleCloseSettingsDrawer = useCallback(() => {
    setShowSettingsDrawer(false);
  }, []);

  // Effect para controlar mostrar/ocultar dialog de registro
  useEffect(() => {
    // Mostrar pantalla de apertura si:
    // 1. No hay caja abierta en Redux, O
    // 2. El backend indica que necesita abrir caja (404)
    if (!isRegisterOpen || needsToOpenRegister) {
      setShowRegisterDialog(true);
    } else {
      setShowRegisterDialog(false);
      // Set active tab if we have windows
      if (salesWindows.length > 0 && openTab === 0) {
        setOpenTab(salesWindows[0].id);
      }
    }
  }, [isRegisterOpen, needsToOpenRegister, salesWindows.length, salesWindows, openTab]);

  // Early return: Pantalla de apertura de caja
  if (shouldShowRegisterDialog) {
    return (
      <>
        <RegisterOpenScreen onOpenDialog={handleOpenRegisterDialog} />
        <PosRegisterOpenDialog
          open={openRegisterDialog}
          onClose={handleCloseRegisterDialog}
          onConfirm={handleRegisterOpen}
          defaultValues={DEFAULT_REGISTER_VALUES}
        />
      </>
    );
  }

  // Render principal
  return (
    <>
      <Container maxWidth={false} sx={{ pt: 2 }}>
        {/* Alert de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Ventanas de venta */}
        <Grid container spacing={3}>
          {salesWindows.map(
            (sale) =>
              openTab === sale.id && (
                <PosWindowView key={sale.id} openDrawer={openDrawer} hiddenDrawer={toggleDrawer} sale={sale} />
              )
          )}

          {/* Mensaje cuando no hay ventanas */}
          {salesWindows.length === 0 && <EmptyWindowsMessage onAddTab={handleAddTab} />}
        </Grid>
      </Container>

      {/* Bottom Tab Bar */}
      <PosBottomBar
        salesWindows={salesWindows}
        openTab={openTab}
        onChangeTab={handleChangeTab}
        onAddTab={handleAddTab}
        isRegisterOpen={isRegisterOpen}
        computedWidth={computedBottomBarWidth}
      />

      {/* Diálogos */}
      <PosRegisterOpenDialog
        open={openRegisterDialog}
        onClose={handleCloseRegisterDialog}
        onConfirm={handleRegisterOpen}
        defaultValues={DEFAULT_REGISTER_VALUES}
      />

      <PosSettingsDrawer open={showSettingsDrawer} onClose={handleCloseSettingsDrawer} />
    </>
  );
}
