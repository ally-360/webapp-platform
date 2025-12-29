import React, { useCallback, useEffect, useMemo, useState } from 'react';
// @mui
import {
  Box,
  Drawer,
  Typography,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
// Hooks
import { useRouter } from 'src/routes/hook/use-router';
import { useAppSelector } from 'src/hooks/store';
// Utils
import { fCurrency } from 'src/utils/format-number';
// RTK Query
import {
  useGetClosingSummaryQuery,
  useCloseCashRegisterMutation,
  useGetCurrentCashRegisterQuery
} from 'src/redux/services/posApi';
// Components
import { PAYMENT_LABEL } from './components/sales-history/utils';
// Constants
import { createSettingsOptions, createShiftOptions, GENERAL_SETTINGS, APP_INFO } from './constants';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PosSettingsDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  // Get current cash register from Redux state (might be mock data)
  const stateRegister = useAppSelector((state) => state.pos.currentRegister);

  // Try to get real cash register from backend using PDV ID
  const { data: queryRegister } = useGetCurrentCashRegisterQuery(stateRegister?.pdv_id || '', {
    skip: !stateRegister?.pdv_id
  });

  // Prefer backend data (has real UUID), fallback to state if backend fails
  const currentRegister = queryRegister || stateRegister;

  // Helper to check if we have a valid UUID (backend register)
  const hasValidRegister =
    currentRegister && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentRegister.id);

  // ---------------------------------------
  // Close Register dialog state
  // ---------------------------------------
  const [closeOpen, setCloseOpen] = useState(false);
  const [countedCash, setCountedCash] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Fetch closing summary only if we have a valid UUID register
  const { data: closingSummary, isLoading: loadingSummary } = useGetClosingSummaryQuery(currentRegister?.id || '', {
    skip: !closeOpen || !currentRegister?.id || !hasValidRegister
  });

  // Close cash register mutation
  const [closeCashRegister, { isLoading: isClosing }] = useCloseCashRegisterMutation();

  const handleOpenCloseDialog = useCallback(() => {
    if (!currentRegister) {
      enqueueSnackbar('No hay caja registradora abierta', { variant: 'warning' });
      return;
    }
    if (!hasValidRegister) {
      enqueueSnackbar('ID de caja registradora inválido. Por favor recarga la página.', {
        variant: 'error'
      });
      return;
    }
    setCloseOpen(true);
  }, [currentRegister, hasValidRegister, enqueueSnackbar]);

  const handleCloseDialog = useCallback(() => {
    setCloseOpen(false);
    setCountedCash('');
    setNotes('');
  }, []);

  // Set initial counted cash when summary loads
  useEffect(() => {
    if (closingSummary && countedCash === '') {
      setCountedCash(parseFloat(closingSummary.expected_balance));
    }
  }, [closingSummary, countedCash]);

  const difference = useMemo(() => {
    if (!closingSummary) return 0;
    const counted = typeof countedCash === 'number' ? countedCash : parseFloat((countedCash as any) || '0') || 0;
    const expected = parseFloat(closingSummary.expected_balance || '0');
    return counted - expected;
  }, [countedCash, closingSummary]);

  const differenceColor = useMemo(() => {
    if (difference === 0) return 'text.primary';
    return difference > 0 ? 'success.main' : 'error.main';
  }, [difference]);

  const handleConfirmClose = useCallback(async () => {
    if (!closingSummary || !currentRegister) return;

    // Si hay diferencia, exigir nota
    if (difference !== 0 && !notes.trim()) {
      enqueueSnackbar('Debes ingresar una nota cuando hay diferencia de efectivo', { variant: 'warning' });
      return;
    }

    try {
      const counted = typeof countedCash === 'number' ? countedCash : parseFloat((countedCash as any) || '0') || 0;

      await closeCashRegister({
        id: currentRegister.id,
        data: {
          closing_balance: counted,
          closing_notes: notes.trim() || undefined
        }
      }).unwrap();

      enqueueSnackbar('Caja cerrada correctamente', { variant: 'success' });
      handleCloseDialog();
      onClose?.();

      // Redirigir al reporte diario o historial de turnos
      router.push('/pos/shift/history');
    } catch (error: any) {
      console.error('Error closing cash register:', error);
      enqueueSnackbar(error?.data?.detail || 'Error al cerrar la caja', { variant: 'error' });
    }
  }, [
    closingSummary,
    currentRegister,
    difference,
    notes,
    countedCash,
    closeCashRegister,
    enqueueSnackbar,
    handleCloseDialog,
    onClose,
    router
  ]);

  const handleDownloadExcel = useCallback(() => {
    if (!closingSummary) return;
    const lines = ['Método de Pago,Total'];

    // Add payment methods breakdown
    Object.entries(closingSummary.payment_methods_breakdown || {}).forEach(([method, amount]) => {
      lines.push(`${(PAYMENT_LABEL as any)[method] || method},${amount}`);
    });

    lines.push('');
    lines.push('Resumen');
    lines.push(`Saldo Inicial,${closingSummary.opening_balance}`);
    lines.push(`Total Ventas,${closingSummary.total_sales}`);
    lines.push(`Total Depósitos,${closingSummary.total_deposits}`);
    lines.push(`Total Retiros,${closingSummary.total_withdrawals}`);
    lines.push(`Total Gastos,${closingSummary.total_expenses}`);
    lines.push(`Saldo Esperado,${closingSummary.expected_balance}`);

    const csv = lines.join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `arqueo_${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [closingSummary]);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose?.();
    },
    [router, onClose]
  );

  // ---------------------------------------
  // Turnos POS - Navegación
  // ---------------------------------------
  const [shiftIdInput, setShiftIdInput] = useState('');

  // Usar las constantes importadas para las opciones de turno
  const shiftOptions = useMemo(() => createShiftOptions(handleNavigate), [handleNavigate]);

  // Usar las constantes importadas para las opciones de configuración
  const settingsOptions = useMemo(
    () =>
      createSettingsOptions({
        handleOpenCloseDialog,
        handleNavigate
      }),
    [handleNavigate, handleOpenCloseDialog]
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 350,
          maxWidth: '90vw'
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          pr: 1.75,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper'
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3, pr: 1.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Configuración
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Icon icon="mdi:close" />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2, mr: 1.25 }} />
        {/* Settings Content */}
        <Stack spacing={3} sx={{ flex: 1, overflow: 'auto', pr: 1.25 }}>
          <Box>
            <List sx={{ p: 0 }}>
              {settingsOptions.map((option) => (
                <ListItem key={option.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={option.action}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon icon={option.icon} width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary={option.title}
                      secondary={option.description}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    <Icon icon="mdi:chevron-right" width={16} height={16} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          <Divider />

          {/* Turnos POS */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Turnos POS
            </Typography>
            <List sx={{ p: 0 }}>
              {shiftOptions.map((option) => (
                <ListItem key={option.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={option.action}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon icon={option.icon} width={24} height={24} />
                    </ListItemIcon>
                    <ListItemText
                      primary={option.title}
                      secondary={option.description}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    <Icon icon="mdi:chevron-right" width={16} height={16} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Ir a detalle de turno por ID */}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="ID de turno"
                placeholder="p.ej. shift-2024-08-31"
                value={shiftIdInput}
                onChange={(e) => setShiftIdInput(e.target.value)}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={() => shiftIdInput && handleNavigate(`/pos/shift/${shiftIdInput.trim()}`)}
                disabled={!shiftIdInput.trim()}
              >
                Ver
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* General Settings */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Configuraciones Generales
            </Typography>

            <Stack spacing={2}>
              {GENERAL_SETTINGS.map((setting) => (
                <FormControlLabel
                  key={setting.id}
                  control={<Switch defaultChecked={setting.defaultValue} />}
                  label={setting.label}
                />
              ))}
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ pt: 2, mr: 1.25 }} />

        <Box sx={{ mt: 3, pr: 1.25 }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            {APP_INFO.name} v{APP_INFO.version}
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            {APP_INFO.copyright} - {APP_INFO.description}
          </Typography>
        </Box>
      </Box>

      {/* Close Register Dialog */}
      <Dialog open={closeOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Cerrar Caja Registradora</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Loading state */}
            {loadingSummary && (
              <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Cargando resumen de caja...
                </Typography>
              </Stack>
            )}

            {/* Información básica */}
            {!loadingSummary && closingSummary && (
              <>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Información de la Caja
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">PDV:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {closingSummary.pdv_name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Abierta por:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {closingSummary.opened_by_name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Hora de apertura:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(closingSummary.opened_at).toLocaleString('es-CO')}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Resumen de movimientos */}
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Resumen de Movimientos
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Saldo inicial:</Typography>
                    <Typography variant="body2">{fCurrency(parseFloat(closingSummary.opening_balance))}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Total ventas:</Typography>
                    <Typography variant="body2" color="success.main">
                      + {fCurrency(parseFloat(closingSummary.total_sales))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Total depósitos:</Typography>
                    <Typography variant="body2" color="success.main">
                      + {fCurrency(parseFloat(closingSummary.total_deposits))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Total retiros:</Typography>
                    <Typography variant="body2" color="error.main">
                      - {fCurrency(parseFloat(closingSummary.total_withdrawals))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Total gastos:</Typography>
                    <Typography variant="body2" color="error.main">
                      - {fCurrency(parseFloat(closingSummary.total_expenses))}
                    </Typography>
                  </Stack>
                  {parseFloat(closingSummary.total_adjustments) !== 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Ajustes:</Typography>
                      <Typography variant="body2">{fCurrency(parseFloat(closingSummary.total_adjustments))}</Typography>
                    </Stack>
                  )}
                </Stack>

                <Divider />

                {/* Métodos de pago */}
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary">
                    Desglose por Método de Pago
                  </Typography>
                  {Object.entries(closingSummary.payment_methods_breakdown || {}).map(([method, amount]) => (
                    <Stack key={method} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{(PAYMENT_LABEL as any)[method] || method}:</Typography>
                      <Typography variant="body2">{fCurrency(parseFloat(amount))}</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider />

                {/* Estadísticas */}
                <Stack direction="row" spacing={3}>
                  <Stack flex={1}>
                    <Typography variant="overline" color="text.secondary">
                      Transacciones
                    </Typography>
                    <Typography variant="h4">{closingSummary.total_transactions}</Typography>
                  </Stack>
                  <Stack flex={1}>
                    <Typography variant="overline" color="text.secondary">
                      Facturas
                    </Typography>
                    <Typography variant="h4">{closingSummary.total_invoices}</Typography>
                  </Stack>
                </Stack>

                <Divider />

                {/* Arqueo de caja */}
                <Stack spacing={1.5}>
                  <Typography variant="overline" color="text.secondary">
                    Arqueo de Caja
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Saldo esperado:</Typography>
                    <Typography variant="h6">{fCurrency(parseFloat(closingSummary.expected_balance))}</Typography>
                  </Stack>

                  <TextField
                    label="Saldo declarado (efectivo contado)"
                    type="number"
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value === '' ? '' : Number(e.target.value))}
                    fullWidth
                    required
                    helperText="Ingresa el efectivo físico contado en la caja"
                  />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">Diferencia:</Typography>
                    <Typography variant="h6" color={differenceColor as any}>
                      {fCurrency(difference)}
                    </Typography>
                  </Stack>

                  {difference !== 0 && (
                    <Alert severity={difference > 0 ? 'info' : 'warning'}>
                      {difference > 0
                        ? `Sobrante de ${fCurrency(Math.abs(difference))}. Por favor explica el motivo en las notas.`
                        : `Faltante de ${fCurrency(Math.abs(difference))}. Por favor explica el motivo en las notas.`}
                    </Alert>
                  )}

                  <TextField
                    label="Notas del cierre"
                    multiline
                    minRows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    required={difference !== 0}
                    helperText={
                      difference !== 0 ? 'Las notas son obligatorias cuando hay diferencia en el saldo' : 'Opcional'
                    }
                  />
                </Stack>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseDialog} disabled={isClosing}>
            Cancelar
          </Button>
          <Button color="inherit" onClick={handleDownloadExcel} disabled={!closingSummary || isClosing}>
            Descargar Excel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmClose}
            disabled={loadingSummary || !closingSummary || isClosing || countedCash === ''}
          >
            {isClosing ? 'Cerrando...' : 'Confirmar cierre'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
