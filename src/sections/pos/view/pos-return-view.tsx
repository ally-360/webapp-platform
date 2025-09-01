import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { getPosSalesHistory, createCreditNote } from 'src/api';
import type { PosSaleHistoryItem } from 'src/api/types';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';

const MAX_DAYS = 30;

export default function PosReturnView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sale, setSale] = useState<PosSaleHistoryItem | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isWithinWindow = useMemo(() => {
    if (!sale) return false;
    const saleDate = new Date(sale.created_at);
    const diffDays = Math.floor((Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= MAX_DAYS;
  }, [sale]);

  const refundTotal = useMemo(() => {
    if (!sale) return 0;
    return sale.products.reduce((sum, p) => {
      if (!selected[p.id]) return sum;
      const q = Math.min(qty[p.id] || 0, p.quantity);
      return sum + q * p.price;
    }, 0);
  }, [sale, selected, qty]);

  const onSearch = useCallback(async () => {
    setError(null);
    setSale(null);
    setSelected({});
    setQty({});
    if (!query.trim()) {
      setError('Ingresa un número de venta/factura');
      return;
    }
    setLoading(true);
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - MAX_DAYS);
      const res = await getPosSalesHistory({
        query: query.trim(),
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
        limit: 50,
        page: 0
      } as any);
      const rows = (res as any)?.data?.data || [];
      if (!rows.length) {
        setError('No se encontró una venta con ese número en los últimos 30 días');
      } else {
        // intentar match exacto
        const exact = rows.find((r: any) => (r.invoice_number || '').toLowerCase() === query.trim().toLowerCase());
        const chosen = exact || rows[0];
        setSale(chosen);
        // inicializar cantidades por defecto 0
        const qInit: Record<string, number> = {};
        (chosen.products || []).forEach((p: any) => {
          qInit[p.id] = 0;
        });
        setQty(qInit);
      }
    } catch (e) {
      setError('Error buscando la venta');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const toggleLine = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const changeQty = (id: string, value: number, max: number) => {
    const v = Number.isFinite(value) ? Math.max(0, Math.min(value, max)) : 0;
    setQty((prev) => ({ ...prev, [id]: v }));
    setSelected((prev) => ({ ...prev, [id]: v > 0 }));
  };

  const canConfirm = useMemo(() => {
    if (!sale) return false;
    if (!isWithinWindow) return false;
    if (!reason.trim()) return false;
    const anySelected = Object.keys(selected).some((id) => selected[id] && (qty[id] || 0) > 0);
    if (!anySelected) return false;
    // validar no exceder
    const invalid = sale.products.some((p) => (qty[p.id] || 0) > p.quantity);
    if (invalid) return false;
    return true;
  }, [sale, isWithinWindow, reason, qty, selected]);

  const handleConfirm = useCallback(async () => {
    if (!sale) return;
    try {
      await createCreditNote(sale.id, { reason });
      // eslint-disable-next-line no-alert
      alert('Devolución registrada (mock). Se emitió nota crédito si aplica.');
      setSale(null);
      setSelected({});
      setQty({});
      setReason('');
      setQuery('');
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('No se pudo registrar la devolución');
    }
  }, [sale, reason]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Devoluciones"
        icon="mdi:swap-horizontal"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Devoluciones' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField
              label="Número de venta / factura"
              placeholder="Ej: E-1001"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<Iconify icon="mdi:magnify" />}
              onClick={onSearch}
              disabled={loading}
            >
              Buscar venta
            </Button>
          </Stack>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {error}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Solo se permiten devoluciones de hasta {MAX_DAYS} días.
          </Typography>
        </CardContent>
      </Card>

      {sale && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Resumen de venta
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Info label="Factura" value={sale.invoice_number || '-'} />
                <Info label="Fecha" value={fDateTime(sale.created_at, 'dd MMM yyyy HH:mm')} />
                <Info label="Cliente" value={sale.customer?.name || 'Sin cliente'} />
                <Info label="Estado" value={sale.pos_type === 'electronic' ? 'Facturada' : 'No facturada'} />
              </Stack>
              {!isWithinWindow && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  La venta supera el plazo máximo de devolución. No se puede confirmar.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Selecciona productos a devolver
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={48} />
                      <TableCell>Producto</TableCell>
                      <TableCell align="center" width={120}>
                        Vendidos
                      </TableCell>
                      <TableCell align="center" width={160}>
                        Cantidad a devolver
                      </TableCell>
                      <TableCell align="right" width={140}>
                        Subtotal
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sale.products.map((p) => {
                      const checked = !!selected[p.id];
                      const q = qty[p.id] || 0;
                      return (
                        <TableRow key={p.id} hover>
                          <TableCell>
                            <Checkbox checked={checked} onChange={(e) => toggleLine(p.id, e.target.checked)} />
                          </TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2">{p.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                Precio: {fCurrency(p.price)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">{p.quantity}</TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              size="small"
                              inputProps={{ min: 0, max: p.quantity }}
                              value={q}
                              onChange={(e) => changeQty(p.id, Number(e.target.value), p.quantity)}
                              sx={{ width: 120 }}
                            />
                          </TableCell>
                          <TableCell align="right">{fCurrency(q * p.price)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider sx={{ my: 2 }} />
              <TextField
                label="Motivo de devolución"
                placeholder="Describe el motivo"
                multiline
                minRows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={1}
              >
                <Typography variant="subtitle1">Total a devolver: {fCurrency(refundTotal)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Se generará nota crédito si aplica.
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" disabled={!canConfirm} onClick={handleConfirm}>
                  Confirmar devolución
                </Button>
                <Button color="inherit" startIcon={<Iconify icon="mdi:arrow-left" />} href={paths.dashboard.pos}>
                  Volver al POS
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack spacing={0.25} sx={{ minWidth: 200 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
