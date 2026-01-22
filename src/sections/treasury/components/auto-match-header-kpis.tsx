import { Grid, Card, Stack, Typography, Chip, LinearProgress, Box } from '@mui/material';

import { fNumber, fPercent, fCurrency } from 'src/utils/format-number';
import type { BankReconciliation } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

interface Props {
  reconciliation: BankReconciliation;
}

export default function AutoMatchHeaderKpis({ reconciliation }: Props) {
  const {
    total_statement_lines = 0,
    reconciled_lines = 0,
    unreconciled_lines = 0,
    reconciliation_percentage = 0,
    balance_difference = 0,
    is_balanced = false,
    bank_account
  } = reconciliation;

  const currency = bank_account?.currency || 'COP';

  return (
    <Grid container spacing={2}>
      {/* Total Lines */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Total líneas extracto
            </Typography>
            <Typography variant="h4">{fNumber(total_statement_lines)}</Typography>
          </Stack>
        </Card>
      </Grid>

      {/* Reconciled Lines */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, bgcolor: 'success.lighter' }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Conciliadas
            </Typography>
            <Typography variant="h4" color="success.dark">
              {fNumber(reconciled_lines)}
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* Unreconciled Lines */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, bgcolor: unreconciled_lines > 0 ? 'warning.lighter' : 'background.neutral' }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              No conciliadas
            </Typography>
            <Typography variant="h4" color={unreconciled_lines > 0 ? 'warning.dark' : 'text.primary'}>
              {fNumber(unreconciled_lines)}
            </Typography>
          </Stack>
        </Card>
      </Grid>

      {/* Progress */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              % Conciliación
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h4">{fPercent(reconciliation_percentage)}</Typography>
              <LinearProgress
                variant="determinate"
                value={reconciliation_percentage}
                color={
                  reconciliation_percentage >= 100 ? 'success' : reconciliation_percentage >= 50 ? 'warning' : 'error'
                }
                sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>

      {/* Balance Difference */}
      <Grid item xs={12}>
        <Card
          sx={{
            p: 2,
            bgcolor: is_balanced ? 'success.lighter' : balance_difference !== 0 ? 'error.lighter' : 'background.neutral'
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Diferencia de saldos
              </Typography>
              <Typography
                variant="h5"
                color={is_balanced ? 'success.dark' : balance_difference !== 0 ? 'error.dark' : 'text.primary'}
              >
                {fCurrency(Math.abs(balance_difference))}
              </Typography>
            </Box>
            <Chip
              label={is_balanced ? 'Balanceado' : 'Desbalanceado'}
              color={is_balanced ? 'success' : 'error'}
              variant="filled"
            />
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
}
