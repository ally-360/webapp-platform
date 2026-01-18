import { Stack, Typography, Button, Alert, AlertTitle, Grid } from '@mui/material';

// Components
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

// Routes
import { paths } from 'src/routes/paths';

// API
import { useGetAccountsQuery, useGetMovementsQuery } from 'src/redux/services/treasuryApi';

// Components
import TreasurySummaryCards from '../components/treasury-summary-cards';
import AccountsOverview from '../components/accounts-overview';
import LatestMovementsList from '../components/latest-movements-list';
import CashFlowChart from '../components/cash-flow-chart';

// ----------------------------------------------------------------------

export default function TreasuryDashboardView() {
  // RTK Query hooks
  const { data: accountsData, isLoading: isLoadingAccounts } = useGetAccountsQuery({
    is_active: true
  });

  const { data: movementsData, isLoading: isLoadingMovements } = useGetMovementsQuery({
    page: 1,
    size: 100
  });

  // Extracted data
  const accounts = accountsData?.accounts || [];
  const movements = movementsData?.movements || [];

  // Calculate last 30 days movements for chart
  const last30DaysDate = new Date();
  last30DaysDate.setDate(last30DaysDate.getDate() - 30);

  const recentMovements = movements.filter((movement) => new Date(movement.movement_date) >= last30DaysDate);

  // Calculate summary metrics
  const totalInflow = movements
    .filter((m) => m.movement_type === 'inflow' && !m.is_reversed)
    .reduce((sum, m) => sum + parseFloat(m.amount), 0);

  const totalOutflow = movements
    .filter((m) => m.movement_type === 'outflow' && !m.is_reversed)
    .reduce((sum, m) => sum + parseFloat(m.amount), 0);

  const netCashFlow = totalInflow - totalOutflow;

  return (
    <Stack spacing={3} sx={{ pb: 5 }}>
      {/* Breadcrumbs */}
      <CustomBreadcrumbs
        icon="solar:cash-out-bold-duotone"
        heading="Dashboard de Tesorería"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Tesorería' }]}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            href={paths.dashboard.treasury.movements}
          >
            Registrar Movimiento
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />

      {/* Info Alert */}
      <Alert severity="info" icon={<Iconify icon="solar:chart-2-bold" />}>
        <AlertTitle>Vista Ejecutiva</AlertTitle>
        <Typography variant="body2">
          Visualiza el estado de tus cuentas de caja y bancos en tiempo real. Monitorea el flujo de efectivo, saldos
          actuales y últimos movimientos para tomar decisiones financieras informadas.
        </Typography>
      </Alert>

      {/* Summary Cards */}
      <TreasurySummaryCards accounts={accounts} isLoading={isLoadingAccounts} />

      {/* Cash Flow Summary */}
      {(totalInflow > 0 || totalOutflow > 0) && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Stack
              spacing={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'success.lighter',
                border: (theme) => `1px solid ${theme.palette.success.light}`
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:arrow-down-bold-duotone" width={24} sx={{ color: 'success.main' }} />
                <Typography variant="subtitle2" color="success.darker">
                  Total Entradas
                </Typography>
              </Stack>
              <Typography variant="h4" color="success.darker">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(totalInflow)}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack
              spacing={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'error.lighter',
                border: (theme) => `1px solid ${theme.palette.error.light}`
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:arrow-up-bold-duotone" width={24} sx={{ color: 'error.main' }} />
                <Typography variant="subtitle2" color="error.darker">
                  Total Salidas
                </Typography>
              </Stack>
              <Typography variant="h4" color="error.darker">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(totalOutflow)}
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack
              spacing={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: netCashFlow >= 0 ? 'primary.lighter' : 'warning.lighter',
                border: (theme) =>
                  `1px solid ${netCashFlow >= 0 ? theme.palette.primary.light : theme.palette.warning.light}`
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon={netCashFlow >= 0 ? 'solar:graph-up-bold-duotone' : 'solar:graph-down-bold-duotone'}
                  width={24}
                  sx={{ color: netCashFlow >= 0 ? 'primary.main' : 'warning.main' }}
                />
                <Typography variant="subtitle2" color={netCashFlow >= 0 ? 'primary.darker' : 'warning.darker'}>
                  Flujo Neto
                </Typography>
              </Stack>
              <Typography variant="h4" color={netCashFlow >= 0 ? 'primary.darker' : 'warning.darker'}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0
                }).format(netCashFlow)}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* Chart and Latest Movements */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <CashFlowChart movements={recentMovements} isLoading={isLoadingMovements} />
        </Grid>

        <Grid item xs={12} lg={4}>
          <LatestMovementsList movements={movements} accounts={accounts} isLoading={isLoadingMovements} />
        </Grid>
      </Grid>

      {/* Accounts Overview */}
      <AccountsOverview accounts={accounts} isLoading={isLoadingAccounts} />
    </Stack>
  );
}
