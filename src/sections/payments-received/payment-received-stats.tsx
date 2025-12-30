// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
// redux
import { useGetPaymentStatsQuery } from 'src/redux/services/paymentsReceivedApi';

// ----------------------------------------------------------------------

export default function PaymentReceivedStats() {
  const { data: stats, isLoading } = useGetPaymentStatsQuery();

  if (isLoading) {
    return (
      <Card sx={{ p: 3, height: 400 }}>
        <LoadingScreen />
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No hay estadísticas disponibles
        </Typography>
      </Card>
    );
  }

  const totalAmount = typeof stats.total_amount === 'string' ? parseFloat(stats.total_amount) : stats.total_amount;

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CARD: 'Tarjeta',
    OTHER: 'Otro'
  };

  const methodStats = Object.entries(stats.by_method).map(([method, data]) => ({
    method,
    label: paymentMethodLabels[method] || method,
    count: data.count || 0,
    total: typeof data.total === 'string' ? parseFloat(data.total) : data.total || 0,
    percentage:
      totalAmount > 0
        ? ((typeof data.total === 'string' ? parseFloat(data.total) : data.total || 0) / totalAmount) * 100
        : 0
  }));

  return (
    <Card>
      <CardHeader
        title="Resumen de Pagos Recibidos"
        subheader={`${stats.total_payments} pagos · ${fCurrency(totalAmount)} total`}
        avatar={
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: 1.5,
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter'
            }}
          >
            <Iconify icon="solar:wallet-money-bold" width={24} sx={{ color: 'primary.main' }} />
          </Box>
        }
      />

      <Stack spacing={2.5} sx={{ p: 3, pt: 2 }}>
        {/* Total general */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Total Recibido
            </Typography>
            <Typography variant="h6" color="primary.main">
              {fCurrency(totalAmount)}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.disabled">
              Total de Pagos
            </Typography>
            <Typography variant="subtitle2">{stats.total_payments} pagos</Typography>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Desglose por método de pago */}
        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.primary">
            Por Método de Pago
          </Typography>

          {methodStats.map((method) => (
            <Stack key={method.method} spacing={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {method.label}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.disabled">
                    {method.count} pago{method.count !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="subtitle2">{fCurrency(method.total)}</Typography>
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={method.percentage}
                color={
                  method.method === 'CASH'
                    ? 'success'
                    : method.method === 'TRANSFER'
                    ? 'info'
                    : method.method === 'CARD'
                    ? 'warning'
                    : 'primary'
                }
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
