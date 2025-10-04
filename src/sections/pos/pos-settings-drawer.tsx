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
  TextField
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter } from 'src/routes/hook/use-router';
import { getPosSalesHistory, closePosRegister, downloadRegisterReport } from 'src/api';
import { fCurrency } from 'src/utils/format-number';
import { PAYMENT_LABEL } from './components/sales-history/utils';
// Constants
import { createSettingsOptions, createShiftOptions, GENERAL_SETTINGS, APP_INFO } from './constants';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function PosSettingsDrawer({ open, onClose }: Props) {
  const router = useRouter();

  // ---------------------------------------
  // Close Register dialog state
  // ---------------------------------------
  const [closeOpen, setCloseOpen] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summary, setSummary] = useState<{
    byMethod: Record<string, number>;
    total: number;
    expectedCash: number;
  } | null>(null);
  const [countedCash, setCountedCash] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const todayStr = useMemo(() => formatYMD(new Date()), []);

  const handleOpenCloseDialog = () => {
    setCloseOpen(true);
  };
  const handleCloseDialog = () => {
    setCloseOpen(false);
    setSummary(null);
    setCountedCash('');
    setNotes('');
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (!closeOpen) return;
      setLoadingSummary(true);
      try {
        const res = await getPosSalesHistory({ dateFrom: todayStr, dateTo: todayStr, page: 0, limit: 1000 } as any);
        const rows = (res as any)?.data?.data || [];
        const byMethod: Record<string, number> = {};
        let total = 0;
        rows.forEach((row: any) => {
          total += row.total || 0;
          (row.payments || []).forEach((p: any) => {
            byMethod[p.method] = (byMethod[p.method] || 0) + (p.amount || 0);
          });
        });
        const expectedCash = byMethod.cash || 0;
        setSummary({ byMethod, total, expectedCash });
        if (countedCash === '') setCountedCash(expectedCash);
      } catch (e) {
        setSummary({ byMethod: {}, total: 0, expectedCash: 0 });
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeOpen, todayStr]);

  const difference = useMemo(() => {
    if (!summary) return 0;
    const counted = typeof countedCash === 'number' ? countedCash : parseFloat((countedCash as any) || '0') || 0;
    return counted - (summary?.expectedCash || 0);
  }, [countedCash, summary]);

  const differenceColor = useMemo(() => {
    if (difference === 0) return 'text.primary';
    return difference > 0 ? 'success.main' : 'error.main';
  }, [difference]);

  const handleConfirmClose = useCallback(async () => {
    if (!summary) return;
    // Si hay diferencia, exigir nota
    if (difference !== 0 && !notes.trim()) {
      // eslint-disable-next-line no-alert
      alert('Debes ingresar una nota cuando hay diferencia de efectivo.');
      return;
    }
    try {
      const payload: any = {
        dateFrom: todayStr,
        dateTo: todayStr,
        byMethod: Object.entries(summary.byMethod).map(([method, amount]) => ({ method, amount })),
        total: summary.total,
        expectedCash: summary.expectedCash,
        countedCash: typeof countedCash === 'number' ? countedCash : parseFloat((countedCash as any) || '0') || 0,
        difference,
        notes
      };
      await closePosRegister(payload);
      // eslint-disable-next-line no-alert
      alert('Turno cerrado correctamente (mock).');
      handleCloseDialog();
      // Redirigir al reporte diario
      router.push('/pos/daily-report');
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Error al cerrar turno.');
    }
  }, [summary, todayStr, countedCash, difference, notes, router]);

  const handleDownloadPDF = useCallback(async () => {
    try {
      const res = await downloadRegisterReport('pdf', { dateFrom: todayStr, dateTo: todayStr } as any);
      const url = (res as any)?.data?.url;
      if (url) window.open(url, '_blank');
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('No se pudo generar el PDF.');
    }
  }, [todayStr]);

  const handleDownloadExcel = useCallback(() => {
    if (!summary) return;
    const lines = ['Método,Total'];
    Object.entries(summary.byMethod).forEach(([method, amount]) => {
      lines.push(`${(PAYMENT_LABEL as any)[method] || method},${amount}`);
    });
    lines.push(`Total,${summary.total}`);
    const csv = lines.join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arqueo_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [summary, todayStr]);

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
    [handleNavigate]
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
      <Dialog open={closeOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cerrar Caja (Turno)</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Fecha: {todayStr}
            </Typography>

            <Stack spacing={1}>
              <Typography variant="subtitle2">Ventas por método</Typography>
              <Stack spacing={0.5}>
                {loadingSummary && <Typography variant="body2">Calculando...</Typography>}
                {!loadingSummary && summary && (
                  <>
                    {Object.entries(summary.byMethod).map(([method, amount]) => (
                      <Stack key={method} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{(PAYMENT_LABEL as any)[method] || method}</Typography>
                        <Typography variant="body2">{fCurrency(amount)}</Typography>
                      </Stack>
                    ))}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2">Total</Typography>
                      <Typography variant="subtitle2">{fCurrency(summary.total)}</Typography>
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Total efectivo esperado</Typography>
                <Typography variant="subtitle2">{fCurrency(summary?.expectedCash || 0)}</Typography>
              </Stack>
              <TextField
                label="Efectivo contado por cajero"
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value === '' ? '' : Number(e.target.value))}
                fullWidth
              />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Diferencia</Typography>
                <Typography variant="subtitle2" color={differenceColor as any}>
                  {fCurrency(difference)}
                </Typography>
              </Stack>
              <TextField
                label="Notas u observaciones"
                multiline
                minRows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button color="inherit" onClick={handleDownloadExcel}>
            Descargar Excel
          </Button>
          <Button color="inherit" onClick={handleDownloadPDF}>
            Descargar PDF
          </Button>
          <Button variant="contained" onClick={handleConfirmClose} disabled={loadingSummary || !summary}>
            Confirmar cierre
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
