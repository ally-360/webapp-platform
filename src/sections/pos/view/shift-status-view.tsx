import React, { useMemo } from 'react';
import { Box, Card, CardContent, Container, Stack, Typography, Button, Divider, Chip, Alert } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';
import { fCurrency } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { useRouter } from 'src/routes/hook/use-router';
import { PAYMENT_LABEL } from '../components/sales-history/utils';
import { useGetShiftStatusQuery } from 'src/redux/services/posApi';
import { LoadingScreen } from 'src/components/loading-screen';
import { useCloseCashRegisterMutation } from 'src/redux/services/posApi';
import { useAppSelector } from 'src/hooks/store';

export default function ShiftStatusView() {
  const router = useRouter();
  const currentRegister = useAppSelector((state) => state.pos.currentRegister);
  
  // Obtener pdv_id del registro actual o del localStorage (persistencia en recarga)
  const pdvId = currentRegister?.pdv_id || localStorage.getItem('current_pdv_id');
  
  // Obtener estado del turno en tiempo real (refetch cada 15 segundos)
  const { data: shiftStatus, isLoading, error, refetch } = useGetShiftStatusQuery(
    { pdv_id: pdvId || '' },
    {
      skip: !pdvId,
      pollingInterval: 15000, // Auto-refetch cada 15 segundos
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );

  const [closeCashRegister, { isLoading: isClosing }] = useCloseCashRegisterMutation();

  const statusColor = useMemo(() => {
    if (shiftStatus?.status === 'open') return 'success';
    if (shiftStatus?.status === 'closed') return 'default';
    return 'warning';
  }, [shiftStatus]);

  const handleCloseShift = async () => {
    if (!shiftStatus || !currentRegister?.id) return;
    
    const countedDefault = Number(shiftStatus.expected_cash);
    const counted = Number(window.prompt('Efectivo contado en caja', String(countedDefault)) || countedDefault) || 0;
    const notes = window.prompt('Notas u observaciones') || undefined;
    
    try {
      await closeCashRegister({
        id: currentRegister.id,
        data: {
          closing_balance: counted,
          closing_notes: notes
        }
      }).unwrap();
      
      router.push('/pos/shift/close');
    } catch (err) {
      console.error('Error al cerrar turno:', err);
    }
  };

  const handleDownloadPdf = () => {
    // TODO: Implementar descarga de PDF cuando el endpoint esté disponible
    console.log('Descargar PDF del turno');
  };

  if (isLoading) {
    return (
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading="Turno actual"
          icon="mdi:account-tie"
          links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turno' }]}
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

  if (error) {
    return (
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading="Turno actual"
          icon="mdi:account-tie"
          links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turno' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card>
          <CardContent>
            <Alert severity="error">
              {'status' in error && error.status === 404 
                ? 'No hay turno abierto actualmente'
                : 'Error al cargar el estado del turno'}
            </Alert>
            <Button onClick={() => refetch()} sx={{ mt: 2 }}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (!shiftStatus) {
    return (
      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading="Turno actual"
          icon="mdi:account-tie"
          links={[{ name: 'POS', href: paths.dashboard.pos }, { name: 'Turno' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <Card>
          <CardContent>
            <Alert severity="info">No hay datos del turno disponibles</Alert>
          </CardContent>
        </Card>
      </Container>
    );
  }

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
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
              <Typography variant="h6">Estado del turno</Typography>
              <Chip label={shiftStatus.status.toUpperCase()} color={statusColor as any} />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2">Datos del turno</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5}>
                  <Row label="Usuario" value={shiftStatus.opened_by_name} />
                  <Row label="PDV" value={shiftStatus.pdv_name} />
                  <Row
                    label="Hora de apertura"
                    value={fDateTime(shiftStatus.opened_at, 'dd MMM yyyy HH:mm')}
                  />
                  <Row label="Fondo inicial" value={fCurrency(Number(shiftStatus.opening_balance))} />
                </Stack>
              </Box>

              <Box sx={{ flex: 2 }}>
                <Typography variant="subtitle2">Resumen en tiempo real</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={0.5}>
                  <Row label="Ventas totales" value={fCurrency(Number(shiftStatus.total_sales))} />
                  <Row label="Efectivo esperado" value={fCurrency(Number(shiftStatus.expected_cash))} />
                  <Row label="Valor total en caja" value={fCurrency(Number(shiftStatus.total_in_register))} />
                  <Row label="Total transacciones" value={shiftStatus.total_transactions} />
                  <Row label="Total facturas" value={shiftStatus.total_invoices} />
                </Stack>

                {Object.keys(shiftStatus.payment_methods_breakdown).length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Desglose por método de pago
                    </Typography>
                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                      {Object.entries(shiftStatus.payment_methods_breakdown).map(([method, amount]: [string, string]) => (
                        <Row
                          key={method}
                          label={PAYMENT_LABEL[method] || method}
                          value={fCurrency(Number(amount))}
                        />
                      ))}
                    </Stack>
                  </>
                )}

                {shiftStatus.top_products && shiftStatus.top_products.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2 }}>
                      Top 5 productos vendidos
                    </Typography>
                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                      {shiftStatus.top_products.map((product, index) => (
                        <Row
                          key={`${product.sku}-${index}`}
                          label={`${product.product_name}`}
                          value={fCurrency(Number(product.total))}
                        />
                      ))}
                    </Stack>
                  </>
                )}
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="warning"
                onClick={handleCloseShift}
                disabled={isClosing || shiftStatus.status === 'closed'}
              >
                {isClosing ? 'Cerrando...' : 'Cerrar turno'}
              </Button>
              <Button variant="outlined" onClick={() => router.push('/pos/sales-history')}>
                Ver ventas
              </Button>
            </Stack>
          </Stack>
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
