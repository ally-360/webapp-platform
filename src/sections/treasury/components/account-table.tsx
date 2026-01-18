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
  Badge
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { TreasuryAccount, TreasuryAccountType } from '../types';

// ----------------------------------------------------------------------

type Props = {
  accounts: TreasuryAccount[];
  isLoading?: boolean;
  onEdit: (account: TreasuryAccount) => void;
  onView: (account: TreasuryAccount) => void;
};

const ACCOUNT_TYPE_LABELS: Record<TreasuryAccountType, string> = {
  cash: 'Caja',
  bank: 'Banco',
  pos: 'POS'
};

const ACCOUNT_TYPE_COLORS: Record<TreasuryAccountType, any> = {
  cash: 'success',
  bank: 'info',
  pos: 'warning'
};

export default function AccountTable({ accounts, isLoading, onEdit, onView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TreasuryAccountType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Apply filters
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || account.type === typeFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && account.is_active) ||
      (statusFilter === 'inactive' && !account.is_active);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Paginate
  const paginatedAccounts = filteredAccounts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Card>
      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 3, pb: 2 }} alignItems="center">
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por nombre o código..."
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
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">Todos los tipos</MenuItem>
          <MenuItem value="cash">Caja</MenuItem>
          <MenuItem value="bank">Banco</MenuItem>
          <MenuItem value="pos">POS</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="active">Activos</MenuItem>
          <MenuItem value="inactive">Inactivos</MenuItem>
        </TextField>
      </Stack>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Cuenta Contable</TableCell>
              <TableCell align="right">Saldo Actual</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <Stack spacing={2} alignItems="center">
                    <Iconify icon="svg-spinners:blocks-shuffle-3" width={48} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando cuentas...
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && paginatedAccounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <Stack spacing={2} alignItems="center">
                    <Iconify icon="solar:inbox-line-bold-duotone" width={64} sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                        ? 'No se encontraron cuentas con los filtros aplicados'
                        : 'No hay cuentas de tesorería registradas'}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginatedAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">{account.name}</Typography>
                      {account.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 300 }} noWrap>
                          {account.description}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {account.code || '-'}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={ACCOUNT_TYPE_LABELS[account.type]}
                      color={ACCOUNT_TYPE_COLORS[account.type]}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    {account.accounting_account_id ? (
                      <Badge
                        badgeContent={
                          <Iconify
                            icon="solar:link-circle-bold"
                            width={14}
                            sx={{ color: 'success.main', bgcolor: 'white', borderRadius: '50%' }}
                          />
                        }
                      >
                        <Chip label="Cuenta vinculada" size="small" variant="outlined" color="success" />
                      </Badge>
                    ) : (
                      <Chip label="Sin vincular" size="small" variant="outlined" color="warning" />
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Typography
                      variant="subtitle2"
                      color={parseFloat(account.current_balance) < 0 ? 'error.main' : 'primary.main'}
                    >
                      {fCurrency(parseFloat(account.current_balance))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.currency}
                    </Typography>
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={account.is_active ? 'Activo' : 'Inactivo'}
                      color={account.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => onView(account)}>
                          <Iconify icon="solar:eye-bold" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => onEdit(account)}>
                          <Iconify icon="solar:pen-bold" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!isLoading && filteredAccounts.length > 0 && (
        <TablePagination
          component="div"
          count={filteredAccounts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Card>
  );
}
