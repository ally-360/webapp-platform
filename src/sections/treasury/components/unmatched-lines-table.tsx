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

import type { BankStatementLine } from '../types';

// ----------------------------------------------------------------------

type Props = {
  lines: BankStatementLine[];
  reconciliationId: string;
  canMatch?: boolean;
};

// ----------------------------------------------------------------------

export default function UnmatchedLinesTable({ lines, reconciliationId, canMatch = false }: Props) {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const displayLines = showAll ? lines : lines.slice(0, 10);
  const hasMore = lines.length > 10;

  const handleGoToMatch = () => {
    router.push(
      `${paths.dashboard.treasury.reconciliationDetails(reconciliationId)}?step=manual-match`
    );
  };

  if (!lines || lines.length === 0) {
    return (
      <Card>
        <CardHeader
          title="Líneas del Extracto Sin Conciliar"
          action={
            <Chip
              label="Todas conciliadas"
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
              ¡Excelente! Todas las líneas del extracto han sido conciliadas
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Líneas del Extracto Sin Conciliar"
        subheader={`${lines.length} ${
          lines.length === 1 ? 'línea pendiente' : 'líneas pendientes'
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
                <TableCell>Descripción</TableCell>
                <TableCell>Referencia</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="right">Saldo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayLines.map((line) => {
                const debit = parseFloat(line.debit || '0');
                const credit = parseFloat(line.credit || '0');
                const amount = debit - credit;
                const balance = line.balance ? parseFloat(line.balance) : null;

                return (
                  <TableRow key={line.id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ minWidth: 100 }}>
                        {format(new Date(line.statement_date), 'dd MMM yyyy', { locale: es })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 280 }}>
                        {line.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 120 }}
                      >
                        {line.reference || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        color={amount >= 0 ? 'success.main' : 'error.main'}
                      >
                        {fCurrency(Math.abs(amount))}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {amount >= 0 ? 'Ingreso' : 'Egreso'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {balance !== null ? fCurrency(balance) : '-'}
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
              {showAll ? 'Ver menos' : `Ver todas (${lines.length})`}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
