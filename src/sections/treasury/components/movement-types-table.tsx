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
  Stack
} from '@mui/material';

import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';

import type { ReconciliationMovementSummary } from '../types';

// ----------------------------------------------------------------------

type Props = {
  movements: ReconciliationMovementSummary[];
};

// ----------------------------------------------------------------------

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    auto: 'Conciliación Automática',
    manual: 'Conciliación Manual',
    adjustment: 'Ajuste Contable',
    IN: 'Ingresos',
    OUT: 'Egresos'
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    auto: 'solar:magic-stick-bold-duotone',
    manual: 'solar:hand-stars-bold-duotone',
    adjustment: 'solar:document-add-bold-duotone',
    IN: 'solar:arrow-down-bold-duotone',
    OUT: 'solar:arrow-up-bold-duotone'
  };
  return icons[type] || 'solar:list-check-bold-duotone';
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    auto: 'primary.main',
    manual: 'secondary.main',
    adjustment: 'warning.main',
    IN: 'success.main',
    OUT: 'error.main'
  };
  return colors[type] || 'text.primary';
};

// ----------------------------------------------------------------------

export default function MovementTypesTable({ movements }: Props) {
  if (!movements || movements.length === 0) {
    return (
      <Card>
        <CardHeader title="Resumen por Tipo" />
        <CardContent>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
            No hay información de tipos de movimiento disponible
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const hasAmounts = movements.some((m) => m.total_amount !== undefined);

  return (
    <Card>
      <CardHeader title="Resumen por Tipo de Movimiento" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              {hasAmounts && <TableCell align="right">Monto Total</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.type} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon={getTypeIcon(movement.type)} width={20} sx={{ color: getTypeColor(movement.type) }} />
                    <Typography variant="body2">{getTypeLabel(movement.type)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2">{movement.count}</Typography>
                </TableCell>
                {hasAmounts && (
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {movement.total_amount ? fCurrency(parseFloat(movement.total_amount)) : 'N/D'}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
