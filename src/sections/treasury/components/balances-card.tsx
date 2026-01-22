import { Card, CardHeader, CardContent, Grid, Stack, Typography, Chip, Divider } from '@mui/material';
import { fCurrency } from 'src/utils/format-number';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import type { BankReconciliation } from 'src/sections/treasury/types';

interface BalancesCardProps {
  reconciliation: BankReconciliation;
}

export default function BalancesCard({ reconciliation }: BalancesCardProps) {
  const {
    period_start_date,
    period_end_date,
    bank_balance_start,
    bank_balance_end,
    book_balance_start,
    book_balance_end,
    balance_difference,
    is_balanced,
  } = reconciliation;

  const balanceDiff = parseFloat(balance_difference?.toString() || '0');
  const isDifferent = Math.abs(balanceDiff) > 0.01;

  return (
    <Card>
      <CardHeader
        avatar={
          <Iconify
            icon="solar:balance-bold-duotone"
            width={24}
            sx={{ color: is_balanced ? 'success.main' : 'warning.main' }}
          />
        }
        title="Balances"
        subheader={`${format(new Date(period_start_date), 'dd MMM', { locale: es })} - ${format(
          new Date(period_end_date),
          'dd MMM yyyy',
          { locale: es }
        )}`}
        action={
          <Chip
            size="small"
            label={is_balanced ? 'Balanceado' : 'Con diferencia'}
            color={is_balanced ? 'success' : 'warning'}
          />
        }
      />

      <CardContent>
        <Grid container spacing={3}>
          {/* Bank Balance */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary">
                Saldo Bancario
              </Typography>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Saldo inicial:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fCurrency(parseFloat(bank_balance_start || '0'))}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Saldo final:
                </Typography>
                <Typography variant="h6" color="info.main">
                  {fCurrency(parseFloat(bank_balance_end || '0'))}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Book Balance */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary">
                Saldo en Libros
              </Typography>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Saldo inicial:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {fCurrency(parseFloat(book_balance_start || '0'))}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Saldo final:
                </Typography>
                <Typography variant="h6" color="success.main">
                  {fCurrency(parseFloat(book_balance_end || '0'))}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Difference */}
          {isDifferent && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: is_balanced ? 'success.lighter' : 'warning.lighter',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Iconify
                      icon={is_balanced ? 'eva:checkmark-circle-2-fill' : 'eva:alert-triangle-fill'}
                      width={20}
                      sx={{ color: is_balanced ? 'success.main' : 'warning.main' }}
                    />
                    <Typography variant="subtitle2">Diferencia:</Typography>
                  </Stack>

                  <Typography
                    variant="h5"
                    color={is_balanced ? 'success.dark' : 'warning.dark'}
                    fontWeight={700}
                  >
                    {fCurrency(Math.abs(balanceDiff))}
                  </Typography>
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
