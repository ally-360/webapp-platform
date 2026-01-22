import { useState } from 'react';

// @mui
import { Stack, Typography, Button, Card, Alert, AlertTitle } from '@mui/material';

// Hooks
import { useBoolean } from 'src/hooks/use-boolean';

// Components
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import EmptyContent from 'src/components/empty-content';

// Routes
import { paths } from 'src/routes/paths';

// API
import { useGetMovementsQuery, useGetAccountsQuery } from 'src/redux/services/treasuryApi';

// Components
import MovementTable from '../components/movement-table';
import MovementFormWithAccount from '../components/movement-form-with-account';
import VoidMovementDialog from '../components/void-movement-dialog';

// Types
import type { TreasuryMovement } from '../types';

// ----------------------------------------------------------------------

export default function MovementsListView() {
  // Dialog states
  const openFormDialog = useBoolean(false);
  const openVoidDialog = useBoolean(false);

  // Selected movement for voiding
  const [selectedMovement, setSelectedMovement] = useState<TreasuryMovement | null>(null);

  // RTK Query hooks
  const {
    data: movementsData,
    isLoading: isLoadingMovements,
    refetch: refetchMovements
  } = useGetMovementsQuery({
    page: 1,
    size: 500,
    include_reversed: true
  });

  const { data: accountsData, isLoading: isLoadingAccounts } = useGetAccountsQuery({
    is_active: true
  });

  // Extracted data
  const movements = movementsData?.movements || [];
  const accounts = accountsData?.accounts || [];

  // Handlers
  const handleCreateMovement = () => {
    openFormDialog.onTrue();
  };

  const handleCloseForm = () => {
    openFormDialog.onFalse();
  };

  const handleVoidRequest = (movement: TreasuryMovement) => {
    setSelectedMovement(movement);
    openVoidDialog.onTrue();
  };

  const handleCancelVoid = () => {
    setSelectedMovement(null);
    openVoidDialog.onFalse();
  };

  const handleSuccessForm = () => {
    refetchMovements();
    handleCloseForm();
  };

  const handleSuccessVoid = () => {
    refetchMovements();
    handleCancelVoid();
  };

  // Loading state
  const isLoading = isLoadingMovements || isLoadingAccounts;

  // Empty state
  const isEmpty = !isLoading && movements.length === 0;

  return (
    <>
      <Stack spacing={3} sx={{ pb: 5 }}>
        {/* Breadcrumbs */}
        <CustomBreadcrumbs
          icon="solar:cash-out-bold-duotone"
          heading="Movimientos de Tesorería"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: 'Movimientos' }
          ]}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleCreateMovement}
              data-treasury-movement-create-btn
            >
              Nuevo Movimiento
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        {/* Info Alert */}
        <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
          <AlertTitle>Gestión de Movimientos</AlertTitle>
          <Typography variant="body2">
            Visualiza todos los movimientos de entrada y salida de tus cuentas de tesorería. Puedes registrar ajustes
            manuales o anular movimientos incorrectos. Los movimientos generados automáticamente por el sistema (ventas
            POS, pagos, etc.) están protegidos y no pueden anularse manualmente.
          </Typography>
        </Alert>

        {/* Empty State */}
        {isEmpty && (
          <Card>
            <EmptyContent
              filled
              title="No hay movimientos registrados"
              description="Comienza registrando tu primer movimiento de entrada o salida en tus cuentas de tesorería."
              action={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={handleCreateMovement}
                >
                  Registrar Movimiento
                </Button>
              }
              sx={{ py: 10 }}
            />
          </Card>
        )}

        {/* Movement Table */}
        {!isEmpty && (
          <MovementTable movements={movements} accounts={accounts} isLoading={isLoading} onVoid={handleVoidRequest} />
        )}
      </Stack>

      {/* Movement Form Dialog */}
      <MovementFormWithAccount open={openFormDialog.value} onClose={handleCloseForm} onSuccess={handleSuccessForm} />

      {/* Void Movement Dialog */}
      <VoidMovementDialog
        open={openVoidDialog.value}
        onClose={handleCancelVoid}
        onSuccess={handleSuccessVoid}
        movement={selectedMovement}
      />
    </>
  );
}
