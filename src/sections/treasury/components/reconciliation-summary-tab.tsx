/* eslint-disable import/no-duplicates */
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Box,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';

import type { BankReconciliation } from '../types';

// ----------------------------------------------------------------------

type Props = {
  reconciliation: BankReconciliation;
};

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'default' as const },
  in_progress: { label: 'En Proceso', color: 'info' as const },
  completed: { label: 'Completada', color: 'success' as const },
  reversed: { label: 'Revertida', color: 'error' as const }
};

// Helper to get color based on difference amount
const getDifferenceColor = (difference: number): string => {
  if (difference === 0) return 'success.main';
  if (Math.abs(difference) > 1000) return 'error.main';
  return 'warning.main';
};

// ----------------------------------------------------------------------

export default function ReconciliationSummaryTab({ reconciliation }: Props) {
  const statusConfig = STATUS_CONFIG[reconciliation.status as keyof typeof STATUS_CONFIG] || {
    label: 'Desconocido',
    color: 'default' as const
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Card 1: Datos del Período */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Información del Período"
            avatar={<Iconify icon="solar:calendar-mark-bold-duotone" width={32} />}
          />
          <CardContent>
            <Stack spacing={2.5}>
              {/* Account */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Cuenta Bancaria
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:wallet-bold" width={20} sx={{ color: 'primary.main' }} />
                  <Typography variant="subtitle2">{reconciliation.bank_account?.name || 'N/A'}</Typography>
                  {reconciliation.bank_account?.code && (
                    <Chip label={reconciliation.bank_account.code} size="small" variant="outlined" />
                  )}
                </Stack>
                <Stack direction="row" spacing={1} sx={{ pl: 3.5 }}>
                  {reconciliation.bank_account?.account_number && (
                    <Typography variant="caption" color="text.secondary">
                      Cuenta: {reconciliation.bank_account.account_number}
                    </Typography>
                  )}
                  {reconciliation.bank_account?.currency && (
                    <Typography variant="caption" color="text.secondary">
                      · {reconciliation.bank_account.currency}
                    </Typography>
                  )}
                </Stack>
              </Stack>

              <Divider />

              {/* Period */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Período de Conciliación
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Iconify icon="solar:calendar-bold" width={20} sx={{ color: 'info.main' }} />
                  <Typography variant="body2">
                    {formatDate(reconciliation.period_start_date)} - {formatDate(reconciliation.period_end_date)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* Status */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Chip
                  label={statusConfig.label}
                  color={statusConfig.color}
                  size="medium"
                  sx={{ width: 'fit-content' }}
                />
              </Stack>

              {/* Notes */}
              {reconciliation.notes && (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Notas
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      {reconciliation.notes}
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 2: Saldos */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Saldos y Balance" avatar={<Iconify icon="solar:chart-2-bold-duotone" width={32} />} />
          <CardContent>
            <Stack spacing={2.5}>
              {/* Bank Balances */}
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:bank-bold" width={18} />
                  Saldos del Banco
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Saldo Inicial
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(reconciliation.bank_balance_start || 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Saldo Final
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(reconciliation.bank_balance_end || 0)}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* Book Balances */}
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:book-bold" width={18} />
                  Saldos en Libros (Tesorería)
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Saldo Inicial
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(reconciliation.book_balance_start || 0)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Saldo Final
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {reconciliation.book_balance_end ? fCurrency(reconciliation.book_balance_end) : 'Pendiente'}
                  </Typography>
                </Stack>
              </Stack>

              <Divider />

              {/* Difference */}
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:calculator-bold" width={18} />
                  Diferencia
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography
                    variant="h5"
                    sx={{
                      color: getDifferenceColor(reconciliation.balance_difference || 0)
                    }}
                  >
                    {fCurrency(reconciliation.balance_difference || 0)}
                  </Typography>
                  {reconciliation.is_balanced ? (
                    <Chip
                      label="Balanceada"
                      color="success"
                      size="small"
                      icon={<Iconify icon="solar:check-circle-bold" />}
                    />
                  ) : (
                    <Chip
                      label="Con Diferencia"
                      color="warning"
                      size="small"
                      icon={<Iconify icon="solar:danger-circle-bold" />}
                    />
                  )}
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 3: Progreso */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Progreso de Conciliación"
            avatar={<Iconify icon="solar:pie-chart-bold-duotone" width={32} />}
          />
          <CardContent>
            <Stack spacing={3}>
              {/* Progress Bar */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Avance</Typography>
                  <Typography variant="h6" color="primary.main">
                    {(reconciliation.reconciliation_percentage || 0).toFixed(1)}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={reconciliation.reconciliation_percentage || 0}
                  sx={{
                    height: 10,
                    borderRadius: 1,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1
                    }
                  }}
                />
              </Box>

              <Divider />

              {/* Lines Stats */}
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:document-text-bold" width={18} sx={{ color: 'info.main' }} />
                    <Typography variant="body2">Total de Líneas</Typography>
                  </Stack>
                  <Chip label={reconciliation.total_statement_lines || 0} size="small" />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:check-circle-bold" width={18} sx={{ color: 'success.main' }} />
                    <Typography variant="body2">Líneas Reconciliadas</Typography>
                  </Stack>
                  <Chip label={reconciliation.reconciled_lines || 0} color="success" size="small" />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon="solar:close-circle-bold" width={18} sx={{ color: 'warning.main' }} />
                    <Typography variant="body2">Líneas Sin Conciliar</Typography>
                  </Stack>
                  <Chip label={reconciliation.unreconciled_lines || 0} color="warning" size="small" />
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Card 4: Auditoría */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Información de Auditoría"
            avatar={<Iconify icon="solar:user-check-bold-duotone" width={32} />}
          />
          <CardContent>
            <Stack spacing={2.5}>
              {/* Created */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Creada
                </Typography>
                <Typography variant="body2">{formatDateTime(reconciliation.created_at)}</Typography>
                {reconciliation.created_by_user && (
                  <Typography variant="caption" color="text.secondary">
                    Por: {reconciliation.created_by_user.name}
                  </Typography>
                )}
              </Stack>

              {/* Completed */}
              {reconciliation.status === 'completed' && reconciliation.reconciled_at && (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Completada
                    </Typography>
                    <Typography variant="body2">{formatDateTime(reconciliation.reconciled_at)}</Typography>
                    {reconciliation.reconciled_by && (
                      <Typography variant="caption" color="text.secondary">
                        Por: {reconciliation.reconciled_by}
                      </Typography>
                    )}
                  </Stack>
                </>
              )}

              {/* Reversed */}
              {reconciliation.status === 'reversed' && reconciliation.reversed_at && (
                <>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Revertida
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      {formatDateTime(reconciliation.reversed_at)}
                    </Typography>
                    {reconciliation.reversed_by && (
                      <Typography variant="caption" color="text.secondary">
                        Por: {reconciliation.reversed_by}
                      </Typography>
                    )}
                    {reconciliation.reversal_reason && (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1 }}>
                        Motivo: {reconciliation.reversal_reason}
                      </Typography>
                    )}
                  </Stack>
                </>
              )}

              <Divider />

              {/* Last Update */}
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Última Actualización
                </Typography>
                <Typography variant="body2">{formatDateTime(reconciliation.updated_at)}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
