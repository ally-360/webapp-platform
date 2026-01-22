import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';

// Components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

// RTK Query
import {
  useGetReconciliationDetailQuery,
  useMatchTransactionMutation,
  useRemoveMatchMutation,
  useRunAutoMatchMutation,
  useCompleteReconciliationMutation,
  useReverseReconciliationMutation
} from 'src/redux/services/bankReconciliationsApi';

// Routes
import { paths } from 'src/routes/paths';

// Local components
import ReconciliationHeader from '../components/reconciliation-header';
import ReconciliationMatchingTable from '../components/reconciliation-matching-table';
import ReconciliationTimeline from '../components/reconciliation-timeline';

// Types
import type { MatchTransactionPayload, RemoveMatchPayload } from '../types';

// ----------------------------------------------------------------------

export default function BankReconciliationProcessView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  // Dialog states
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [openReverseDialog, setOpenReverseDialog] = useState(false);
  const [reverseReason, setReverseReason] = useState('');

  // Fetch reconciliation detail
  const { data: reconciliation, isLoading, error } = useGetReconciliationDetailQuery(id!);

  // Mutations
  const [matchTransaction] = useMatchTransactionMutation();
  const [removeMatch] = useRemoveMatchMutation();
  const [runAutoMatch, { isLoading: isAutoMatching }] = useRunAutoMatchMutation();
  const [completeReconciliation, { isLoading: isCompleting }] = useCompleteReconciliationMutation();
  const [reverseReconciliation, { isLoading: isReversing }] = useReverseReconciliationMutation();

  // Handle match transaction
  const handleMatch = async (statementLineId: string, transactionIds: string[]) => {
    if (!id) return;

    const payload: MatchTransactionPayload = {
      statement_line_id: statementLineId,
      transaction_ids: transactionIds,
      match_type: 'manual'
    };

    await matchTransaction({ reconciliationId: id, payload }).unwrap();
  };

  // Handle remove match
  const handleRemoveMatch = async (matchId: string) => {
    if (!id) return;

    const payload: RemoveMatchPayload = {
      match_id: matchId
    };

    await removeMatch({ reconciliationId: id, payload }).unwrap();
  };

  // Handle auto-match
  const handleAutoMatch = async () => {
    if (!id) return;

    try {
      const result = await runAutoMatch(id).unwrap();
      enqueueSnackbar(`Conciliación automática completada. ${result.matched_count} transacciones conciliadas.`, {
        variant: 'success'
      });
    } catch (err) {
      enqueueSnackbar('Error al ejecutar conciliación automática', { variant: 'error' });
    }
  };

  // Handle complete reconciliation
  const handleComplete = async () => {
    if (!id) return;

    try {
      await completeReconciliation({ id }).unwrap();
      enqueueSnackbar('Conciliación finalizada exitosamente', { variant: 'success' });
      setOpenCompleteDialog(false);
      // Navigate back to list
      navigate(paths.dashboard.treasury.reconciliations);
    } catch (err) {
      enqueueSnackbar('Error al finalizar conciliación', { variant: 'error' });
    }
  };

  // Handle reverse reconciliation
  const handleReverse = async () => {
    if (!id || !reverseReason.trim()) return;

    try {
      await reverseReconciliation({
        id,
        payload: { reason: reverseReason }
      }).unwrap();
      enqueueSnackbar('Conciliación revertida exitosamente', { variant: 'success' });
      setOpenReverseDialog(false);
      setReverseReason('');
    } catch (err) {
      enqueueSnackbar('Error al revertir conciliación', { variant: 'error' });
    }
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error || !reconciliation) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Alert severity="error">
          <Typography variant="h6">Error al cargar conciliación</Typography>
          <Typography variant="body2">
            No se pudo cargar la información de la conciliación. Por favor, intenta nuevamente.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const isReadOnly = reconciliation.status === 'completed' || reconciliation.status === 'reversed';
  const canFinalize = reconciliation.balance_difference === 0 && reconciliation.status === 'in_progress';
  const canReverse = reconciliation.status === 'completed';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading="Proceso de Conciliación"
        icon="solar:transfer-horizontal-bold-duotone"
        links={[
          { name: t('dashboard', 'Dashboard'), href: paths.dashboard.root },
          { name: t('treasury.title', 'Tesorería'), href: paths.dashboard.treasury.root },
          {
            name: t('treasury.bankReconciliations.title', 'Conciliaciones Bancarias'),
            href: paths.dashboard.treasury.reconciliations
          },
          { name: reconciliation.bank_account?.name || 'Detalle' }
        ]}
        action={
          <Stack direction="row" spacing={2}>
            {/* Save/Postpone Button */}
            {!isReadOnly && (
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:diskette-bold" />}
                onClick={() => {
                  enqueueSnackbar('Progreso guardado', { variant: 'info' });
                  navigate(paths.dashboard.treasury.reconciliations);
                }}
              >
                Guardar y Salir
              </Button>
            )}

            {/* Auto-Match Button */}
            {!isReadOnly && (
              <Button
                variant="outlined"
                color="info"
                startIcon={
                  isAutoMatching ? <CircularProgress size={20} /> : <Iconify icon="solar:magic-stick-3-bold" />
                }
                onClick={handleAutoMatch}
                disabled={isAutoMatching}
              >
                Conciliar Automático
              </Button>
            )}

            {/* Finalize Button */}
            {canFinalize && (
              <Button
                variant="contained"
                color="success"
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                onClick={() => setOpenCompleteDialog(true)}
              >
                Finalizar Conciliación
              </Button>
            )}

            {/* Reverse Button */}
            {canReverse && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:undo-left-bold" />}
                onClick={() => setOpenReverseDialog(true)}
              >
                Reversar Conciliación
              </Button>
            )}
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Header with balance info */}
      <ReconciliationHeader reconciliation={reconciliation} />

      {/* Matching Table */}
      <ReconciliationMatchingTable
        statementLines={reconciliation.statement_lines}
        transactions={reconciliation.accounting_transactions}
        matches={reconciliation.matches}
        onMatch={handleMatch}
        onRemoveMatch={handleRemoveMatch}
        isReadOnly={isReadOnly}
      />

      {/* Timeline */}
      <Box sx={{ mt: 3 }}>
        <ReconciliationTimeline activities={reconciliation.activities} />
      </Box>

      {/* Complete Dialog */}
      <Dialog open={openCompleteDialog} onClose={() => setOpenCompleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:check-circle-bold" width={24} sx={{ color: 'success.main' }} />
            <span>Finalizar Conciliación</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                Estás a punto de finalizar esta conciliación bancaria. Esta acción:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Marcará todas las transacciones conciliadas como finalizadas</li>
                <li>Generará los asientos contables de ajuste necesarios (si aplica)</li>
                <li>Bloqueará la conciliación para edición</li>
              </Box>
            </Alert>

            <Alert severity="warning">
              <Typography variant="body2" fontWeight="bold">
                ¿Estás seguro de continuar?
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompleteDialog(false)} disabled={isCompleting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={isCompleting}
            startIcon={isCompleting ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />}
          >
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reverse Dialog */}
      <Dialog open={openReverseDialog} onClose={() => setOpenReverseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Iconify icon="solar:undo-left-bold" width={24} sx={{ color: 'error.main' }} />
            <span>Reversar Conciliación</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="error">
              <Typography variant="body2">Reversar esta conciliación implicará:</Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Anular todos los emparejamientos realizados</li>
                <li>Reversar los asientos contables de ajuste generados</li>
                <li>Marcar las transacciones como no conciliadas nuevamente</li>
              </Box>
            </Alert>

            <TextField
              fullWidth
              label="Motivo de reversión"
              multiline
              rows={3}
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              placeholder="Describe el motivo de la reversión..."
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReverseDialog(false)} disabled={isReversing}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReverse}
            disabled={!reverseReason.trim() || isReversing}
            startIcon={isReversing ? <CircularProgress size={20} /> : <Iconify icon="solar:undo-left-bold" />}
          >
            Reversar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
