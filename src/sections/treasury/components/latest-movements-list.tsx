import { Card, CardHeader, CardContent, Stack, Typography, Box, Chip } from '@mui/material';
/* eslint-disable import/no-duplicates */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Utils
import { fCurrency } from 'src/utils/format-number';

// Components
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';

// Types
import type { TreasuryMovement, TreasuryAccount } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

type Props = {
  movements: TreasuryMovement[];
  accounts: TreasuryAccount[];
  isLoading?: boolean;
};

// ----------------------------------------------------------------------

export default function LatestMovementsList({ movements, accounts, isLoading }: Props) {
  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account?.name || 'Cuenta desconocida';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Últimos Movimientos" subheader="Actividad reciente" />
        <CardContent>
          <Stack spacing={2}>
            {[...Array(5)].map((_, index) => (
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

  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader title="Últimos Movimientos" subheader="Actividad reciente" />
        <CardContent>
          <EmptyContent
            filled
            title="No hay movimientos recientes"
            description="Los movimientos aparecerán aquí una vez que se registren"
            sx={{ py: 5 }}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Últimos Movimientos"
        subheader={`${movements.length} movimientos recientes`}
        action={
          <Chip
            size="small"
            label="Últimos 5"
            color="default"
            variant="outlined"
            icon={<Iconify icon="solar:clock-circle-bold" width={16} />}
          />
        }
      />

      <CardContent>
        <Stack spacing={2}>
          {movements.slice(0, 5).map((movement) => (
            <Stack
              key={movement.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
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
                    bgcolor: movement.movement_type === 'inflow' ? 'success.lighter' : 'error.lighter',
                    color: movement.movement_type === 'inflow' ? 'success.main' : 'error.main'
                  }}
                >
                  <Iconify
                    icon={movement.movement_type === 'inflow' ? 'solar:arrow-down-bold' : 'solar:arrow-up-bold'}
                    width={24}
                  />
                </Box>

                <Stack spacing={0.5} sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{getAccountName(movement.treasury_account_id)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {movement.description || 'Sin descripción'}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {format(new Date(movement.movement_date), "dd MMM yyyy 'a las' HH:mm", {
                      locale: es
                    })}
                  </Typography>
                </Stack>
              </Stack>

              <Stack alignItems="flex-end" spacing={0.5}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color={movement.movement_type === 'inflow' ? 'success.main' : 'error.main'}
                >
                  {movement.movement_type === 'inflow' ? '+' : '-'} {fCurrency(parseFloat(movement.amount))}
                </Typography>

                <Chip
                  size="small"
                  label={movement.movement_type === 'inflow' ? 'Entrada' : 'Salida'}
                  color={movement.movement_type === 'inflow' ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ height: 20 }}
                />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
