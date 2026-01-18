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
  Box,
  Tooltip
} from '@mui/material';
import Iconify from 'src/components/iconify';
import { fCurrency } from 'src/utils/format-number';
import type { TreasuryAccount, TreasuryAccountType } from '../types';

// ----------------------------------------------------------------------

type Props = {
  accounts: TreasuryAccount[];
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

export default function TreasuryAccountsTable({ accounts, onEdit, onView }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Apply filters
  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && account.is_active) ||
      (statusFilter === 'inactive' && !account.is_active);

    return matchesSearch && matchesStatus;
  });

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
              <TableCell>Tipo</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Moneda</TableCell>
              <TableCell align="right">Saldo Actual</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredAccounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron cuentas
                  </Typography>
                </TableCell>
              </TableRow>
            )}

            {filteredAccounts.map((account) => (
              <TableRow key={account.id} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2">{account.name}</Typography>
                    {account.description && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {account.description}
                      </Typography>
                    )}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={ACCOUNT_TYPE_LABELS[account.type]}
                    color={ACCOUNT_TYPE_COLORS[account.type]}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{account.code || '-'}</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{account.currency}</Typography>
                </TableCell>

                <TableCell align="right">
                  <Typography variant="subtitle2" color="primary.main">
                    {fCurrency(parseFloat(account.current_balance))}
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

      {/* Results count */}
      {filteredAccounts.length > 0 && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredAccounts.length} de {accounts.length} cuenta(s)
          </Typography>
        </Box>
      )}
    </Card>
  );
}
