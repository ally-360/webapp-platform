import { useState, useCallback, useMemo } from 'react';
import { Card, Stack, Box, Typography, Grid, MenuItem, Button, Skeleton } from '@mui/material';
import { subDays, isAfter } from 'date-fns';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { RHFSelect } from 'src/components/hook-form';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';

import { useListMovementsQuery } from 'src/redux/services/inventoryMovementsApi';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import type { InventoryMovement, MovementsListParams } from 'src/types/inventory-movements';

import MovementsTable from 'src/sections/inventory/movements-table';
import MovementDetailDrawer from 'src/sections/inventory/movement-detail-drawer';

// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 50;

type Props = {
  productId: string;
  productName: string;
};

export default function ProductMovementsTab({ productId, productName }: Props) {
  const [offset, setOffset] = useState(0);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);

  // Form for filters
  const methods = useForm<MovementsListParams>({
    defaultValues: {
      product_id: productId,
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
      product_id: productId,
      limit: ITEMS_PER_PAGE,
      offset
    };
    if (filters.pdv_id) params.pdv_id = filters.pdv_id;
    if (filters.movement_type) params.movement_type = filters.movement_type;
    return params;
  }, [productId, filters.pdv_id, filters.movement_type, offset]);

  // Queries
  const { data: movements, isLoading, isFetching, refetch } = useListMovementsQuery(queryParams);
  const { data: pdvsData, isLoading: pdvsLoading } = useGetPDVsQuery();

  const movementsList = movements || [];
  const pdvs = pdvsData || [];

  // Calculate KPIs
  const kpis = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const totalIn = movementsList
      .filter((m) => m.movement_type === 'IN')
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    const totalOut = movementsList
      .filter((m) => m.movement_type === 'OUT')
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

    const recent = movementsList.filter((m) => isAfter(new Date(m.created_at), thirtyDaysAgo)).length;

    return { totalIn, totalOut, recent };
  }, [movementsList]);

  // Handlers
  const handleClearFilters = useCallback(() => {
    reset({
      product_id: productId,
      pdv_id: '',
      movement_type: '',
      limit: ITEMS_PER_PAGE,
      offset: 0
    });
    setOffset(0);
  }, [reset, productId]);

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const handleViewDetail = useCallback((movement: InventoryMovement) => {
    setSelectedMovement(movement);
    setDetailDrawerOpen(true);
  }, []);

  const handleViewJournal = useCallback(
    (movementId: string) => {
      const movement = movementsList.find((m) => m.id === movementId);
      if (movement?.journal_entry) {
        setSelectedMovement(movement);
        setDetailDrawerOpen(true);
      }
    },
    [movementsList]
  );

  const hasMoreItems = movementsList.length >= ITEMS_PER_PAGE;
  const showEmptyState = !isLoading && movementsList.length === 0;

  return (
    <>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant="h6">Kardex del producto</Typography>
          <Typography variant="body2" color="text.secondary">
            Historial de movimientos (entradas/salidas) por punto de venta
          </Typography>
        </Stack>

        {/* KPIs Card */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack>
                <Typography variant="overline" color="text.secondary">
                  Total Entradas
                </Typography>
                {isLoading ? (
                  <Skeleton width={80} height={32} />
                ) : (
                  <Typography variant="h4" color="success.main">
                    +{kpis.totalIn}
                  </Typography>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack>
                <Typography variant="overline" color="text.secondary">
                  Total Salidas
                </Typography>
                {isLoading ? (
                  <Skeleton width={80} height={32} />
                ) : (
                  <Typography variant="h4" color="error.main">
                    -{kpis.totalOut}
                  </Typography>
                )}
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack>
                <Typography variant="overline" color="text.secondary">
                  Últimos 30 días
                </Typography>
                {isLoading ? <Skeleton width={80} height={32} /> : <Typography variant="h4">{kpis.recent}</Typography>}
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Filters */}
        <Card sx={{ p: 3, mb: 3 }}>
          <FormProvider methods={methods} onSubmit={() => {}}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <RHFSelect name="pdv_id" label="PDV" disabled={pdvsLoading} sx={{ minWidth: 200 }}>
                  <MenuItem value="">Todos</MenuItem>
                  {pdvs.map((pdv) => (
                    <MenuItem key={pdv.id} value={pdv.id}>
                      {pdv.name}
                    </MenuItem>
                  ))}
                </RHFSelect>

                <RHFSelect name="movement_type" label="Tipo" sx={{ minWidth: 200 }}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="IN">Entrada</MenuItem>
                  <MenuItem value="OUT">Salida</MenuItem>
                </RHFSelect>

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
                  onClick={handleClearFilters}
                  sx={{ flexShrink: 0 }}
                >
                  Limpiar
                </Button>
              </Stack>
            </Stack>
          </FormProvider>
        </Card>

        {/* Table */}
        <Card>
          {showEmptyState ? (
            <EmptyContent
              filled
              title="Este producto aún no tiene movimientos"
              description="Los movimientos de inventario aparecerán aquí cuando se registren entradas, salidas o transferencias"
              sx={{ py: 10 }}
            />
          ) : (
            <>
              <MovementsTable
                movements={movementsList}
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

              {!hasMoreItems && movementsList.length > 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Mostrando {movementsList.length} movimientos
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Card>
      </Box>

      {/* Detail Drawer */}
      <MovementDetailDrawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        movement={selectedMovement}
      />
    </>
  );
}
