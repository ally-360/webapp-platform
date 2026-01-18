import { useState } from 'react';
import { Icon } from '@iconify/react';

// MUI
import {
  Card,
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  AlertTitle,
  Skeleton,
  Stack,
  Box
} from '@mui/material';

// Components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';

// RTK Query
import {
  useGetCostCentersQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation
} from 'src/redux/services/accountingApi';

// Routes
import { paths } from 'src/routes/paths';

// notistack
import { enqueueSnackbar } from 'notistack';

// Types
import type { CostCenter } from 'src/sections/accounting/types';

// Local components
import CostCenterCreateEditDialog, { type CostCenterFormData } from '../components/cost-center-create-edit-dialog';
import CostCenterDeleteDialog from '../components/cost-center-delete-dialog';

// ----------------------------------------------------------------------

export default function SettingsView() {
  const settings = useSettingsContext();

  // RTK Query hooks
  const { data: costCenters = [], isLoading } = useGetCostCentersQuery();
  const [createCostCenter, { isLoading: isCreating }] = useCreateCostCenterMutation();
  const [updateCostCenter, { isLoading: isUpdating }] = useUpdateCostCenterMutation();
  const [deleteCostCenter, { isLoading: isDeleting }] = useDeleteCostCenterMutation();

  // Dialog states
  const [openCreateEdit, setOpenCreateEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);

  const isEmpty = costCenters.length === 0;

  // Handlers
  const handleOpenCreate = () => {
    setSelectedCostCenter(null);
    setOpenCreateEdit(true);
  };

  const handleOpenEdit = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setOpenCreateEdit(true);
  };

  const handleOpenDelete = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setOpenDelete(true);
  };

  const handleCloseDialogs = () => {
    setOpenCreateEdit(false);
    setOpenDelete(false);
    setSelectedCostCenter(null);
  };

  const handleSubmitCreateEdit = async (data: CostCenterFormData) => {
    try {
      // Remove empty code field to avoid backend validation error
      const payload = {
        ...data,
        ...(data.code && data.code.trim() ? { code: data.code.trim() } : {})
      };
      // Remove code key if it exists and is empty
      if ('code' in payload && !payload.code) {
        delete (payload as any).code;
      }

      if (selectedCostCenter) {
        // Update
        await updateCostCenter({
          id: selectedCostCenter.id,
          payload
        }).unwrap();
        enqueueSnackbar('Centro de costo actualizado', { variant: 'success' });
      } else {
        // Create
        await createCostCenter(payload as any).unwrap();
        enqueueSnackbar('Centro de costo creado', { variant: 'success' });
      }
    } catch (err: any) {
      console.error('Error en centro de costo:', err);
      enqueueSnackbar(err?.data?.detail || 'Error en la operación', { variant: 'error' });
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCostCenter) return;

    try {
      await deleteCostCenter(selectedCostCenter.id).unwrap();
      enqueueSnackbar('Centro de costo eliminado', { variant: 'success' });
    } catch (err: any) {
      console.error('Error eliminando centro de costo:', err);
      enqueueSnackbar(err?.data?.detail || 'Error eliminando centro de costo', {
        variant: 'error'
      });
      throw err;
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Configuración General"
        icon="solar:settings-bold-duotone"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Configuración' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Cost Centers Section */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" gutterBottom>
                Centros de Costo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organiza gastos e ingresos por departamentos o proyectos
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<Icon icon="mingcute:add-line" />} onClick={handleOpenCreate}>
              Crear Centro de Costo
            </Button>
          </Stack>
        </Box>

        {isEmpty && !isLoading && (
          <Box sx={{ p: 3 }}>
            <Alert severity="info">
              <AlertTitle>No hay centros de costo</AlertTitle>
              Crea tu primer centro de costo para comenzar a organizar gastos e ingresos
            </Alert>
          </Box>
        )}

        {isLoading && (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={200} />
          </Box>
        )}

        {!isLoading && !isEmpty && (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costCenters.map((costCenter) => (
                  <TableRow key={costCenter.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {costCenter.code || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{costCenter.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={costCenter.is_active ? 'Activo' : 'Inactivo'}
                        color={costCenter.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(costCenter)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleOpenDelete(costCenter)}>
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Future sections placeholder */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Próximamente</AlertTitle>
        Aquí se agregarán más configuraciones: facturación electrónica, prefijos de documentos, impuestos, etc.
      </Alert>

      {/* Dialogs */}
      <CostCenterCreateEditDialog
        open={openCreateEdit}
        onClose={handleCloseDialogs}
        onSubmit={handleSubmitCreateEdit}
        costCenter={selectedCostCenter}
        isLoading={isCreating || isUpdating}
      />

      <CostCenterDeleteDialog
        open={openDelete}
        onClose={handleCloseDialogs}
        onConfirm={handleConfirmDelete}
        costCenter={selectedCostCenter}
        isLoading={isDeleting}
      />
    </Container>
  );
}
