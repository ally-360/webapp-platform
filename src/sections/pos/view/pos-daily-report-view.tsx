import React, { useMemo, useState } from 'react';
import { Button, Card, CardContent, Container, Grid, Stack, TextField, Typography, Alert } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { useGetDailyClosingReportQuery } from 'src/redux/services/posApi';
import { LoadingScreen } from 'src/components/loading-screen';
import { useAppSelector } from 'src/hooks/store';
import { PAYMENT_LABEL } from '../components/sales-history/utils';

export default function PosDailyReportView() {
  const [note, setNote] = useState('');
  const currentRegister = useAppSelector((state) => state.pos.currentRegister);

  // Obtener reporte diario/cierre de caja - requiere register_id
  const { data, isLoading, error } = useGetDailyClosingReportQuery(
    { register_id: currentRegister?.id || '' },
    {
      skip: !currentRegister?.id // No hacer request si no hay register_id
    }
  );

  const paymentsList = useMemo(() => {
    if (!data?.payment_methods_breakdown) return [];
    return Object.entries(data.payment_methods_breakdown).map(([method, details]) => ({
      method,
      count: details.count,
      amount: details.amount
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading="Reporte Diario / Cierre de Caja"
          icon="mdi:calendar-check"
          links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Reporte Diario' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card>
          <CardContent>
            <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
              <LoadingScreen />
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading="Reporte Diario / Cierre de Caja"
          icon="mdi:calendar-check"
          links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Reporte Diario' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card>
          <CardContent>
            <Alert severity="error">
              {!currentRegister?.id
                ? 'No hay caja registradora activa. Abre una caja primero.'
                : 'Error al cargar el reporte diario'}
            </Alert>
          </CardContent>
        </Card>
      </Container>
    );
  }

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
                value={`${fDateTime(data.opened_at, 'dd MMM yyyy HH:mm')} - ${
                  data.closed_at ? fDateTime(data.closed_at, 'dd MMM yyyy HH:mm') : '—'
                }`}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Cajero responsable" value={data.cashier_name} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Punto de venta" value={data.pdv_name} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Estado" value={data.status === 'open' ? 'Abierto' : 'Cerrado'} />
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
              <Info label="Subtotal" value={fCurrency(data.subtotal)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Descuentos" value={fCurrency(data.discounts)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Impuestos" value={fCurrency(data.taxes)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Total vendido" value={fCurrency(data.total_sold)} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Productos vendidos" value={data.items_sold} />
            </Grid>
            <Grid item xs={12} md={6} lg={2}>
              <Info label="Facturas generadas" value={data.invoices_count} />
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
            {paymentsList.map((p) => (
              <Stack key={p.method} direction="row" justifyContent="space-between">
                <Typography variant="body2">{PAYMENT_LABEL[p.method] || p.method}</Typography>
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
              <Info label="Fondo inicial" value={fCurrency(data.opening_balance)} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Efectivo esperado" value={fCurrency(data.expected_cash)} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Efectivo contado" value={data.counted_cash !== null ? fCurrency(data.counted_cash) : '—'} />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Info label="Diferencia" value={data.difference !== null ? fCurrency(data.difference) : '—'} />
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {data.difference !== null && data.difference !== 0
              ? 'Existe diferencia en el corte de caja. Revisar movimientos.'
              : 'Corte de caja sin diferencias.'}
          </Typography>
          {data.closing_notes && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Notas:</strong> {data.closing_notes}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 5. Movimientos adicionales */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Movimientos adicionales
          </Typography>
          {data.additional_movements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay movimientos adicionales registrados
            </Typography>
          ) : (
            <Stack spacing={1}>
              {data.additional_movements.map((movement) => (
                <Stack key={movement.id} direction="row" justifyContent="space-between">
                  <Typography variant="body2">
                    {movement.type} {movement.reference && `- ${movement.reference}`}
                    {movement.notes && ` (${movement.notes})`}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {fCurrency(movement.amount)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Notas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            label="Notas y observaciones"
            placeholder="Ej: Faltaron $5.000 en caja"
            multiline
            minRows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
          />
        </CardContent>
      </Card>

      {/* 7. Acciones */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:printer" />}>
          Imprimir
        </Button>
        <Button variant="outlined" startIcon={<Iconify icon="mdi:file-pdf-box" />}>
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
