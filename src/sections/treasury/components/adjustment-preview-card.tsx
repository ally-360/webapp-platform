import { Card, CardHeader, CardContent, Stack, Typography, Alert, AlertTitle, Box } from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { fCurrency } from 'src/utils/format-number';
import Iconify from 'src/components/iconify';
import type { BankReconciliation } from 'src/sections/treasury/types';

interface AdjustmentPreviewCardProps {
  reconciliation: BankReconciliation;
}

export default function AdjustmentPreviewCard({ reconciliation }: AdjustmentPreviewCardProps) {
  const {
    balance_difference,
    is_balanced,
    period_start_date,
    period_end_date,
    bank_account,
    status,
    adjustment_journal_entry_id,
  } = reconciliation;

  const balanceDiff = parseFloat(balance_difference?.toString() || '0');
  const hasDifference = Math.abs(balanceDiff) > 0.01;

  // Don't show if balanced or no difference
  if (is_balanced || !hasDifference) {
    return null;
  }

  const isCompleted = status === 'completed';
  const adjustmentExists = !!adjustment_journal_entry_id;

  return (
    <Card sx={{ bgcolor: 'warning.lighter', borderColor: 'warning.main', border: 1 }}>
      <CardHeader
        avatar={
          <Iconify
            icon="solar:document-add-bold-duotone"
            width={24}
            sx={{ color: 'warning.dark' }}
          />
        }
        title={
          <Typography variant="subtitle1" color="warning.dark" fontWeight={600}>
            {isCompleted && adjustmentExists
              ? 'Ajuste Contable Generado'
              : 'Ajuste Contable Requerido'}
          </Typography>
        }
      />

      <CardContent>
        <Stack spacing={2}>
          {/* Alert Message */}
          <Alert severity="warning" icon={false}>
            <AlertTitle sx={{ fontWeight: 600 }}>
              {isCompleted && adjustmentExists
                ? 'Se ha generado un asiento de ajuste automáticamente'
                : 'Se generará un asiento de ajuste automáticamente'}
            </AlertTitle>
            <Typography variant="body2">
              Existe una diferencia entre el saldo bancario y el saldo en libros. Al completar la
              conciliación, se creará un asiento contable automático para registrar este ajuste.
            </Typography>
          </Alert>

          {/* Adjustment Details */}
          <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'background.paper' }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Monto del ajuste:
                </Typography>
                <Typography variant="h5" color="warning.dark" fontWeight={700}>
                  {fCurrency(Math.abs(balanceDiff))}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Cuenta bancaria:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {bank_account?.name || 'N/A'}
                </Typography>
              </Stack>

              {bank_account?.account_number && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    No. de cuenta:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {bank_account.account_number}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Período:
                </Typography>
                <Typography variant="body2">
                  {format(new Date(period_start_date), 'dd MMM', { locale: es })} -{' '}
                  {format(new Date(period_end_date), 'dd MMM yyyy', { locale: es })}
                </Typography>
              </Stack>

              {adjustmentExists && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    ID del asiento:
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace" color="primary.main">
                    {adjustment_journal_entry_id}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Additional Info */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="flex-start"
            sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral' }}
          >
            <Iconify icon="eva:info-fill" width={20} sx={{ color: 'info.main', mt: 0.2 }} />
            <Typography variant="caption" color="text.secondary">
              El ajuste se registrará en la cuenta contable configurada para ajustes de conciliación
              bancaria. Este asiento será parte del cierre del período contable.
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
