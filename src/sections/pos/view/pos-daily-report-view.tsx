import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import { getCurrentShiftStatus, downloadShiftReport } from 'src/api';
import { fDateTime } from 'src/utils/format-time';

export default function PosDailyReportView() {
  const [note, setNote] = useState('');
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCurrentShiftStatus();
        setData((res as any)?.data || null);
      } catch (e) {
        setData(null);
      }
    };
    load();
  }, []);

  const paymentsList = useMemo(() => {
    const map = data?.summary?.payments || {};
    return Object.entries(map).map(([method, v]: any) => ({ method, ...v }));
  }, [data]);

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Reporte Diario / Cierre de Caja"
        icon="mdi:calendar-check"
        links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Reporte Diario' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* 1. Resumen general del día */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Resumen general del día
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <Info
                label="Fecha / turno"
                value={`${fDateTime(data?.openingTime, 'dd MMM yyyy HH:mm')} - ${
                  data?.closingTime ? fDateTime(data?.closingTime, 'dd MMM yyyy HH:mm') : '—'
                }`}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Cajero responsable" value={data?.user?.name || '—'} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Punto de venta" value={data?.pdv?.name || '—'} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Empresa" value={data?.company || '—'} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. Resumen de ventas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Resumen de ventas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Subtotal" value={fCurrency(data?.summary?.subtotal || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Descuentos" value={fCurrency(data?.summary?.discounts || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Impuestos" value={fCurrency(data?.summary?.taxes || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Total vendido" value={fCurrency(data?.summary?.total || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Productos vendidos" value={`${data?.summary?.items || 0} ítems`} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Facturas electrónicas" value={`${data?.summary?.electronicInvoices || 0}`} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 3. Detalle por forma de pago */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Detalle por forma de pago
          </Typography>
          <Stack spacing={0.75}>
            {paymentsList.map((p: any) => (
              <Stack key={p.method} direction="row" justifyContent="space-between">
                <Typography variant="body2">{labelPayment(p.method)}</Typography>
                <Typography variant="body2">
                  {fCurrency(p.amount)} · {p.count} transacciones
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* 4. Corte de caja */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Corte de caja
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Fondo inicial" value={fCurrency(data?.openingCash || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Efectivo esperado" value={fCurrency(data?.summary?.cashExpected || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Efectivo contado" value={fCurrency(data?.summary?.cashCounted || 0)} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info
                label="Diferencia"
                value={fCurrency((data?.summary?.cashCounted || 0) - (data?.summary?.cashExpected || 0))}
              />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Si existe diferencia, ingresa una nota obligatoria.
          </Typography>
          <TextField
            label="Notas y observaciones"
            placeholder="Ej: Faltaron $5.000 en caja"
            multiline
            minRows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 2 }}
            fullWidth
          />
        </CardContent>
      </Card>

      {/* 5. Movimientos adicionales (placeholder) */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Movimientos adicionales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Próximamente: registro de entradas/salidas de efectivo (no ventas).
          </Typography>
        </CardContent>
      </Card>

      {/* 7. Acciones */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:printer" />}>
          Imprimir
        </Button>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:file-pdf-box" />}
          onClick={async () => {
            const res = await downloadShiftReport('pdf', { date: new Date().toISOString().slice(0, 10) } as any);
            const url = (res as any)?.data?.url;
            if (url) window.open(url, '_blank');
          }}
        >
          Descargar PDF
        </Button>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:file-excel" />}>
          Descargar Excel
        </Button>
        <Button color="inherit" href={paths.dashboard.pos} startIcon={<Iconify icon="mdi:arrow-left" />}>
          Volver al POS
        </Button>
      </Stack>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}

function labelPayment(method: string) {
  const map: any = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    mixed: 'Combinados',
    credit: 'Crédito'
  };
  return map[method] || method;
}
