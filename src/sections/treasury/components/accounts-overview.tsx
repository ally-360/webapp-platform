import { Card, CardHeader, CardContent, Stack, Typography, Chip, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Utils
import { fCurrency } from 'src/utils/format-number';

// Components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';

// Routes
import { paths } from 'src/routes/paths';

// Types
import type { TreasuryAccount } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

type Props = {
  accounts: TreasuryAccount[];
  isLoading?: boolean;
};

// ----------------------------------------------------------------------

export default function AccountsOverview({ accounts, isLoading }: Props) {
  const navigate = useNavigate();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return 'solar:wallet-bold-duotone';
      case 'bank':
        return 'solar:card-bold-duotone';
      case 'pos':
        return 'solar:calculator-minimalistic-bold-duotone';
      default:
        return 'solar:dollar-bold-duotone';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Efectivo';
      case 'bank':
        return 'Banco';
      case 'pos':
        return 'POS';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (type) {
      case 'cash':
        return 'success';
      case 'bank':
        return 'info';
      case 'pos':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Cuentas Activas" subheader="Vista general de cuentas" />
        <CardContent>
          <Stack spacing={2}>
            {[...Array(3)].map((_, index) => (
              <Stack
                key={index}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.neutral'
                }}
              >
                <Typography variant="body2" color="text.disabled">
                  Cargando...
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader title="Cuentas Activas" subheader="Vista general de cuentas" />
        <CardContent>
          <EmptyContent
            filled
            title="No hay cuentas activas"
            description="Crea tu primera cuenta de tesorería para comenzar"
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => navigate(paths.dashboard.treasury.accounts)}
              >
                Crear Cuenta
              </Button>
            }
            sx={{ py: 5 }}
          />
        </CardContent>
      </Card>
    );
  }

  const handleViewAll = () => {
    navigate(paths.dashboard.treasury.accounts);
  };

  return (
    <Card>
      <CardHeader
        title="Cuentas Activas"
        subheader={`${accounts.length} cuenta${accounts.length !== 1 ? 's' : ''} activa${
          accounts.length !== 1 ? 's' : ''
        }`}
        action={
          <Chip
            size="small"
            label="Ver todas"
            color="primary"
            variant="outlined"
            onClick={handleViewAll}
            clickable
            icon={<Iconify icon="solar:arrow-right-bold" width={16} />}
          />
        }
      />

      <CardContent>
        <Stack spacing={2}>
          {accounts.slice(0, 6).map((account) => {
            const balance = parseFloat(account.current_balance);
            const isNegative = balance < 0;

            return (
              <Stack
                key={account.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => navigate(`${paths.dashboard.treasury.accounts}?accountId=${account.id}`)}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      borderRadius: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'background.paper',
                      color: `${getTypeColor(account.type)}.main`
                    }}
                  >
                    <Iconify icon={getTypeIcon(account.type)} width={24} />
                  </Box>

                  <Stack spacing={0.5} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{account.name}</Typography>
                    {account.code && (
                      <Typography variant="caption" color="text.secondary">
                        Código: {account.code}
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                <Stack alignItems="flex-end" spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={600} color={isNegative ? 'error.main' : 'text.primary'}>
                    {fCurrency(balance)}
                  </Typography>

                  <Chip
                    size="small"
                    label={getTypeLabel(account.type)}
                    color={getTypeColor(account.type)}
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
