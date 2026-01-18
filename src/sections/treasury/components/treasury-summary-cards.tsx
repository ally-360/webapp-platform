import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { TreasuryAccount } from '../types';

// ----------------------------------------------------------------------

type Props = {
  accounts: TreasuryAccount[];
  isLoading?: boolean;
};

export default function TreasurySummaryCards({ accounts, isLoading }: Props) {
  // Filter only active accounts
  const activeAccounts = accounts.filter((acc) => acc.is_active);

  // Calculate totals
  const cashTotal = activeAccounts
    .filter((acc) => acc.type === 'cash')
    .reduce((sum, acc) => sum + parseFloat(acc.current_balance || '0'), 0);

  const bankTotal = activeAccounts
    .filter((acc) => acc.type === 'bank')
    .reduce((sum, acc) => sum + parseFloat(acc.current_balance || '0'), 0);

  const posTotal = activeAccounts
    .filter((acc) => acc.type === 'pos')
    .reduce((sum, acc) => sum + parseFloat(acc.current_balance || '0'), 0);

  const globalTotal = cashTotal + bankTotal + posTotal;

  if (isLoading) {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
        {[...Array(4)].map((_, index) => (
          <Card key={index} sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: 100 }}>
                <Typography variant="body2" color="text.disabled">
                  Cargando...
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 4 }}>
      {/* Total en Caja */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'success.lighter'
              }}
            >
              <Iconify icon="solar:wallet-bold-duotone" width={32} sx={{ color: 'success.main' }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total en Caja
              </Typography>
              <Typography variant="h4">{fCurrency(cashTotal)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {activeAccounts.filter((acc) => acc.type === 'cash').length} cuenta(s)
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Total en Bancos */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'info.lighter'
              }}
            >
              <Iconify icon="solar:bank-bold-duotone" width={32} sx={{ color: 'info.main' }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total en Bancos
              </Typography>
              <Typography variant="h4">{fCurrency(bankTotal)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {activeAccounts.filter((acc) => acc.type === 'bank').length} cuenta(s)
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Total en POS */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'warning.lighter'
              }}
            >
              <Iconify icon="solar:card-bold-duotone" width={32} sx={{ color: 'warning.main' }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total en POS
              </Typography>
              <Typography variant="h4">{fCurrency(posTotal)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {activeAccounts.filter((acc) => acc.type === 'pos').length} cuenta(s)
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Total Global */}
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter'
              }}
            >
              <Iconify icon="solar:money-bag-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Total General
              </Typography>
              <Typography variant="h4" color="primary.main">
                {fCurrency(globalTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeAccounts.length} cuenta(s) activas
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
