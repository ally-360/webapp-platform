import { useState } from 'react';
import { Stack, Grid, Alert, AlertTitle, Button, Box, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hook/use-router';
import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';
import { useCompleteReconciliationMutation } from 'src/redux/services/bankReconciliationsApi';
import type { BankReconciliation } from 'src/sections/treasury/types';
import BalancesCard from './balances-card';
import ProgressCard from './progress-card';
import PendingItemsCard from './pending-items-card';
import AdjustmentPreviewCard from './adjustment-preview-card';
import CompleteConfirmDialog from './complete-confirm-dialog';

interface ReconciliationCompleteTabProps {
  reconciliation: BankReconciliation;
}

export default function ReconciliationCompleteTab({ reconciliation }: ReconciliationCompleteTabProps) {
  const router = useRouter();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [completeReconciliation, { isLoading: isCompleting }] = useCompleteReconciliationMutation();

  const { id, status, total_statement_lines, unreconciled_lines, balance_difference, reconciled_at, reconciled_by } =
    reconciliation;

  const isCompleted = status === 'completed';
  const isReversed = status === 'reversed';
  const isReadOnly = isCompleted || isReversed;
  const hasUnreconciledLines = (unreconciled_lines || 0) > 0;
  const hasNoLines = total_statement_lines === 0;
  const balanceDiff = parseFloat(balance_difference?.toString() || '0');
  const hasDifference = Math.abs(balanceDiff) > 0.01;

  // Handlers
  const handleOpenConfirm = () => {
    // Validation: cannot complete if no lines imported
    if (hasNoLines) {
      enqueueSnackbar('Debes importar el extracto bancario antes de completar la conciliación', {
        variant: 'warning'
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmDialogOpen(false);
  };

  const handleComplete = async () => {
    try {
      await completeReconciliation({
        id,
        payload: {
          create_adjustment: hasDifference
        }
      }).unwrap();

      enqueueSnackbar('Conciliación completada exitosamente', { variant: 'success' });
      setConfirmDialogOpen(false);

      // Optionally redirect to report or stay in complete tab
      // router.push(`${paths.dashboard.treasury.reconciliationDetails(id)}?step=report`);
    } catch (error: any) {
      console.error('Error completing reconciliation:', error);

      // Handle specific errors
      if (error.status === 409 || error.status === 422) {
        enqueueSnackbar(error.data?.message || 'No se puede completar la conciliación en su estado actual', {
          variant: 'error'
        });
      } else if (error.status === 403) {
        enqueueSnackbar('No tienes permisos para completar esta conciliación', {
          variant: 'error'
        });
      } else {
        enqueueSnackbar('Error al completar la conciliación', { variant: 'error' });
      }
    }
  };

  const handleGoToMatching = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(id)}?step=manual-match`);
  };

  const handleGoToReport = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(id)}?step=report`);
  };

  const handleGoToTimeline = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(id)}?step=timeline`);
  };

  return (
    <>
      <Stack spacing={3}>
        {/* Status Messages */}
        {isCompleted && (
          <Alert
            severity="success"
            icon={<Iconify icon="eva:checkmark-circle-2-fill" width={24} />}
            action={
              <Stack direction="row" spacing={1}>
                <Button size="small" color="success" onClick={handleGoToReport}>
                  Ver Reporte
                </Button>
                <Button size="small" color="success" variant="outlined" onClick={handleGoToTimeline}>
                  Ver Timeline
                </Button>
              </Stack>
            }
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Conciliación Completada</AlertTitle>
            <Typography variant="body2">
              Esta conciliación fue completada
              {reconciled_at && ` el ${new Date(reconciled_at).toLocaleDateString()}`}
              {reconciled_by && ` por ${reconciled_by}`}. La información es de solo lectura.
            </Typography>
          </Alert>
        )}

        {isReversed && (
          <Alert
            severity="error"
            icon={<Iconify icon="eva:close-circle-fill" width={24} />}
            action={
              <Button size="small" color="error" variant="outlined" onClick={handleGoToTimeline}>
                Ver Reversión
              </Button>
            }
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Conciliación Revertida</AlertTitle>
            <Typography variant="body2">
              Esta conciliación ha sido revertida. La información es de solo lectura.
            </Typography>
          </Alert>
        )}

        {hasNoLines && !isReadOnly && (
          <Alert severity="warning" icon={<Iconify icon="eva:alert-triangle-fill" width={24} />}>
            <AlertTitle sx={{ fontWeight: 600 }}>Extracto bancario no importado</AlertTitle>
            <Typography variant="body2">
              Debes importar el extracto bancario antes de poder completar la conciliación. Ve al tab "Importar" para
              cargar las líneas del extracto.
            </Typography>
          </Alert>
        )}

        {/* Action Buttons (sticky header when not read-only) */}
        {!isReadOnly && !hasNoLines && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              bgcolor: 'background.paper',
              py: 2,
              borderRadius: 1
            }}
          >
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {hasUnreconciledLines && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Iconify icon="solar:link-minimalistic-2-bold-duotone" />}
                  onClick={handleGoToMatching}
                >
                  Resolver Pendientes
                </Button>
              )}

              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
                onClick={handleOpenConfirm}
                disabled={isCompleting}
              >
                Completar Conciliación
              </Button>
            </Stack>
          </Box>
        )}

        {/* Cards Grid */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <BalancesCard reconciliation={reconciliation} />
              <ProgressCard reconciliation={reconciliation} />
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <PendingItemsCard reconciliationId={id} />
              <AdjustmentPreviewCard reconciliation={reconciliation} />
            </Stack>
          </Grid>
        </Grid>

        {/* Additional Info for completed status */}
        {isCompleted && (
          <Alert severity="info" icon={<Iconify icon="eva:info-fill" width={24} />}>
            <Typography variant="body2">
              Esta conciliación está completa. Si necesitas hacer cambios, primero debes revertirla desde el menú de
              acciones.
            </Typography>
          </Alert>
        )}
      </Stack>

      {/* Confirm Dialog */}
      <CompleteConfirmDialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleComplete}
        reconciliation={reconciliation}
        hasUnreconciledLines={hasUnreconciledLines}
        isLoading={isCompleting}
      />
    </>
  );
}
