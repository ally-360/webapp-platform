import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Card, Stack, Button, Typography, Box } from '@mui/material';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import FormProvider from 'src/components/hook-form';
import { paths } from 'src/routes/paths';

import { useListMovementsQuery } from 'src/redux/services/inventoryMovementsApi';
import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';

import type { InventoryMovement, MovementsListParams } from 'src/types/inventory-movements';
import MovementsFilters from '../movements-filters';
import MovementsTable from '../movements-table';
import CreateMovementDialog from '../create-movement-dialog';
import TransferStockDialog from '../transfer-stock-dialog';
import MovementDetailDrawer from '../movement-detail-drawer';

// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 50;

export default function MovementsListView() {
  const settings = useSettingsContext();

  // Dialogs/Drawer state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);

  // Pagination
  const [offset, setOffset] = useState(0);

  // Local search (client-side filter)
  const [localSearch, setLocalSearch] = useState('');

  // Form for filters
  const methods = useForm<MovementsListParams>({
    defaultValues: {
      product_id: '',
      pdv_id: '',
      movement_type: '',
      limit: ITEMS_PER_PAGE,
      offset: 0
    }
  });

  const { watch, reset } = methods;
  const filters = watch();

  // Build query params
  const queryParams = useMemo(() => {
    const params: MovementsListParams = {
      limit: ITEMS_PER_PAGE,
      offset
    };
    if (filters.product_id) params.product_id = filters.product_id;
    if (filters.pdv_id) params.pdv_id = filters.pdv_id;
    if (filters.movement_type) params.movement_type = filters.movement_type;
    return params;
  }, [filters.product_id, filters.pdv_id, filters.movement_type, offset]);

  // Queries
  const { data, isLoading, isFetching, refetch } = useListMovementsQuery(queryParams);
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({
    page_size: 1000
  });
  const { data: pdvsData, isLoading: pdvsLoading } = useGetPDVsQuery();

  const movements = data || [];
  const total = movements.length;

  // Apply local search filter (client-side)
  const filteredMovements = useMemo(() => {
    if (!localSearch.trim()) return movements;

    const search = localSearch.toLowerCase();
    return movements.filter(
      (m) =>
        m.product_name.toLowerCase().includes(search) ||
        m.product_sku?.toLowerCase().includes(search) ||
        m.reference?.toLowerCase().includes(search) ||
        m.notes?.toLowerCase().includes(search) ||
        m.created_by_email?.toLowerCase().includes(search)
    );
  }, [movements, localSearch]);
  const handleClearFilters = useCallback(() => {
    reset();
    setOffset(0);
    setLocalSearch('');
  }, [reset]);

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const handleViewDetail = useCallback((movement: InventoryMovement) => {
    setSelectedMovement(movement);
    setDetailDrawerOpen(true);
  }, []);

  const handleViewJournal = useCallback(
    (movementId: string) => {
      const movement = movements.find((m) => m.id === movementId);
      if (movement?.journal_entry) {
        // Open detail drawer showing the journal entry
        setSelectedMovement(movement);
        setDetailDrawerOpen(true);
      }
    },
    [movements]
  );

  const handleCreateSuccess = useCallback(() => {
    setOffset(0);
    refetch();
  }, [refetch]);

  const handleTransferSuccess = useCallback(() => {
    setOffset(0);
    refetch();
  }, [refetch]);

  const products = productsData?.data || [];
  const pdvs = pdvsData || [];

  const hasMoreItems = movements.length >= ITEMS_PER_PAGE;
  const showEmptyState = !isLoading && filteredMovements.length === 0;

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        icon="ic_inventory"
        heading="Movimientos de Inventario"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Inventario', href: paths.dashboard.root },
          { name: 'Movimientos' }
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Registrar Movimiento
            </Button>
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:arrow-left-right-bold" />}
              onClick={() => setTransferDialogOpen(true)}
            >
              Transferir Stock
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={() => {}}>
        <MovementsFilters
          products={products}
          pdvs={pdvs}
          productsLoading={productsLoading}
          pdvsLoading={pdvsLoading}
          onClearFilters={handleClearFilters}
          localSearch={localSearch}
          onLocalSearchChange={setLocalSearch}
        />
      </FormProvider>

      <Card>
        {showEmptyState ? (
          <EmptyContent
            filled
            title="No hay movimientos"
            description="No se encontraron movimientos con los filtros seleccionados"
            sx={{ py: 10 }}
          />
        ) : (
          <>
            <MovementsTable
              movements={filteredMovements}
              loading={isLoading}
              onViewDetail={handleViewDetail}
              onViewJournal={handleViewJournal}
            />

            {hasMoreItems && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  startIcon={<Iconify icon="eva:arrow-downward-fill" />}
                >
                  Cargar más
                </Button>
              </Box>
            )}

            {!hasMoreItems && movements.length > 0 && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Mostrando {filteredMovements.length} movimientos
                </Typography>
              </Box>
            )}
          </>
        )}
      </Card>

      {/* Dialogs */}
      <CreateMovementDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <TransferStockDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onSuccess={handleTransferSuccess}
      />

      <MovementDetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        movement={selectedMovement}
      />
    </Container>
  );
}
