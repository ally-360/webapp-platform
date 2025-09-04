import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import { getShiftHistory, getShiftById, downloadShiftReport } from 'src/api';
import CustomDateRangePicker from 'src/components/custom-date-range-picker';
import Scrollbar from 'src/components/scrollbar';

export default function ShiftHistoryView() {
  const [filters, setFilters] = useState<{
    start?: string | null;
    end?: string | null;
    userId?: string;
    posId?: string;
  }>({ start: null, end: null });
  const [openPicker, setOpenPicker] = useState(false);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<any | null>(null);

  const label = useMemo(() => {
    if (filters.start && filters.end) {
      return `${fDate(filters.start, 'dd MMM yy')} - ${fDate(filters.end, 'dd MMM yy')}`;
    }
    return 'Rango de fechas';
  }, [filters.start, filters.end]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getShiftHistory({
        dateFrom: filters.start || undefined,
        dateTo: filters.end || undefined,
        userId: filters.userId || undefined,
        posId: filters.posId || undefined,
        page: 0,
        limit: 100
      } as any);
      setRows((res as any).data.data || (res as any).data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.start, filters.end, filters.userId, filters.posId]);

  const dateError = useMemo(() => {
    if (filters.start && filters.end) return new Date(filters.start).getTime() > new Date(filters.end).getTime();
    return false;
  }, [filters.start, filters.end]);

  const handleOpenDetail = async (id: string) => {
    const res = await getShiftById(id);
    setDetail((res as any).data);
    setDetailOpen(true);
  };

  const handleExport = async (fmt: 'pdf' | 'excel', row?: any) => {
    const params = row ? { id: row.id } : { dateFrom: filters.start || undefined, dateTo: filters.end || undefined };
    const res = await downloadShiftReport(fmt, params as any);
    const url = (res as any)?.data?.url;
    if (url) window.open(url, '_blank');
  };

  // Local any-cast for Scrollbar typing
  const ScrollbarAny: any = Scrollbar;

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Historial de turnos"
        icon="mdi:clock-outline"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turnos' }]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => handleExport('excel')} startIcon={<Iconify icon="mdi:table" />}>
              Exportar Excel
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('pdf')}
              startIcon={<Iconify icon="mdi:file-pdf-box" />}
            >
              Exportar PDF
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Stack spacing={2} sx={{ p: 2 }} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            value={label}
            onClick={() => setOpenPicker(true)}
            label="Rango de fechas"
            InputProps={{ readOnly: true }}
            sx={{ width: { xs: 1, md: 260 } }}
          />

          <TextField
            label="Usuario"
            select
            value={filters.userId || ''}
            onChange={(e) => setFilters((p) => ({ ...p, userId: e.target.value || undefined }))}
            sx={{ width: { xs: 1, md: 220 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="u-1">Cajero Demo</MenuItem>
          </TextField>

          <TextField
            label="PDV"
            select
            value={filters.posId || ''}
            onChange={(e) => setFilters((p) => ({ ...p, posId: e.target.value || undefined }))}
            sx={{ width: { xs: 1, md: 220 } }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pos-1">Caja 1</MenuItem>
          </TextField>
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <ScrollbarAny>
            <Table sx={{ minWidth: 960 }}>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8}>Cargando...</TableCell>
                  </TableRow>
                )}
                {!loading &&
                  rows.map((row) => {
                    const expected = row.summary.cashInDrawer;
                    const counted = row.countedCash ?? null;
                    const diff = row.difference ?? (counted != null ? counted - expected : null);
                    const diffColor =
                      diff == null
                        ? 'text.secondary'
                        : diff === 0
                        ? 'text.primary'
                        : diff > 0
                        ? 'success.main'
                        : 'error.main';
                    const statusLabel =
                      row.status === 'open' ? 'Abierto' : row.status === 'closed' ? 'Cerrado' : 'Error';
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ width: 200 }}>{fDateTime(row.openedAt, 'dd MMM yyyy HH:mm')}</TableCell>
                        <TableCell sx={{ width: 200 }}>{row.user?.name}</TableCell>
                        <TableCell sx={{ width: 160 }}>{row.pos?.name}</TableCell>
                        <TableCell sx={{ width: 160 }}>{fCurrency(row.summary.salesTotal)}</TableCell>
                        <TableCell sx={{ width: 200 }}>{fCurrency(expected)}</TableCell>
                        <TableCell sx={{ width: 200 }}>{counted != null ? fCurrency(counted) : '-'}</TableCell>
                        <TableCell sx={{ width: 160 }}>
                          <Typography variant="body2" color={diffColor as any}>
                            {diff != null ? fCurrency(diff) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 120 }}>{statusLabel}</TableCell>
                        <TableCell align="right" sx={{ width: 220 }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" onClick={() => handleOpenDetail(row.id)}>
                              Ver detalle
                            </Button>
                            <Button size="small" onClick={() => handleExport('pdf', row)}>
                              PDF
                            </Button>
                            <Button size="small" onClick={() => handleExport('excel', row)}>
                              Excel
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </ScrollbarAny>
        </TableContainer>
      </Card>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del turno</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Row label="Fecha apertura" value={fDateTime(detail.openedAt, 'dd MMM yyyy HH:mm')} />
                {detail.closedAt && (
                  <Row label="Fecha cierre" value={fDateTime(detail.closedAt, 'dd MMM yyyy HH:mm')} />
                )}
                <Row label="Usuario" value={detail.user?.name} />
                <Row label="PDV" value={detail.pos?.name} />
              </Stack>

              <Divider />
              <Row label="Fondo inicial" value={fCurrency(detail.summary.openingCash)} />
              <Row label="Ventas totales" value={fCurrency(detail.summary.salesTotal)} />
              <Row label="Efectivo esperado" value={fCurrency(detail.summary.expectedCash)} />
              <Row label="Total en caja (esperado)" value={fCurrency(detail.summary.cashInDrawer)} />
              {detail.countedCash != null && <Row label="Efectivo contado" value={fCurrency(detail.countedCash)} />}
              {detail.difference != null && (
                <Row
                  label="Diferencia"
                  value={
                    <Typography
                      color={
                        (detail.difference || 0) === 0
                          ? 'text.primary'
                          : detail.difference > 0
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {fCurrency(detail.difference)}
                    </Typography>
                  }
                />
              )}
              {detail.notes && <Row label="Notas" value={detail.notes} />}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <CustomDateRangePicker
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        variant="calendar"
        title="Seleccionar rango"
        startDate={filters.start ? new Date(filters.start) : null}
        endDate={filters.end ? new Date(filters.end) : null}
        onChangeStartDate={(d) =>
          setFilters((p) => ({ ...p, start: d ? new Date(d).toISOString().slice(0, 10) : null }))
        }
        onChangeEndDate={(d) => setFilters((p) => ({ ...p, end: d ? new Date(d).toISOString().slice(0, 10) : null }))}
        error={dateError}
      />
    </Container>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
