import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  TablePagination,
  Box,
  Chip
} from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook/use-router';
import { fCurrency } from 'src/utils/format-number';
import { fDate, fDateTime } from 'src/utils/format-time';
import CustomDateRangePicker from 'src/components/custom-date-range-picker';
import Scrollbar from 'src/components/scrollbar';
import { useGetShiftHistoryQuery, useGetShiftDetailQuery, useLazyGetCurrentCashRegisterQuery } from 'src/redux/services/posApi';
import type { ShiftHistoryParams } from 'src/types/pos';
import { useAppDispatch } from 'src/hooks/store';
import { openRegister } from 'src/redux/pos/posSlice';

export default function ShiftHistoryView() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [filters, setFilters] = useState<ShiftHistoryParams>({
    page: 1,
    page_size: 20,
    sort_by: 'opened_at',
    sort_order: 'desc'
  });
  const [openPicker, setOpenPicker] = useState(false);

  const [joiningPdvId, setJoiningPdvId] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | null>(null);

  // Fetch shift history with filters
  const { data: historyData, isLoading } = useGetShiftHistoryQuery(filters);

  const [getCurrentCashRegister] = useLazyGetCurrentCashRegisterQuery();

  // Fetch shift detail when modal is open
  const { data: shiftDetail, isLoading: loadingDetail } = useGetShiftDetailQuery(selectedRegisterId || '', {
    skip: !selectedRegisterId || !detailOpen
  });

  const label = useMemo(() => {
    if (filters.date_from && filters.date_to) {
      return `${fDate(filters.date_from, 'dd MMM yy')} - ${fDate(filters.date_to, 'dd MMM yy')}`;
    }
    return 'Rango de fechas';
  }, [filters.date_from, filters.date_to]);

  const dateError = useMemo(() => {
    if (filters.date_from && filters.date_to)
      return new Date(filters.date_from).getTime() > new Date(filters.date_to).getTime();
    return false;
  }, [filters.date_from, filters.date_to]);

  const handleOpenDetail = (register_id: string) => {
    setSelectedRegisterId(register_id);
    setDetailOpen(true);
  };

  const handleGoToOpenShift = async (pdv_id: string, pdv_name: string) => {
    try {
      setJoiningPdvId(pdv_id);

      const register = await getCurrentCashRegister(pdv_id).unwrap();

      dispatch(
        openRegister({
          register_id: register.id,
          user_id: register.opened_by || 'current_user',
          user_name: 'Usuario',
          pdv_id: register.pdv_id,
          pdv_name,
          opening_amount: parseFloat(register.opening_balance) || 0,
          notes: register.opening_notes || undefined,
          shift_id: register.id
        })
      );

      router.push('/pos');
    } finally {
      setJoiningPdvId(null);
    }
  };

  const handleCloseDetail = () => {
    setDetailOpen(false);
    setSelectedRegisterId(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, page_size: parseInt(event.target.value, 10), page: 1 }));
  };

  // Local any-cast for Scrollbar typing
  const ScrollbarAny: any = Scrollbar;

  const rows = historyData?.items || [];
  const totalRows = historyData?.total || 0;
  const currentPage = (filters.page || 1) - 1;
  const pageSize = filters.page_size || 20;

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Historial de turnos"
        icon="mdi:clock-outline"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turnos' }]}
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
        </Stack>

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <ScrollbarAny>
            <Table sx={{ minWidth: 960 }}>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        No hay turnos registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  rows.map((row) => {
                    const difference = parseFloat(row.difference || '0');
                    let diffColor = 'text.primary';
                    if (difference > 0) {
                      diffColor = 'success.main';
                    } else if (difference < 0) {
                      diffColor = 'error.main';
                    }
                    const statusLabel = row.status === 'open' ? 'Abierto' : 'Cerrado';
                    const statusColor = row.status === 'open' ? 'warning' : 'success';

                    return (
                      <TableRow key={row.register_id} hover>
                        <TableCell sx={{ width: 200 }}>{fDateTime(row.opened_at, 'dd MMM yyyy HH:mm')}</TableCell>
                        <TableCell sx={{ width: 200 }}>
                          {row.closed_at ? fDateTime(row.closed_at, 'dd MMM yyyy HH:mm') : '-'}
                        </TableCell>
                        <TableCell sx={{ width: 180 }}>{row.opened_by_name}</TableCell>
                        <TableCell sx={{ width: 160 }}>{row.pdv_name}</TableCell>
                        <TableCell sx={{ width: 160 }} align="right">
                          {fCurrency(parseFloat(row.total_sales))}
                        </TableCell>
                        <TableCell sx={{ width: 160 }} align="right">
                          {fCurrency(parseFloat(row.expected_balance))}
                        </TableCell>
                        <TableCell sx={{ width: 160 }} align="right">
                          {row.declared_balance ? fCurrency(parseFloat(row.declared_balance)) : '-'}
                        </TableCell>
                        <TableCell sx={{ width: 140 }} align="right">
                          <Typography variant="body2" color={diffColor as any}>
                            {row.difference ? fCurrency(difference) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: 100 }}>
                          <Chip label={statusLabel} color={statusColor} size="small" />
                        </TableCell>
                        <TableCell align="right" sx={{ width: 120 }}>
                          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                            <Button size="small" onClick={() => handleOpenDetail(row.register_id)}>
                              Ver detalle
                            </Button>
                            {row.status === 'open' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="warning"
                                disabled={joiningPdvId === row.pdv_id}
                                startIcon={joiningPdvId === row.pdv_id ? <CircularProgress size={14} /> : undefined}
                                onClick={() => handleGoToOpenShift(row.pdv_id, row.pdv_name)}
                              >
                                Ir al turno
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </ScrollbarAny>
        </TableContainer>

        {!isLoading && rows.length > 0 && (
          <TablePagination
            component="div"
            count={totalRows}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        )}
      </Card>

      <Dialog open={detailOpen} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>Detalle del turno</DialogTitle>
        <DialogContent dividers>
          {loadingDetail && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          )}
          {!loadingDetail && shiftDetail && (
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Información del turno
              </Typography>
              <Stack spacing={0.5}>
                <Row label="PDV" value={shiftDetail.pdv_name} />
                <Row label="Fecha apertura" value={fDateTime(shiftDetail.opened_at, 'dd MMM yyyy HH:mm')} />
                {shiftDetail.closed_at && (
                  <Row label="Fecha cierre" value={fDateTime(shiftDetail.closed_at, 'dd MMM yyyy HH:mm')} />
                )}
                <Row label="Duración" value={`${shiftDetail.duration_minutes || 0} minutos`} />
                <Row label="Abierto por" value={shiftDetail.opened_by_name} />
                {shiftDetail.closed_by_name && <Row label="Cerrado por" value={shiftDetail.closed_by_name} />}
                <Row
                  label="Estado"
                  value={
                    <Chip
                      label={shiftDetail.status === 'open' ? 'Abierto' : 'Cerrado'}
                      color={shiftDetail.status === 'open' ? 'warning' : 'success'}
                      size="small"
                    />
                  }
                />
              </Stack>

              <Divider />

              <Typography variant="subtitle2" color="text.secondary">
                Resumen financiero
              </Typography>
              <Stack spacing={0.5}>
                <Row label="Saldo inicial" value={fCurrency(parseFloat(shiftDetail.opening_balance))} />
                <Row
                  label="Total ventas"
                  value={<Typography color="success.main">{fCurrency(parseFloat(shiftDetail.total_sales))}</Typography>}
                />
                <Row
                  label="Total depósitos"
                  value={
                    <Typography color="success.main">{fCurrency(parseFloat(shiftDetail.total_deposits))}</Typography>
                  }
                />
                <Row
                  label="Total retiros"
                  value={
                    <Typography color="error.main">{fCurrency(parseFloat(shiftDetail.total_withdrawals))}</Typography>
                  }
                />
                <Row
                  label="Total gastos"
                  value={
                    <Typography color="error.main">{fCurrency(parseFloat(shiftDetail.total_expenses))}</Typography>
                  }
                />
                {parseFloat(shiftDetail.total_adjustments) !== 0 && (
                  <Row label="Ajustes" value={fCurrency(parseFloat(shiftDetail.total_adjustments))} />
                )}
                <Row label="Saldo esperado" value={fCurrency(parseFloat(shiftDetail.expected_balance))} />
                {shiftDetail.declared_balance && (
                  <Row label="Saldo declarado" value={fCurrency(parseFloat(shiftDetail.declared_balance))} />
                )}
                {shiftDetail.difference && (
                  <Row
                    label="Diferencia"
                    value={
                      <Typography
                        color={
                          parseFloat(shiftDetail.difference) === 0
                            ? 'text.primary'
                            : parseFloat(shiftDetail.difference) > 0
                            ? 'success.main'
                            : 'error.main'
                        }
                      >
                        {fCurrency(parseFloat(shiftDetail.difference))}
                      </Typography>
                    }
                  />
                )}
                {shiftDetail.physical_cash_count && (
                  <Row label="Conteo físico efectivo" value={fCurrency(parseFloat(shiftDetail.physical_cash_count))} />
                )}
              </Stack>

              <Divider />

              <Typography variant="subtitle2" color="text.secondary">
                Desglose por método de pago
              </Typography>
              <Stack spacing={0.5}>
                {Object.entries(shiftDetail.payment_methods_breakdown).map(([method, amount]) => (
                  <Row key={method} label={method} value={fCurrency(parseFloat(amount as string))} />
                ))}
              </Stack>

              <Divider />

              <Typography variant="subtitle2" color="text.secondary">
                Estadísticas
              </Typography>
              <Stack spacing={0.5}>
                <Row label="Total transacciones" value={shiftDetail.total_transactions.toString()} />
                <Row label="Total facturas" value={shiftDetail.total_invoices.toString()} />
              </Stack>

              {shiftDetail.closing_notes && (
                <>
                  <Divider />
                  <Typography variant="subtitle2" color="text.secondary">
                    Notas de cierre
                  </Typography>
                  <Typography variant="body2">{shiftDetail.closing_notes}</Typography>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <CustomDateRangePicker
        open={openPicker}
        onClose={() => setOpenPicker(false)}
        variant="calendar"
        title="Seleccionar rango"
        startDate={filters.date_from ? new Date(filters.date_from) : null}
        endDate={filters.date_to ? new Date(filters.date_to) : null}
        onChangeStartDate={(d) =>
          setFilters((p) => ({
            ...p,
            date_from: d ? new Date(d).toISOString().slice(0, 10) : undefined
          }))
        }
        onChangeEndDate={(d) =>
          setFilters((p) => ({
            ...p,
            date_to: d ? new Date(d).toISOString().slice(0, 10) : undefined
          }))
        }
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
