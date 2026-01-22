import { useState } from 'react';
import {
  Box,
  Card,
  Stack,
  Alert,
  AlertTitle,
  Typography,
  Button,
  Popover,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import {
  useRunAutoMatchMutation,
  useGetMatchesQuery,
  useGetUnmatchedLinesQuery,
  useGetUnmatchedMovementsQuery
} from 'src/redux/services/bankReconciliationsApi';
import type { BankReconciliation, MatchesFilters } from 'src/sections/treasury/types';
import { paths } from 'src/routes/paths';

import AutoMatchHeaderKpis from './auto-match-header-kpis';
import MatchesTable from './matches-table';
import UnmatchedPanels from './unmatched-panels';

// ----------------------------------------------------------------------

interface Props {
  reconciliation: BankReconciliation;
  onRefresh: () => void;
}

export default function ReconciliationAutoMatchTab({ reconciliation, onRefresh }: Props) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [rulesAnchorEl, setRulesAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [matchFilters, setMatchFilters] = useState<MatchesFilters>({
    limit: 50,
    offset: 0
  });

  // Mutations & Queries
  const [runAutoMatch, { isLoading: isRunningAutoMatch }] = useRunAutoMatchMutation();

  const {
    data: matchesData,
    isLoading: isLoadingMatches,
    refetch: refetchMatches
  } = useGetMatchesQuery({ reconciliationId: reconciliation.id, filters: matchFilters }, { skip: !reconciliation.id });

  const {
    data: unmatchedLinesData,
    isLoading: isLoadingUnmatchedLines,
    refetch: refetchUnmatchedLines
  } = useGetUnmatchedLinesQuery({ reconciliationId: reconciliation.id, limit: 10 }, { skip: !reconciliation.id });

  const {
    data: unmatchedMovementsData,
    isLoading: isLoadingUnmatchedMovements,
    refetch: refetchUnmatchedMovements
  } = useGetUnmatchedMovementsQuery({ reconciliationId: reconciliation.id, limit: 10 }, { skip: !reconciliation.id });

  // Computed
  const isReadOnly = ['completed', 'reversed'].includes(reconciliation.status);
  const hasNoLines = reconciliation.total_statement_lines === 0;
  const canExecuteAutoMatch = !isReadOnly && !hasNoLines;
  const hasMatches = matchesData && matchesData.total > 0;
  const hasUnmatchedLines = reconciliation.unreconciled_lines > 0;

  // Handlers
  const handleOpenRules = (event: React.MouseEvent<HTMLButtonElement>) => {
    setRulesAnchorEl(event.currentTarget);
  };

  const handleCloseRules = () => {
    setRulesAnchorEl(null);
  };

  const handleExecuteAutoMatch = async () => {
    try {
      const result = await runAutoMatch(reconciliation.id).unwrap();

      enqueueSnackbar(result.message || `Auto-match completado: ${result.matched_count} coincidencias encontradas`, {
        variant: 'success'
      });

      // Refresh all data
      await Promise.all([onRefresh(), refetchMatches(), refetchUnmatchedLines(), refetchUnmatchedMovements()]);
    } catch (error: any) {
      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al ejecutar auto-match';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleGoToImport = () => {
    navigate(`${paths.dashboard.treasury.reconciliations}/${reconciliation.id}?step=import`);
  };

  const handleGoToManualMatch = () => {
    navigate(`${paths.dashboard.treasury.reconciliations}/${reconciliation.id}?step=manual`);
  };

  const handleFilterChange = (newFilters: Partial<MatchesFilters>) => {
    setMatchFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Loading state
  if (isLoadingMatches && !hasMatches) {
    return <LoadingScreen />;
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Auto-match
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compara extracto vs libros (Tesorería/Pagos) y propone coincidencias automáticas
            </Typography>
          </Box>

          {/* KPIs */}
          <AutoMatchHeaderKpis reconciliation={reconciliation} />

          {/* Actions */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={isRunningAutoMatch ? <Iconify icon="eos-icons:loading" /> : <Iconify icon="solar:play-bold" />}
              onClick={handleExecuteAutoMatch}
              disabled={!canExecuteAutoMatch || isRunningAutoMatch}
            >
              {hasMatches ? 'Re-ejecutar auto-match' : 'Ejecutar auto-match'}
            </Button>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:info-circle-bold" />}
              onClick={handleOpenRules}
            >
              Ver reglas
            </Button>
          </Stack>

          {/* Validation messages */}
          {hasNoLines && reconciliation.status === 'draft' && (
            <Alert severity="warning" action={<Button onClick={handleGoToImport}>Ir a importar</Button>}>
              <AlertTitle>No hay líneas importadas</AlertTitle>
              Primero importa el extracto bancario para poder ejecutar el auto-match
            </Alert>
          )}

          {isReadOnly && (
            <Alert severity="info">
              <AlertTitle>Modo solo lectura</AlertTitle>
              Esta conciliación está {reconciliation.status === 'completed' ? 'completada' : 'revertida'} y no se pueden
              ejecutar más acciones
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Matches Table */}
      {hasMatches && (
        <Card>
          <MatchesTable
            matches={matchesData.matches}
            total={matchesData.total}
            filters={matchFilters}
            onFilterChange={handleFilterChange}
            isLoading={isLoadingMatches}
          />
        </Card>
      )}

      {/* Unmatched Panels */}
      {hasUnmatchedLines && (
        <UnmatchedPanels
          unmatchedLines={unmatchedLinesData?.lines || []}
          unmatchedMovements={unmatchedMovementsData?.movements || []}
          totalLines={unmatchedLinesData?.total || 0}
          totalMovements={unmatchedMovementsData?.total || 0}
          isLoadingLines={isLoadingUnmatchedLines}
          isLoadingMovements={isLoadingUnmatchedMovements}
          onGoToManual={handleGoToManualMatch}
        />
      )}

      {/* CTA Footer */}
      {hasMatches && (
        <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" gutterBottom>
                {hasUnmatchedLines ? 'Continuar con matching manual' : '¡Conciliación completa!'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasUnmatchedLines
                  ? `Quedan ${reconciliation.unreconciled_lines} líneas sin conciliar`
                  : 'Todas las líneas han sido conciliadas correctamente'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              endIcon={<Iconify icon="eva:arrow-forward-fill" />}
              onClick={
                hasUnmatchedLines
                  ? handleGoToManualMatch
                  : () => navigate(`${paths.dashboard.treasury.reconciliations}/${reconciliation.id}?step=report`)
              }
            >
              {hasUnmatchedLines ? 'Ir a matching manual' : 'Revisar reporte'}
            </Button>
          </Stack>
        </Card>
      )}

      {/* Rules Popover */}
      <Popover
        open={Boolean(rulesAnchorEl)}
        anchorEl={rulesAnchorEl}
        onClose={handleCloseRules}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="subtitle1" gutterBottom>
            Reglas de Auto-match
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="Coincidencia de monto"
                secondary="Los montos deben coincidir exactamente o dentro de una tolerancia mínima"
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Tolerancia de fecha" secondary="± 3 días hábiles" />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Threshold de score"
                secondary="Se consideran matches automáticos aquellos con score >= 85%"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Referencias y descripciones"
                secondary="Se comparan referencias, números de documento y descripciones usando similitud de texto"
              />
            </ListItem>
          </List>
        </Box>
      </Popover>
    </Stack>
  );
}
