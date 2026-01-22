import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Typography, Button, Alert, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import { useSnackbar } from 'notistack';
import Iconify from 'src/components/iconify';
import {
  useGetUnmatchedLinesQuery,
  useGetUnmatchedMovementsQuery,
  useMatchTransactionMutation,
  useRemoveMatchMutation,
  useGetMatchesQuery,
  useGetReconciliationByIdQuery
} from 'src/redux/services/bankReconciliationsApi';
import type { BankReconciliation, BankStatementLine, UnmatchedMovement } from '../types';
import UnmatchedLinesPanel from './unmatched-lines-panel';
import UnmatchedMovementsPanel from './unmatched-movements-panel';
import MatchComposer from './match-composer';
import MatchesDrawer from './matches-drawer';

// ----------------------------------------------------------------------

interface ReconciliationManualMatchTabProps {
  reconciliation: BankReconciliation;
}

export default function ReconciliationManualMatchTab({ reconciliation }: ReconciliationManualMatchTabProps) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado local
  const [selectedLine, setSelectedLine] = useState<BankStatementLine | null>(null);
  const [selectedMovement, setSelectedMovement] = useState<UnmatchedMovement | null>(null);
  const [matchesDrawerOpen, setMatchesDrawerOpen] = useState(false);

  // Query params para preselección
  const preselectedLineId = searchParams.get('statementLineId');
  const preselectedMovementId = searchParams.get('movementId');

  // Queries
  const {
    data: unmatchedLinesData,
    isLoading: isLoadingLines,
    refetch: refetchLines
  } = useGetUnmatchedLinesQuery({ reconciliationId: reconciliation.id, limit: 100 }, { skip: !reconciliation.id });

  const {
    data: unmatchedMovementsData,
    isLoading: isLoadingMovements,
    refetch: refetchMovements
  } = useGetUnmatchedMovementsQuery({ reconciliationId: reconciliation.id, limit: 100 }, { skip: !reconciliation.id });

  const {
    data: matchesData,
    isLoading: isLoadingMatches,
    refetch: refetchMatches
  } = useGetMatchesQuery({ reconciliationId: reconciliation.id }, { skip: !reconciliation.id });

  const { refetch: refetchReconciliation } = useGetReconciliationByIdQuery(reconciliation.id, {
    skip: !reconciliation.id
  });

  // Mutations
  const [createMatch, { isLoading: isCreatingMatch }] = useMatchTransactionMutation();
  const [deleteMatch, { isLoading: isDeletingMatch }] = useRemoveMatchMutation();
  const [deletingMatchId, setDeletingMatchId] = useState<string | null>(null);

  // Calcular valores
  const unmatchedLines = unmatchedLinesData?.items || [];
  const unmatchedMovements = unmatchedMovementsData?.items || [];
  const matches = matchesData?.items || [];
  const totalLines = reconciliation.total_statement_lines || 0;
  const reconciledLines = reconciliation.reconciled_lines || 0;
  const reconciliationPercentage = totalLines > 0 ? (reconciledLines / totalLines) * 100 : 0;
  const isBalanced = reconciliation.is_balanced || false;
  const balanceDifference = reconciliation.balance_difference || 0;

  // Estados
  const isCompleted = reconciliation.status === 'completed';
  const isReversed = reconciliation.status === 'reversed';
  const readOnly = isCompleted || isReversed;
  const hasNoLines = totalLines === 0;
  const canComplete = reconciledLines > 0 && isBalanced;

  // Preselección desde query params
  useEffect(() => {
    if (preselectedLineId && unmatchedLines.length > 0) {
      const line = unmatchedLines.find((l) => l.id === preselectedLineId);
      if (line) {
        setSelectedLine(line);
        // Limpiar query param
        searchParams.delete('statementLineId');
        setSearchParams(searchParams);
      }
    }
  }, [preselectedLineId, unmatchedLines, searchParams, setSearchParams]);

  useEffect(() => {
    if (preselectedMovementId && unmatchedMovements.length > 0) {
      const movement = unmatchedMovements.find((m) => m.id === preselectedMovementId);
      if (movement) {
        setSelectedMovement(movement);
        // Limpiar query param
        searchParams.delete('movementId');
        setSearchParams(searchParams);
      }
    }
  }, [preselectedMovementId, unmatchedMovements, searchParams, setSearchParams]);

  // Handlers
  const handleSelectLine = (line: BankStatementLine) => {
    setSelectedLine(selectedLine?.id === line.id ? null : line);
  };

  const handleSelectMovement = (movement: UnmatchedMovement) => {
    setSelectedMovement(selectedMovement?.id === movement.id ? null : movement);
  };

  const handleCreateMatch = async (note?: string) => {
    if (!selectedLine || !selectedMovement) return;

    try {
      await createMatch({
        reconciliationId: reconciliation.id,
        payload: {
          statement_line_id: selectedLine.id,
          movement_id: selectedMovement.id,
          note
        }
      }).unwrap();

      enqueueSnackbar('Conciliación creada exitosamente', { variant: 'success' });

      // Limpiar selecciones
      setSelectedLine(null);
      setSelectedMovement(null);

      // Refetch todo
      refetchLines();
      refetchMovements();
      refetchMatches();
      refetchReconciliation();
    } catch (error: any) {
      console.error('Error creating match:', error);
      enqueueSnackbar(error?.data?.message || 'Error al crear la conciliación', {
        variant: 'error'
      });
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    setDeletingMatchId(matchId);
    try {
      await deleteMatch({
        reconciliationId: reconciliation.id,
        matchId
      }).unwrap();

      enqueueSnackbar('Conciliación deshecha exitosamente', { variant: 'success' });

      // Refetch todo
      refetchLines();
      refetchMovements();
      refetchMatches();
      refetchReconciliation();
    } catch (error: any) {
      console.error('Error deleting match:', error);
      enqueueSnackbar(error?.data?.message || 'Error al deshacer la conciliación', {
        variant: 'error'
      });
    } finally {
      setDeletingMatchId(null);
    }
  };

  const handleGoToImport = () => {
    searchParams.set('step', 'import');
    setSearchParams(searchParams);
  };

  const handleComplete = () => {
    searchParams.set('step', 'report');
    setSearchParams(searchParams);
  };

  // Bloquear si no hay líneas
  if (hasNoLines) {
    return (
      <Box sx={{ py: 5 }}>
        <Alert
          severity="warning"
          icon={<Iconify icon="solar:danger-triangle-bold-duotone" width={24} />}
          action={
            <Button size="small" variant="contained" onClick={handleGoToImport}>
              Ir a Importar
            </Button>
          }
        >
          <Typography variant="subtitle2" gutterBottom>
            No hay extracto bancario importado
          </Typography>
          <Typography variant="body2">
            Para poder conciliar manualmente, primero debes importar el extracto bancario.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* KPIs Header */}
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            {/* Progreso */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Progreso de Conciliación
                </Typography>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={reconciliationPercentage}
                      color={reconciliationPercentage === 100 ? 'success' : 'primary'}
                      sx={{ height: 8, borderRadius: 1 }}
                    />
                  </Box>
                  <Typography variant="h6" color="primary.main">
                    {Math.round(reconciliationPercentage)}%
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {reconciledLines} de {totalLines} líneas conciliadas
                </Typography>
              </Stack>
            </Grid>

            {/* Balance */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Estado del Balance
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    label={isBalanced ? 'Balanceado' : 'Desbalanceado'}
                    color={isBalanced ? 'success' : 'error'}
                    icon={<Iconify icon={isBalanced ? 'eva:checkmark-circle-2-fill' : 'eva:alert-triangle-fill'} />}
                  />
                  {!isBalanced && (
                    <Typography variant="body2" color="error.main" fontWeight={600}>
                      Dif: ${Math.abs(balanceDifference).toFixed(2)}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Grid>

            {/* Acciones */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="solar:list-bold" />}
                  onClick={() => setMatchesDrawerOpen(true)}
                >
                  Ver Matches ({matches.length})
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Iconify icon="solar:check-circle-bold" />}
                  onClick={handleComplete}
                  disabled={!canComplete}
                >
                  Completar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mensaje de solo lectura */}
      {readOnly && (
        <Alert severity="info" icon={<Iconify icon="eva:eye-fill" />}>
          Esta conciliación está en modo solo lectura ({isCompleted ? 'completada' : 'revertida'}). No se pueden crear
          ni eliminar conciliaciones.
        </Alert>
      )}

      {/* Layout de 3 columnas */}
      <Grid container spacing={2} sx={{ minHeight: 600 }}>
        {/* Columna izquierda: Extracto */}
        <Grid item xs={12} md={4}>
          <UnmatchedLinesPanel
            lines={unmatchedLines}
            selectedLine={selectedLine}
            onSelectLine={handleSelectLine}
            isLoading={isLoadingLines}
            readOnly={readOnly}
            preselectedLineId={preselectedLineId || undefined}
          />
        </Grid>

        {/* Columna central: Compositor */}
        <Grid item xs={12} md={4}>
          <MatchComposer
            selectedLine={selectedLine}
            selectedMovement={selectedMovement}
            onCreateMatch={handleCreateMatch}
            isCreating={isCreatingMatch}
            readOnly={readOnly}
          />
        </Grid>

        {/* Columna derecha: Movimientos */}
        <Grid item xs={12} md={4}>
          <UnmatchedMovementsPanel
            movements={unmatchedMovements}
            selectedMovement={selectedMovement}
            onSelectMovement={handleSelectMovement}
            isLoading={isLoadingMovements}
            readOnly={readOnly}
            preselectedMovementId={preselectedMovementId || undefined}
          />
        </Grid>
      </Grid>

      {/* Matches Drawer */}
      <MatchesDrawer
        open={matchesDrawerOpen}
        onClose={() => setMatchesDrawerOpen(false)}
        matches={matches}
        onDeleteMatch={handleDeleteMatch}
        isLoading={isLoadingMatches}
        isDeletingId={deletingMatchId}
        readOnly={readOnly}
      />
    </Stack>
  );
}
