/* eslint-disable import/no-duplicates */

import { useState } from 'react';
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
  TablePagination,
  Box
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { TreasuryMovement, MovementType, SourceModule } from '../types';

// ----------------------------------------------------------------------

type Props = {
  movements: TreasuryMovement[];
  accounts: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  onVoid: (movement: TreasuryMovement) => void;
};

const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  inflow: 'Entrada',
  outflow: 'Salida'
};

const MOVEMENT_TYPE_COLORS: Record<MovementType, 'success' | 'error'> = {
  inflow: 'success',
  outflow: 'error'
};

const SOURCE_MODULE_LABELS: Record<SourceModule, string> = {
  pos: 'POS',
  payment: 'Pago',
  customer_advance: 'Anticipo Cliente',
  bill_payment: 'Pago Proveedor',
  debit_note: 'Nota Débito',
  credit_note: 'Nota Crédito',
  adjustment: 'Ajuste',
  transfer: 'Transferencia',
  opening_balance: 'Saldo Inicial',
  closing_balance: 'Cierre'
};

export default function MovementTable({ movements, accounts, isLoading, onVoid }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MovementType>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'reversed'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Apply filters
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      movement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.source_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || movement.movement_type === typeFilter;

    const matchesAccount = accountFilter === 'all' || movement.treasury_account_id === accountFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !movement.is_reversed) ||
      (statusFilter === 'reversed' && movement.is_reversed);

    return matchesSearch && matchesType && matchesAccount && matchesStatus;
  });

  // Paginate
  const paginatedMovements = filteredMovements.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSystemGenerated = (movement: TreasuryMovement) =>
    ['pos', 'payment', 'bill_payment', 'customer_advance'].includes(movement.source_module);

  return (
    <Card>
      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3, pb: 2 }} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por descripción o referencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="solar:magnifer-linear" />
              </InputAdornment>
            )
          }}
        />

        <TextField
          select
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="inflow">Entradas</MenuItem>
          <MenuItem value="outflow">Salidas</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          value={accountFilter}
          onChange={(e) => setAccountFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">Todas las cuentas</MenuItem>
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="active">Activos</MenuItem>
          <MenuItem value="reversed">Anulados</MenuItem>
        </TextField>
      </Stack>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cuenta</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                  <Stack spacing={2} alignItems="center">
                    <Iconify icon="svg-spinners:blocks-shuffle-3" width={48} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando movimientos...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && paginatedMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                  <Stack spacing={2} alignItems="center">
                    <Iconify icon="solar:inbox-line-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || typeFilter !== 'all' || accountFilter !== 'all' || statusFilter !== 'all'
                        ? 'No se encontraron movimientos con los filtros aplicados'
                        : 'No hay movimientos registrados'}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginatedMovements.map((movement) => {
                const account = accounts.find((a) => a.id === movement.treasury_account_id);
                const isSystemMov = isSystemGenerated(movement);

                return (
                  <TableRow key={movement.id} hover sx={{ opacity: movement.is_reversed ? 0.5 : 1 }}>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(movement.movement_date), 'dd/MM/yyyy', { locale: es })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(movement.created_at), 'HH:mm', { locale: es })}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={MOVEMENT_TYPE_LABELS[movement.movement_type]}
                        color={MOVEMENT_TYPE_COLORS[movement.movement_type]}
                        size="small"
                        icon={
                          <Iconify
                            icon={movement.movement_type === 'inflow' ? 'solar:arrow-down-bold' : 'solar:arrow-up-bold'}
                          />
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                        {account?.name || '-'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="subtitle2"
                        color={movement.movement_type === 'inflow' ? 'success.main' : 'error.main'}
                        fontWeight={600}
                      >
                        {movement.movement_type === 'inflow' ? '+' : '-'} {fCurrency(parseFloat(movement.amount))}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {isSystemMov && (
                          <Tooltip title="Movimiento generado automáticamente">
                            <Box>
                              <Iconify icon="solar:lock-keyhole-bold" width={16} sx={{ color: 'warning.main' }} />
                            </Box>
                          </Tooltip>
                        )}
                        <Chip label={SOURCE_MODULE_LABELS[movement.source_module]} size="small" variant="outlined" />
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 250 }}>
                          {movement.description || '-'}
                        </Typography>
                        {movement.source_reference && (
                          <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            Ref: {movement.source_reference}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      {movement.is_reversed ? (
                        <Tooltip title={`Anulado: ${movement.reversal_reason || 'Sin motivo'}`}>
                          <Chip label="Anulado" color="error" size="small" />
                        </Tooltip>
                      ) : (
                        <Chip label="Activo" color="success" size="small" />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {!movement.is_reversed && !isSystemMov && (
                          <Tooltip title="Anular movimiento">
                            <IconButton size="small" color="error" onClick={() => onVoid(movement)}>
                              <Iconify icon="solar:close-circle-bold" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {isSystemMov && (
                          <Tooltip title="Este movimiento está protegido y no puede anularse manualmente">
                            <Box>
                              <IconButton size="small" disabled>
                                <Iconify icon="solar:lock-keyhole-bold" />
                              </IconButton>
                            </Box>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!isLoading && filteredMovements.length > 0 && (
        <TablePagination
          component="div"
          count={filteredMovements.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Card>
  );
}
