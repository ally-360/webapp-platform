/* eslint-disable import/no-duplicates */
import { Card, CardContent, Stack, Typography, Box, Chip, Alert, LinearProgress } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { BankReconciliationDetail, ReconciliationStatus } from '../types';

// ----------------------------------------------------------------------

type Props = {
  reconciliation: BankReconciliationDetail;
};

const STATUS_CONFIG: Record<
  ReconciliationStatus,
  {
    label: string;
    color: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  }
> = {
  draft: { label: 'Borrador', color: 'default' },
  in_progress: { label: 'En Proceso', color: 'info' },
  completed: { label: 'Completada', color: 'success' },
  reversed: { label: 'Revertida', color: 'error' }
};

export default function ReconciliationHeader({ reconciliation }: Props) {
  const isDifferenceZero = reconciliation.balance_difference === 0;
  const canFinalize = isDifferenceZero && reconciliation.status === 'in_progress';
  const isCompleted = reconciliation.status === 'completed';
  const isReversed = reconciliation.status === 'reversed';

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: es });
    } catch {
      return date;
    }
  };

  const progressPercentage =
    reconciliation.total_statement_lines > 0
      ? Math.round((reconciliation.reconciled_lines / reconciliation.total_statement_lines) * 100)
      : 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack spacing={3}>
          {/* Title and Status */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack spacing={1}>
              <Typography variant="h4">{reconciliation.bank_account?.name || 'Cuenta Bancaria'}</Typography>
              <Typography variant="body2" color="text.secondary">
                Período: {formatDate(reconciliation.period_start_date)} - {formatDate(reconciliation.period_end_date)}
              </Typography>
            </Stack>

            <Chip
              label={STATUS_CONFIG[reconciliation.status].label}
              color={STATUS_CONFIG[reconciliation.status].color}
              size="medium"
            />
          </Stack>

          {/* Balances Grid */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* Starting Balance */}
            <Box sx={{ flex: 1, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Saldo Inicial Banco
              </Typography>
              <Typography variant="h6">{fCurrency(reconciliation.bank_balance_start)}</Typography>
            </Box>

            {/* Ending Balance */}
            <Box sx={{ flex: 1, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Saldo Final Banco
              </Typography>
              <Typography variant="h6">{fCurrency(reconciliation.bank_balance_end)}</Typography>
            </Box>

            {/* Book Balance */}
            <Box sx={{ flex: 1, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Saldo Contable
              </Typography>
              <Typography variant="h6">{fCurrency(reconciliation.book_balance_end)}</Typography>
            </Box>

            {/* Difference - Highlighted */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                bgcolor: isDifferenceZero ? 'success.lighter' : 'error.lighter',
                borderRadius: 1,
                border: 2,
                borderColor: isDifferenceZero ? 'success.main' : 'error.main'
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon={isDifferenceZero ? 'solar:check-circle-bold' : 'solar:danger-circle-bold'}
                  width={20}
                  sx={{ color: isDifferenceZero ? 'success.main' : 'error.main' }}
                />
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Diferencia
                </Typography>
              </Stack>
              <Typography
                variant="h5"
                sx={{
                  color: isDifferenceZero ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}
              >
                {fCurrency(reconciliation.balance_difference)}
              </Typography>
            </Box>
          </Stack>

          {/* Progress Bar */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progreso de Conciliación
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {reconciliation.reconciled_lines} / {reconciliation.total_statement_lines} líneas conciliadas (
                {progressPercentage}%)
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                '& .MuiLinearProgress-bar': {
                  bgcolor: progressPercentage === 100 ? 'success.main' : 'info.main'
                }
              }}
            />
          </Box>

          {/* Status Messages */}
          {canFinalize && (
            <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold" />}>
              <Typography variant="body2">
                ¡Conciliación balanceada! La diferencia es $0.00. Puedes finalizar el proceso.
              </Typography>
            </Alert>
          )}

          {!isDifferenceZero && !isCompleted && !isReversed && (
            <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />}>
              <Typography variant="body2">
                Existe una diferencia de {fCurrency(Math.abs(reconciliation.balance_difference))}. Debes conciliar todas
                las transacciones para poder finalizar.
              </Typography>
            </Alert>
          )}

          {isCompleted && (
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
              <Typography variant="body2">
                Esta conciliación fue completada el{' '}
                {reconciliation.reconciled_at && formatDate(reconciliation.reconciled_at)}.
              </Typography>
            </Alert>
          )}

          {isReversed && (
            <Alert severity="error" icon={<Iconify icon="solar:close-circle-bold" />}>
              <Typography variant="body2">
                Esta conciliación fue revertida
                {reconciliation.reversal_reason && `: ${reconciliation.reversal_reason}`}
              </Typography>
            </Alert>
          )}

          {/* Notes */}
          {reconciliation.notes && (
            <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Notas
              </Typography>
              <Typography variant="body2">{reconciliation.notes}</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
