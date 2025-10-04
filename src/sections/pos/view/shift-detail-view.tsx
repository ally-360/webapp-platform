import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, CardContent, Container, Divider, Stack, Typography } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { getShiftById, downloadShiftReport } from 'src/api';
import Iconify from 'src/components/iconify';

export default function ShiftDetailView() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [shift, setShift] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await getShiftById(id);
        setShift((res as any).data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleExport = async (fmt: 'pdf' | 'excel') => {
    if (!id) return;
    const res = await downloadShiftReport(fmt, { id } as any);
    const url = (res as any)?.data?.url;
    if (url) window.open(url, '_blank');
  };

  const diffColor = (val: number) => {
    if (val === 0) return 'text.primary';
    if (val > 0) return 'success.main';
    return 'error.main';
  };

  return (
    <Container maxWidth={false}>
      <CustomBreadcrumbs
        heading="Detalle de turno"
        icon="mdi:clipboard-text"
        links={[
          { name: 'POS', href: paths.dashboard.pos },
          { name: 'Turnos', href: '/pos/shift/history' },
          { name: id || '' }
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => handleExport('excel')} startIcon={<Iconify icon="mdi:table" />}>
              Excel
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleExport('pdf')}
              startIcon={<Iconify icon="mdi:file-pdf-box" />}
            >
              PDF
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          {loading && <Typography>Cargando...</Typography>}
          {!loading && shift && (
            <Stack spacing={3}>
              <Stack spacing={0.5}>
                <Row label="Fecha apertura" value={fDateTime(shift.openedAt, 'dd MMM yyyy HH:mm')} />
                {shift.closedAt && <Row label="Fecha cierre" value={fDateTime(shift.closedAt, 'dd MMM yyyy HH:mm')} />}
                <Row label="Usuario" value={shift.user?.name} />
                <Row label="PDV" value={shift.pos?.name} />
              </Stack>

              <Divider />

              <Stack spacing={0.5}>
                <Row label="Fondo inicial" value={fCurrency(shift.summary.openingCash)} />
                <Row label="Ventas totales" value={fCurrency(shift.summary.salesTotal)} />
                <Row label="Efectivo esperado" value={fCurrency(shift.summary.expectedCash)} />
                <Row label="Total en caja (esperado)" value={fCurrency(shift.summary.cashInDrawer)} />
                {shift.countedCash != null && <Row label="Efectivo contado" value={fCurrency(shift.countedCash)} />}
                {typeof shift.difference === 'number' && (
                  <Row
                    label="Diferencia"
                    value={<Typography color={diffColor(shift.difference)}>{fCurrency(shift.difference)}</Typography>}
                  />
                )}
                {shift.notes && <Row label="Notas" value={shift.notes} />}
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
