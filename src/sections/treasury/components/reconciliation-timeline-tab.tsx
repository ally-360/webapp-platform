import {
  Container,
  Stack,
  Card,
  CardHeader,
  CardContent,
  Button,
  Alert,
  AlertTitle,
  Typography,
  IconButton
} from '@mui/material';
import { useRouter } from 'src/routes/hook/use-router';
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'notistack';
import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetReconciliationTimelineQuery } from 'src/redux/services/bankReconciliationsApi';
import type { BankReconciliation, TimelineEvent } from 'src/sections/treasury/types';
import TimelineDayGroup from './timeline-day-group';

// ----------------------------------------------------------------------

interface ReconciliationTimelineTabProps {
  reconciliation: BankReconciliation;
}

// Utility: Group events by day
function groupEventsByDay(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const grouped = new Map<string, TimelineEvent[]>();

  events.forEach((event) => {
    const date = new Date(event.occurred_at);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(event);
  });

  // Sort events within each day by time (descending)
  grouped.forEach((dayEvents) => {
    dayEvents.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
  });

  return grouped;
}

export default function ReconciliationTimelineTab({ reconciliation }: ReconciliationTimelineTabProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: timelineData,
    isLoading,
    error,
    refetch,
    isFetching
  } = useGetReconciliationTimelineQuery(reconciliation.id);

  const handleGoToReport = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=report`);
  };

  const handleGoToMatching = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=manual`);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      enqueueSnackbar('Timeline actualizado', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Error al actualizar', { variant: 'error' });
    }
  };

  const handleViewMatches = (eventId: string) => {
    // Navigate to matches with filter
    router.push(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=manual`);
    enqueueSnackbar('Ir a matches', { variant: 'info' });
  };

  const handleViewImport = (eventId: string) => {
    // Navigate to import tab
    router.push(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=import`);
    enqueueSnackbar('Ir a importación', { variant: 'info' });
  };

  const handleViewAdjustment = (journalEntryId: string) => {
    // TODO: Navigate to accounting journal entry detail when route is available
    enqueueSnackbar(`Ver asiento contable ${journalEntryId} (ruta pendiente en módulo de contabilidad)`, {
      variant: 'info'
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="Timeline / Auditoría"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: 'Conciliaciones', href: paths.dashboard.treasury.reconciliations },
            { name: 'Timeline' }
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        >
          <AlertTitle>Error al cargar el historial</AlertTitle>
          No pudimos cargar los eventos de esta conciliación. Por favor, intenta de nuevo.
        </Alert>
      </Container>
    );
  }

  const events = timelineData?.events || [];
  const groupedEvents = groupEventsByDay(events);
  const sortedDays = Array.from(groupedEvents.keys()).sort((a, b) => b.localeCompare(a)); // Descending

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Stack spacing={3} sx={{ mb: { xs: 3, md: 5 } }}>
        <CustomBreadcrumbs
          heading="Timeline / Auditoría"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: 'Conciliaciones', href: paths.dashboard.treasury.reconciliations },
            {
              name: reconciliation.bank_account?.name || 'Conciliación',
              href: paths.dashboard.treasury.reconciliationDetails(reconciliation.id)
            },
            { name: 'Timeline' }
          ]}
        />

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:chart-2-bold-duotone" />}
            onClick={handleGoToReport}
          >
            Ver Reporte
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:link-minimalistic-2-bold-duotone" />}
            onClick={handleGoToMatching}
          >
            Ir a Matching
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:refresh-bold" />}
            onClick={handleRefresh}
            disabled={isFetching}
          >
            Actualizar
          </Button>
        </Stack>
      </Stack>

      {/* Timeline Content */}
      <Card>
        <CardHeader
          avatar={<Iconify icon="solar:history-bold-duotone" width={32} />}
          title={`Historial de Eventos (${events.length})`}
          subheader="Trazabilidad completa de la conciliación bancaria"
          action={
            <IconButton onClick={handleRefresh} disabled={isFetching}>
              <Iconify icon="solar:refresh-bold" />
            </IconButton>
          }
        />

        <CardContent>
          {/* Empty State */}
          {events.length === 0 && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ p: 3, borderRadius: 1, bgcolor: 'background.neutral' }}
            >
              <Iconify icon="solar:inbox-line-bold-duotone" width={48} sx={{ color: 'text.disabled' }} />
              <Stack>
                <Typography variant="subtitle2" color="text.secondary">
                  Aún no hay eventos registrados
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Los eventos se mostrarán aquí a medida que se procese la conciliación.
                </Typography>
              </Stack>
            </Stack>
          )}

          {/* Timeline Groups */}
          {sortedDays.length > 0 && (
            <Stack spacing={3}>
              {sortedDays.map((dateKey) => (
                <TimelineDayGroup
                  key={dateKey}
                  date={dateKey}
                  events={groupedEvents.get(dateKey)!}
                  onViewMatches={handleViewMatches}
                  onViewImport={handleViewImport}
                  onViewAdjustment={handleViewAdjustment}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
