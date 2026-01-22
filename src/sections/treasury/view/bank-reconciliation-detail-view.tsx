import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Box, Alert, AlertTitle, Typography, CircularProgress } from '@mui/material';

import { useGetReconciliationByIdQuery } from 'src/redux/services/bankReconciliationsApi';
import { useSettingsContext } from 'src/components/settings';

import ReconciliationDetailHeader from '../components/reconciliation-detail-header';
import ReconciliationSummaryTab from '../components/reconciliation-summary-tab';
import ReconciliationTabs from '../components/reconciliation-tabs';
import ReconciliationImportTab from '../components/reconciliation-import-tab';
import ReconciliationAutoMatchTab from '../components/reconciliation-auto-match-tab';
import ReconciliationManualMatchTab from '../components/reconciliation-manual-match-tab';
import ReconciliationCompleteTab from '../components/reconciliation-complete-tab';
import ReconciliationReportTab from '../components/reconciliation-report-tab';
import ReconciliationTimelineTab from '../components/reconciliation-timeline-tab';

// ----------------------------------------------------------------------

type TabValue = 'summary' | 'import' | 'auto-match' | 'manual' | 'complete' | 'report' | 'timeline';

// Helper functions for error messages
const getErrorTitle = (status: number): string => {
  if (status === 404) return 'Conciliación no encontrada';
  if (status === 403) return 'No tienes permisos';
  return 'Error al cargar la conciliación';
};

const getErrorMessage = (status: number): string => {
  if (status === 404) return 'La conciliación que buscas no existe o fue eliminada.';
  if (status === 403) return 'No tienes permisos para acceder a esta conciliación.';
  return 'Ocurrió un error al cargar los datos. Por favor, intenta nuevamente.';
};

// ----------------------------------------------------------------------

export default function BankReconciliationDetailView() {
  const settings = useSettingsContext();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  // Get step from query params for deep-link
  const stepParam = searchParams.get('step') as TabValue | null;
  const [currentTab, setCurrentTab] = useState<TabValue>(stepParam || 'summary');

  // Fetch reconciliation data
  const { data, isLoading, error, refetch } = useGetReconciliationByIdQuery(id!, {
    skip: !id
  });

  const reconciliation = data;

  // Update tab if step param changes
  useEffect(() => {
    if (stepParam) {
      setCurrentTab(stepParam);
    }
  }, [stepParam]);

  // Handle tab change
  const handleTabChange = (newTab: TabValue) => {
    setCurrentTab(newTab);
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error states
  if (error) {
    const status = (error as any)?.status;

    return (
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <Box sx={{ py: 5 }}>
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <Typography
                variant="subtitle2"
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => refetch()}
              >
                Reintentar
              </Typography>
            }
          >
            <AlertTitle>{getErrorTitle(status)}</AlertTitle>
            <Typography variant="body2">{getErrorMessage(status)}</Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!reconciliation) {
    return null;
  }

  // Check if read-only based on status
  const isReadOnly = reconciliation.status === 'reversed';
  const isCompleted = reconciliation.status === 'completed';

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      {/* Header with actions */}
      <ReconciliationDetailHeader reconciliation={reconciliation} onRefresh={refetch} />

      {/* Read-only warning for reversed */}
      {isReadOnly && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Conciliación Revertida</AlertTitle>
          <Typography variant="body2">
            Esta conciliación fue revertida el {new Date(reconciliation.reversed_at!).toLocaleDateString('es-CO')}.
            {reconciliation.reversal_reason && ` Motivo: ${reconciliation.reversal_reason}`}
          </Typography>
        </Alert>
      )}

      {/* Tabs Navigation */}
      <ReconciliationTabs
        currentTab={currentTab}
        onChange={handleTabChange}
        reconciliation={reconciliation}
        isReadOnly={isReadOnly}
        isCompleted={isCompleted}
      />

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {currentTab === 'summary' && <ReconciliationSummaryTab reconciliation={reconciliation} />}
        {currentTab === 'import' && <ReconciliationImportTab reconciliation={reconciliation} onRefresh={refetch} />}
        {currentTab === 'auto-match' && (
          <ReconciliationAutoMatchTab reconciliation={reconciliation} onRefresh={refetch} />
        )}
        {currentTab === 'manual' && <ReconciliationManualMatchTab reconciliation={reconciliation} />}
        {currentTab === 'complete' && <ReconciliationCompleteTab reconciliation={reconciliation} />}
        {currentTab === 'report' && <ReconciliationReportTab reconciliation={reconciliation} />}
        {currentTab === 'timeline' && <ReconciliationTimelineTab reconciliation={reconciliation} />}
      </Box>
    </Container>
  );
}
