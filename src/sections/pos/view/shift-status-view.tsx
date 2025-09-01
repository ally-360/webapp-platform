import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Container, Stack, Typography, Button, Divider, Chip } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { getCurrentShiftStatus, closeCurrentShift, downloadShiftReport } from 'src/api';
import { PAYMENT_LABEL } from '../components/sales-history/utils';
import { useRouter } from 'src/routes/hook/use-router';

export default function ShiftStatusView() {
  const [loading, setLoading] = useState(false);
  const [shift, setShift] = useState<any>(null);
  const [closing, setClosing] = useState(false);
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCurrentShiftStatus();
      setShift((res as any).data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const statusColor = useMemo(() => {
    if (shift?.status === 'open') return 'success';
    if (shift?.status === 'closed') return 'default';
    return 'warning';
  }, [shift]);

  const handleCloseShift = async () => {
    if (!shift) return;
    const countedDefault = Number(shift.summary.cashInDrawer || 0);
    const counted = Number(window.prompt('Efectivo contado en caja', String(countedDefault)) || countedDefault) || 0;
    const notes = window.prompt('Notas u observaciones') || undefined;
    setClosing(true);
    try {
      await closeCurrentShift({ countedCash: counted, notes } as any);
      router.push('/pos/shift/close');
    } finally {
      setClosing(false);
    }
  };

  const handleDownloadPdf = async () => {
    const res = await downloadShiftReport('pdf', {} as any);
    const url = (res as any)?.data?.url;
    if (url) window.open(url, '_blank');
  };

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Turno actual"
        icon="mdi:account-tie"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turno' }]}
        action={
          <Button variant="outlined" startIcon={<Iconify icon="mdi:file-pdf-box" />} onClick={handleDownloadPdf}>
            Descargar PDF
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          {loading && <Typography>Cargando...</Typography>}
          {!loading && shift && (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Typography variant="h6">Estado del turno</Typography>
                <Chip label={shift.status.toUpperCase()} color={statusColor as any} />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">Datos del turno</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5}>
                    <Row label="Usuario" value={shift.user?.name} />
                    <Row label="PDV" value={shift.pos?.name} />
                    <Row label="Hora de apertura" value={fDateTime(shift.openedAt, 'dd MMM yyyy HH:mm')} />
                    <Row label="Fondo inicial" value={fCurrency(shift.summary.openingCash)} />
                  </Stack>
                </Box>

                <Box sx={{ flex: 2 }}>
                  <Typography variant="subtitle2">Resumen en tiempo real</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Stack spacing={0.5}>
                    <Row label="Ventas totales" value={fCurrency(shift.summary.salesTotal)} />
                    <Row label="Efectivo esperado" value={fCurrency(shift.summary.expectedCash)} />
                    <Row label="Valor total en caja" value={fCurrency(shift.summary.cashInDrawer)} />
                  </Stack>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Desglose por método
                  </Typography>
                  <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                    {Object.entries(shift.summary.byMethod).map(([m, v]) => (
                      <Row key={m} label={PAYMENT_LABEL[m] || m} value={fCurrency(v as number)} />
                    ))}
                  </Stack>

                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Top 5 productos
                  </Typography>
                  <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                    {shift.summary.topProducts.map((p: any) => (
                      <Row key={p.id} label={`${p.name} (x${p.qty})`} value={fCurrency(p.total)} />
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2}>
                <Button variant="contained" color="warning" onClick={handleCloseShift} disabled={closing}>
                  Cerrar turno
                </Button>
                <Button variant="outlined" onClick={() => router.push('/pos/history')}>
                  Ver ventas
                </Button>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
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
