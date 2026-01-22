import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Button,
  Chip,
  Stack,
  Box
} from '@mui/material';
/* eslint-disable import/no-duplicates */
/* eslint-disable prettier/prettier */
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import { useRouter } from 'src/routes/hook/use-router';
import { paths } from 'src/routes/paths';

import type { TreasuryMovement, SourceModule } from '../types';

// ----------------------------------------------------------------------

type Props = {
  movements: TreasuryMovement[];
  reconciliationId: string;
  canMatch?: boolean;
};

// ----------------------------------------------------------------------

const getSourceModuleLabel = (module: SourceModule): string => {
  const labels: Record<SourceModule, string> = {
    pos: 'POS',
    payment: 'Pago Recibido',
    customer_advance: 'Anticipo Cliente',
    bill_payment: 'Pago a Proveedor',
    debit_note: 'Nota Débito',
    credit_note: 'Nota Crédito',
    adjustment: 'Ajuste',
    transfer: 'Transferencia',
    opening_balance: 'Saldo Inicial',
    closing_balance: 'Saldo Final',
  };
  return labels[module] || module;
};

const getSourceModuleColor = (
  module: SourceModule
): 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' => {
  const colors: Record<
    SourceModule,
    'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
  > = {
    pos: 'primary',
    payment: 'success',
    customer_advance: 'info',
    bill_payment: 'warning',
    debit_note: 'error',
    credit_note: 'success',
    adjustment: 'warning',
    transfer: 'secondary',
    opening_balance: 'default',
    closing_balance: 'default',
  };
  return colors[module] || 'default';
};

// ----------------------------------------------------------------------

export default function UnmatchedMovementsTable({
  movements,
  reconciliationId,
  canMatch = false,
}: Props) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const displayMovements = showAll ? movements : movements.slice(0, 10);
  const hasMore = movements.length > 10;

  const handleGoToMatch = () => {
    router.push(
      `${paths.dashboard.treasury.reconciliationDetails(reconciliationId)}?step=manual-match`
    );
  };

  if (!movements || movements.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Movimientos Internos Sin Conciliar"
          action={
            <Chip
              label="Todos conciliados"
              color="success"
              size="small"
              icon={<Iconify icon="eva:checkmark-circle-2-fill" width={18} />}
            />
          }
        />
        <CardContent>
          <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
            <Iconify
              icon="eva:checkmark-circle-2-fill"
              width={48}
              sx={{ color: 'success.main', opacity: 0.48 }}
            />
            <Typography variant="body2" color="text.secondary">
              ¡Excelente! Todos los movimientos internos han sido conciliados
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Movimientos Internos Sin Conciliar"
        subheader={`${movements.length} ${
          movements.length === 1 ? 'movimiento pendiente' : 'movimientos pendientes'
        }`}
        action={
          canMatch && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Iconify icon="solar:hand-stars-bold-duotone" />}
              onClick={handleGoToMatch}
            >
              Ir a Conciliar
            </Button>
          )
        }
      />
      <CardContent>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayMovements.map((movement) => {
                const amount = parseFloat(movement.amount);
                const isInflow = movement.movement_type === 'inflow';

                return (
                  <TableRow key={movement.id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ minWidth: 100 }}>
                        {format(new Date(movement.movement_date), 'dd MMM yyyy', { locale: es })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isInflow ? 'Ingreso' : 'Egreso'}
                        size="small"
                        color={isInflow ? 'success' : 'error'}
                        icon={
                          <Iconify
                            icon={isInflow ? 'solar:arrow-down-bold' : 'solar:arrow-up-bold'}
                            width={16}
                          />
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getSourceModuleLabel(movement.source_module)}
                        size="small"
                        color={getSourceModuleColor(movement.source_module)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 120 }}
                      >
                        {movement.source_reference || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        color={isInflow ? 'success.main' : 'error.main'}
                      >
                        {fCurrency(amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>

        {hasMore && (
          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Button variant="text" size="small" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Ver menos' : `Ver todos (${movements.length})`}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
