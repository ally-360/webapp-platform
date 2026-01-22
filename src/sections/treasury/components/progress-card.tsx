import { Card, CardHeader, CardContent, Stack, Typography, LinearProgress, Box, Chip } from '@mui/material';
import Iconify from 'src/components/iconify';
import type { BankReconciliation } from 'src/sections/treasury/types';

interface ProgressCardProps {
  reconciliation: BankReconciliation;
}

export default function ProgressCard({ reconciliation }: ProgressCardProps) {
  const { reconciled_lines, total_statement_lines, unreconciled_lines, reconciliation_percentage } = reconciliation;

  const percentage = parseFloat(reconciliation_percentage?.toString() || '0');
  const isComplete = percentage === 100;
  const hasProgress = percentage > 0;

  const getProgressColor = () => {
    if (percentage === 100) return 'success';
    if (percentage >= 75) return 'primary';
    if (percentage >= 50) return 'info';
    if (percentage >= 25) return 'warning';
    return 'error';
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Iconify
            icon="solar:chart-2-bold-duotone"
            width={24}
            sx={{ color: isComplete ? 'success.main' : 'primary.main' }}
          />
        }
        title="Progreso de Conciliación"
        subheader={hasProgress ? `${percentage.toFixed(0)}% completado` : 'Sin iniciar'}
      />

      <CardContent>
        <Stack spacing={3}>
          {/* Progress Bar */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progreso
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {percentage.toFixed(0)}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              color={getProgressColor()}
              sx={{ height: 10, borderRadius: 1 }}
            />
          </Box>

          {/* Stats Grid */}
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="eva:checkmark-circle-2-fill" width={18} sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Líneas conciliadas:
                </Typography>
              </Stack>
              <Chip size="small" label={reconciled_lines} color="success" />
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <Iconify icon="solar:document-text-bold-duotone" width={18} sx={{ color: 'info.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Total de líneas:
                </Typography>
              </Stack>
              <Chip size="small" label={total_statement_lines} color="info" />
            </Stack>

            {unreconciled_lines > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="eva:alert-triangle-fill" width={18} sx={{ color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Líneas pendientes:
                  </Typography>
                </Stack>
                <Chip size="small" label={unreconciled_lines} color="warning" />
              </Stack>
            )}
          </Stack>

          {/* Status Message */}
          {isComplete ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'success.lighter'
              }}
            >
              <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main' }} />
              <Typography variant="body2" color="success.dark" fontWeight={600}>
                ¡Todas las líneas han sido conciliadas!
              </Typography>
            </Stack>
          ) : unreconciled_lines > 0 ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'warning.lighter'
              }}
            >
              <Iconify icon="eva:alert-triangle-fill" width={20} sx={{ color: 'warning.main' }} />
              <Typography variant="body2" color="warning.dark">
                Quedan {unreconciled_lines} línea{unreconciled_lines !== 1 ? 's' : ''} por conciliar
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
