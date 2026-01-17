import React, { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetAccountsQuery } from 'src/redux/services/accountingApi';
import { AccountDetailDrawer } from 'src/sections/accounting/components/AccountDetailDrawer';
import { AccountFormDialog } from 'src/sections/accounting/components/AccountFormDialog';
import { AccountDeleteDialog } from 'src/sections/accounting/components/AccountDeleteDialog';
import type { AccountingAccount, AccountType } from 'src/sections/accounting/types';

const accountTypeLabels: Record<AccountType, string> = {
  asset: 'Activo',
  liability: 'Pasivo',
  equity: 'Patrimonio',
  income: 'Ingreso',
  expense: 'Gasto'
};

const accountTypeColors: Record<AccountType, any> = {
  asset: 'info',
  liability: 'warning',
  equity: 'secondary',
  income: 'success',
  expense: 'error'
};

function ChartOfAccountsPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchText, setSearchText] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AccountType | ''>('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountingAccount | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<AccountingAccount | null>(null);

  // Fetch accounts from backend
  const { data, isLoading, error } = useGetAccountsQuery({
    limit: 500,
    ...(searchText && { search: searchText }),
    ...(activeFilter && { account_type: activeFilter })
  });

  const accounts = useMemo(() => data?.accounts || [], [data]);

  // Build tree structure
  const accountTree = useMemo(() => {
    const byId = new Map<string, AccountingAccount>();
    const children = new Map<string, AccountingAccount[]>();

    accounts.forEach((acc) => {
      byId.set(acc.id, acc);
      if (acc.parent_id) {
        const siblings = children.get(acc.parent_id) || [];
        siblings.push(acc);
        children.set(acc.parent_id, siblings);
      }
    });

    // Sort children by code
    children.forEach((list) => {
      list.sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));
    });

    return { byId, children };
  }, [accounts]);

  // Flatten tree for DataGrid with expansion
  type VisibleRow = AccountingAccount & { __depth: number };

  const visibleRows = useMemo(() => {
    const result: VisibleRow[] = [];

    function pushWithTree(acc: AccountingAccount, depth = 0) {
      result.push({ ...acc, __depth: depth });
      const isExpanded = expanded[acc.id];
      if (isExpanded) {
        const childList = accountTree.children.get(acc.id) || [];
        childList.forEach((child) => pushWithTree(child, depth + 1));
      }
    }

    // Root accounts (no parent)
    const roots = accounts.filter((acc) => !acc.parent_id);
    roots.sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));
    roots.forEach((root) => pushWithTree(root));

    return result;
  }, [accounts, accountTree, expanded]);

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    accounts.forEach((acc) => {
      if (accountTree.children.has(acc.id)) {
        all[acc.id] = true;
      }
    });
    setExpanded(all);
  };

  const handleCollapseAll = () => setExpanded({});

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountId(accountId);
    setDetailDrawerOpen(true);
  };

  const handleCreateAccount = () => {
    setEditingAccount(null);
    setFormDialogOpen(true);
  };

  const handleEditAccount = (account: AccountingAccount) => {
    setEditingAccount(account);
    setFormDialogOpen(true);
  };

  const handleDeleteAccount = (account: AccountingAccount) => {
    setDeletingAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingAccount(null);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setDeletingAccount(null);
  };

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'code',
        headerName: 'Código',
        width: 160,
        sortable: false
      },
      {
        field: 'name',
        headerName: 'Nombre',
        flex: 1,
        minWidth: 300,
        sortable: false,
        renderCell: (params) => {
          const node = params.row as VisibleRow;
          const depth = node.__depth || 0;
          const hasChildren = accountTree.children.has(node.id);

          return (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ width: '100%', pl: depth * 2, cursor: 'pointer' }}
              onClick={() => handleAccountClick(node.id)}
            >
              {hasChildren && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => ({ ...prev, [node.id]: !prev[node.id] }));
                  }}
                >
                  <Icon icon={expanded[node.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'} />
                </IconButton>
              )}
              {!hasChildren && <Box sx={{ width: 28 }} />}
              <Typography variant="body2">{node.name}</Typography>
            </Stack>
          );
        }
      },
      {
        field: 'account_type',
        headerName: 'Tipo',
        width: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip
            label={accountTypeLabels[row.account_type as AccountType]}
            color={accountTypeColors[row.account_type as AccountType]}
            size="small"
            variant="filled"
          />
        )
      },
      {
        field: 'nature',
        headerName: 'Naturaleza',
        width: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip
            label={row.nature === 'debit' ? 'Débito' : 'Crédito'}
            color={row.nature === 'debit' ? 'info' : 'success'}
            size="small"
            variant="outlined"
          />
        )
      },
      {
        field: 'is_active',
        headerName: 'Estado',
        width: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip
            label={row.is_active ? 'ACTIVA' : 'INACTIVA'}
            color={row.is_active ? 'success' : 'default'}
            size="small"
          />
        )
      },
      {
        field: 'flags',
        headerName: 'Propiedades',
        flex: 1,
        minWidth: 200,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.use === 'movement' && <Chip size="small" label="Movimiento" variant="outlined" />}
            {row.accepts_third_party && <Chip size="small" label="Tercero" variant="outlined" />}
            {row.behavior !== 'NONE' && <Chip size="small" label={row.behavior} color="primary" variant="filled" />}
          </Stack>
        )
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditAccount(row);
                }}
                disabled={row.is_system}
              >
                <Icon icon="mdi:pencil" />
              </IconButton>
            </Tooltip>
            <Tooltip title={row.is_system ? 'Cuenta de sistema' : 'Eliminar'}>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAccount(row);
                  }}
                  disabled={row.is_system}
                >
                  <Icon icon="mdi:delete" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [accountTree, expanded]
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error al cargar el catálogo de cuentas</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Catálogo de Cuentas (PUC)</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Expandir todo">
            <IconButton onClick={handleExpandAll}>
              <Icon icon="mdi:arrow-expand-vertical" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Colapsar todo">
            <IconButton onClick={handleCollapseAll}>
              <Icon icon="mdi:arrow-collapse-vertical" />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={handleCreateAccount} sx={{ ml: 2 }}>
            Crear cuenta
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Buscar por código o nombre..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <Icon icon="mdi:magnify" style={{ marginRight: 8 }} />
              }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label="Todos"
                color={activeFilter === '' ? 'primary' : 'default'}
                onClick={() => setActiveFilter('')}
                variant={activeFilter === '' ? 'filled' : 'outlined'}
              />
              {Object.entries(accountTypeLabels).map(([type, label]) => (
                <Chip
                  key={type}
                  label={label}
                  color={activeFilter === type ? 'primary' : 'default'}
                  onClick={() => setActiveFilter(type as AccountType)}
                  variant={activeFilter === type ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Info banner */}
      <Card sx={{ mb: 3, bgcolor: 'success.lighter' }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Icon icon="mdi:check-circle" width={24} color="#2e7d32" />
            <Box>
              <Typography variant="subtitle2" color="success.darker">
                Catálogo de Cuentas (PUC)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona el plan contable de tu empresa. Puedes crear, editar y eliminar cuentas según tus necesidades.
                Las cuentas de sistema no pueden ser modificadas.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Card>
          <CardContent>
            {visibleRows.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
                <Icon icon="mdi:file-document-outline" width={64} color="text.secondary" />
                <Typography variant="h6" color="text.secondary">
                  No se encontraron cuentas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchText || activeFilter ? 'Intenta ajustar los filtros' : 'El catálogo de cuentas está vacío'}
                </Typography>
              </Stack>
            ) : (
              <DataGrid
                autoHeight
                rows={visibleRows}
                columns={columns}
                getRowId={(r) => r.id}
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                  }
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 }
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Drawer */}
      <AccountDetailDrawer
        accountId={selectedAccountId}
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedAccountId(null);
        }}
      />

      {/* Form Dialog */}
      <AccountFormDialog
        open={formDialogOpen}
        onClose={handleFormClose}
        account={editingAccount}
        mode={editingAccount ? 'edit' : 'create'}
      />

      {/* Delete Dialog */}
      <AccountDeleteDialog open={deleteDialogOpen} onClose={handleDeleteClose} account={deletingAccount} />
    </Box>
  );
}

export default ChartOfAccountsPage;
