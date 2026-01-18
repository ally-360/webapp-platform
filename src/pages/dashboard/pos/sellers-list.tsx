import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  Alert
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Icon } from '@iconify/react';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetSellersQuery, useUpdateSellerMutation, useDeactivateSellerMutation } from 'src/redux/services/posApi';
import { InviteSellerDialog } from 'src/sections/pos/invite-seller-dialog';
import { fCurrency } from 'src/utils/format-number';
import { enqueueSnackbar } from 'notistack';
import type { Seller } from 'src/types/pos';

const roleLabels: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  seller: 'Vendedor'
};

const roleColors: Record<string, any> = {
  owner: 'error',
  admin: 'warning',
  seller: 'primary'
};

export default function SellersListView() {
  const [searchText, setSearchText] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  const { data, isLoading, error } = useGetSellersQuery({
    active_only: activeOnly,
    size: 100
  });

  const [updateSeller] = useUpdateSellerMutation();
  const [deactivateSeller] = useDeactivateSellerMutation();

  const sellers = useMemo(() => data?.sellers || [], [data]);

  const filteredSellers = useMemo(() => {
    if (!searchText) return sellers;

    const search = searchText.toLowerCase();
    return sellers.filter(
      (seller) =>
        seller.full_name.toLowerCase().includes(search) ||
        seller.email.toLowerCase().includes(search) ||
        (seller.phone && seller.phone.toLowerCase().includes(search)) ||
        (seller.document && seller.document.toLowerCase().includes(search))
    );
  }, [sellers, searchText]);

  const handleToggleActive = useCallback(
    async (seller: Seller) => {
      try {
        if (seller.is_active) {
          await deactivateSeller(seller.id).unwrap();
          enqueueSnackbar('Vendedor desactivado exitosamente', { variant: 'success' });
        } else {
          await updateSeller({ id: seller.id, data: { is_active: true } }).unwrap();
          enqueueSnackbar('Vendedor activado exitosamente', { variant: 'success' });
        }
      } catch (err: any) {
        console.error('Error toggling seller status:', err);
        const message = err?.data?.detail || 'Error al actualizar el vendedor';
        enqueueSnackbar(message, { variant: 'error' });
      }
    },
    [deactivateSeller, updateSeller]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'full_name',
        headerName: 'Vendedor',
        flex: 1,
        minWidth: 250,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {row.first_name.charAt(0)}
              {row.last_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">{row.full_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {row.email}
              </Typography>
            </Box>
          </Stack>
        )
      },
      {
        field: 'role',
        headerName: 'Rol',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip
            label={roleLabels[row.role] || row.role}
            color={roleColors[row.role] || 'default'}
            size="small"
            variant="filled"
          />
        )
      },
      {
        field: 'phone',
        headerName: 'Teléfono',
        width: 150,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" color={row.phone ? 'text.primary' : 'text.disabled'}>
            {row.phone || '-'}
          </Typography>
        )
      },
      {
        field: 'document',
        headerName: 'Documento',
        width: 130,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" color={row.document ? 'text.primary' : 'text.disabled'}>
            {row.document || '-'}
          </Typography>
        )
      },
      {
        field: 'commission_rate',
        headerName: 'Comisión',
        width: 110,
        sortable: false,
        align: 'right',
        renderCell: ({ row }) => (
          <Typography variant="body2" color={row.commission_rate ? 'text.primary' : 'text.disabled'}>
            {row.commission_rate ? `${(row.commission_rate * 100).toFixed(1)}%` : '-'}
          </Typography>
        )
      },
      {
        field: 'base_salary',
        headerName: 'Salario Base',
        width: 130,
        sortable: false,
        align: 'right',
        renderCell: ({ row }) => (
          <Typography variant="body2" color={row.base_salary ? 'text.primary' : 'text.disabled'}>
            {row.base_salary ? fCurrency(row.base_salary) : '-'}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Estado',
        width: 140,
        sortable: false,
        renderCell: ({ row }) => {
          if (row.is_invitation_pending) {
            return <Chip label="Invitación pendiente" color="warning" size="small" variant="outlined" />;
          }
          return (
            <Chip
              label={row.is_active ? 'ACTIVO' : 'INACTIVO'}
              color={row.is_active ? 'success' : 'default'}
              size="small"
            />
          );
        }
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 100,
        sortable: false,
        align: 'center',
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={row.is_active ? 'Desactivar' : 'Activar'}>
              <IconButton
                size="small"
                color={row.is_active ? 'error' : 'success'}
                onClick={() => handleToggleActive(row)}
                disabled={row.role === 'owner'}
              >
                <Icon icon={row.is_active ? 'mdi:account-off' : 'mdi:account-check'} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [handleToggleActive]
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error al cargar vendedores</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">Vendedores</Typography>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:account-plus" />}
          onClick={() => setInviteDialogOpen(true)}
        >
          Invitar Vendedor
        </Button>
      </Stack>

      {/* Info Banner */}
      <Alert severity="info" icon={<Icon icon="mdi:information" />} sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Sistema de Vendedores
        </Typography>
        <Typography variant="body2">
          Los vendedores son usuarios del sistema con permisos para realizar ventas en el POS. Los administradores y
          propietarios también pueden vender automáticamente. Invita nuevos vendedores mediante email.
        </Typography>
      </Alert>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Buscar por nombre, email, teléfono o documento..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <Icon icon="mdi:magnify" style={{ marginRight: 8 }} />
              }}
            />
            <Stack direction="row" spacing={1}>
              <Chip
                label="Solo activos"
                color={activeOnly ? 'primary' : 'default'}
                onClick={() => setActiveOnly(true)}
                variant={activeOnly ? 'filled' : 'outlined'}
              />
              <Chip
                label="Todos"
                color={!activeOnly ? 'primary' : 'default'}
                onClick={() => setActiveOnly(false)}
                variant={!activeOnly ? 'filled' : 'outlined'}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Card>
          <CardContent>
            {filteredSellers.length === 0 ? (
              <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
                <Icon icon="mdi:account-group" width={64} color="text.secondary" />
                <Typography variant="h6" color="text.secondary">
                  No se encontraron vendedores
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchText ? 'Intenta ajustar tu búsqueda' : 'Invita a tu primer vendedor para comenzar'}
                </Typography>
              </Stack>
            ) : (
              <DataGrid
                autoHeight
                rows={filteredSellers}
                columns={columns}
                disableRowSelectionOnClick
                disableColumnMenu
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'action.hover'
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

      {/* Invite Dialog */}
      <InviteSellerDialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} />
    </Box>
  );
}
