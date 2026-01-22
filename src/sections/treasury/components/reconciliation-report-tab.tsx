import { useState } from 'react';
import { Container, Stack, Alert, AlertTitle, Button, MenuItem, CircularProgress } from '@mui/material';
import { enqueueSnackbar } from 'notistack';

import Iconify from 'src/components/iconify';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook/use-router';
import { useGetReconciliationReportQuery } from 'src/redux/services/bankReconciliationsApi';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { LoadingScreen } from 'src/components/loading-screen';

import type { BankReconciliation } from '../types';

import ReportSummaryCards from './report-summary-cards';
import MovementTypesTable from './movement-types-table';
import UnmatchedLinesTable from './unmatched-lines-table';
import UnmatchedMovementsTable from './unmatched-movements-table';
import AdjustmentInfoCard from './adjustment-info-card';

// ----------------------------------------------------------------------

type Props = {
  reconciliation: BankReconciliation;
};

// ----------------------------------------------------------------------

export default function ReconciliationReportTab({ reconciliation }: Props) {
  const router = useRouter();
  const popover = usePopover();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: report, isLoading, error } = useGetReconciliationReportQuery(reconciliation.id);

  const isDraft = reconciliation.status === 'draft';
  const isInProgress = reconciliation.status === 'in_progress';
  const isCompleted = reconciliation.status === 'completed';
  const isPreliminary = isDraft || isInProgress;

  // Handlers
  const handleGoToTimeline = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=timeline`);
  };

  const handleGoToMatching = () => {
    router.push(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=manual-match`);
  };

  const handleViewAdjustmentEntry = () => {
    if (report?.adjustment_entry_id) {
      // TODO: Navigate to journal entry detail when route is available
      // router.push(paths.dashboard.accounting.journalEntryDetail(report.adjustment_entry_id));
      enqueueSnackbar('Navegación a asiento contable próximamente', { variant: 'info' });
    }
  };

  const downloadAsJSON = () => {
    if (!report) return;

    try {
      const dataStr = JSON.stringify(report, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conciliacion-${reconciliation.id}-reporte.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      enqueueSnackbar('Reporte descargado como JSON', { variant: 'success' });
    } catch (err) {
      console.error('Error downloading JSON:', err);
      enqueueSnackbar('Error al descargar JSON', { variant: 'error' });
    }
  };

  const downloadAsCSV = () => {
    if (!report) return;

    try {
      setIsDownloading(true);

      // Si hay líneas sin conciliar, crear CSV de líneas
      if (report.unmatched_lines && report.unmatched_lines.length > 0) {
        const linesCSV = [
          ['Fecha', 'Descripción', 'Referencia', 'Débito', 'Crédito', 'Saldo'].join(','),
          ...report.unmatched_lines.map((line) =>
            [
              line.statement_date,
              `"${line.description || ''}"`,
              `"${line.reference || ''}"`,
              line.debit,
              line.credit,
              line.balance || ''
            ].join(',')
          )
        ].join('\n');

        const blob1 = new Blob([linesCSV], { type: 'text/csv;charset=utf-8;' });
        const url1 = URL.createObjectURL(blob1);
        const link1 = document.createElement('a');
        link1.href = url1;
        link1.download = `conciliacion-${reconciliation.id}-lineas-sin-conciliar.csv`;
        document.body.appendChild(link1);
        link1.click();
        document.body.removeChild(link1);
        URL.revokeObjectURL(url1);
      }

      // Si hay movimientos sin conciliar, crear CSV de movimientos
      if (report.unmatched_movements && report.unmatched_movements.length > 0) {
        const movementsCSV = [
          ['Fecha', 'Tipo', 'Origen', 'Referencia', 'Monto'].join(','),
          ...report.unmatched_movements.map((mov) =>
            [
              mov.movement_date,
              mov.movement_type,
              mov.source_module,
              `"${mov.source_reference || ''}"`,
              mov.amount
            ].join(',')
          )
        ].join('\n');

        const blob2 = new Blob([movementsCSV], { type: 'text/csv;charset=utf-8;' });
        const url2 = URL.createObjectURL(blob2);
        const link2 = document.createElement('a');
        link2.href = url2;
        link2.download = `conciliacion-${reconciliation.id}-movimientos-sin-conciliar.csv`;
        document.body.appendChild(link2);
        link2.click();
        document.body.removeChild(link2);
        URL.revokeObjectURL(url2);
      }

      // Si no hay arrays, crear CSV de resumen
      if (
        (!report.unmatched_lines || report.unmatched_lines.length === 0) &&
        (!report.unmatched_movements || report.unmatched_movements.length === 0)
      ) {
        const summaryCSV = [
          ['Métrica', 'Valor'].join(','),
          ['Total Líneas Extracto', report.summary.total_statement_lines].join(','),
          ['Líneas Conciliadas', report.summary.reconciled_lines].join(','),
          ['Líneas Sin Conciliar', report.summary.unreconciled_lines].join(','),
          ['Porcentaje Conciliación', `${report.summary.reconciliation_percentage}%`].join(','),
          ['Diferencia Saldo', report.summary.balance_difference].join(','),
          ['Cuadrado', report.summary.is_balanced ? 'Sí' : 'No'].join(',')
        ].join('\n');

        const blob = new Blob([summaryCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `conciliacion-${reconciliation.id}-resumen.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      enqueueSnackbar('Reporte descargado como CSV', { variant: 'success' });
    } catch (err) {
      console.error('Error downloading CSV:', err);
      enqueueSnackbar('Error al descargar CSV', { variant: 'error' });
    } finally {
      setIsDownloading(false);
      popover.onClose();
    }
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLElement>) => {
    popover.onOpen(event);
  };

  // Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Error state
  if (error || !report) {
    return (
      <Container maxWidth="lg">
        <CustomBreadcrumbs
          heading="Reporte de Conciliación"
          links={[
            { name: 'Tesorería', href: paths.dashboard.treasury.root },
            { name: 'Conciliaciones', href: paths.dashboard.treasury.reconciliations },
            { name: 'Reporte' }
          ]}
          sx={{ mb: 3 }}
        />

        <Alert severity="error">
          <AlertTitle>Error al Cargar Reporte</AlertTitle>
          No se pudo obtener el reporte de conciliación. Por favor, intenta nuevamente o contacta a soporte.
        </Alert>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={handleGoToMatching}>
            Volver a Matching
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {/* Header Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:history-bold-duotone" />}
            onClick={handleGoToTimeline}
          >
            Ver Timeline
          </Button>

          {!isCompleted && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="solar:hand-stars-bold-duotone" />}
              onClick={handleGoToMatching}
            >
              Ir a Matching
            </Button>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={
              isDownloading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="eva:download-fill" />
            }
            onClick={handleDownloadClick}
            disabled={isDownloading}
          >
            Descargar
          </Button>
        </Stack>

        {/* Preliminary Warning */}
        {isPreliminary && (
          <Alert severity="info" icon={<Iconify icon="eva:info-fill" width={24} />}>
            <AlertTitle>Reporte Preliminar</AlertTitle>
            Este reporte es preliminar hasta completar la conciliación. Los datos pueden cambiar si se realizan más
            matches.
          </Alert>
        )}

        {/* Summary Cards */}
        <ReportSummaryCards summary={report.summary} />

        {/* Movement Types Table */}
        {report.movement_types && report.movement_types.length > 0 && (
          <MovementTypesTable movements={report.movement_types} />
        )}

        {/* Adjustment Info */}
        {report.summary && (
          <AdjustmentInfoCard
            adjustmentEntryId={report.adjustment_entry_id}
            balanceDifference={report.summary.balance_difference}
            isBalanced={report.summary.is_balanced}
            isCompleted={isCompleted}
            onViewEntry={handleViewAdjustmentEntry}
          />
        )}

        {/* Unmatched Lines */}
        {report.unmatched_lines && (
          <UnmatchedLinesTable
            lines={report.unmatched_lines}
            reconciliationId={reconciliation.id}
            canMatch={!isCompleted}
          />
        )}

        {/* Unmatched Movements */}
        {report.unmatched_movements && (
          <UnmatchedMovementsTable
            movements={report.unmatched_movements}
            reconciliationId={reconciliation.id}
            canMatch={!isCompleted}
          />
        )}
      </Stack>

      {/* Download Menu */}
      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="top-right">
        <MenuItem onClick={downloadAsJSON}>
          <Iconify icon="vscode-icons:file-type-json" />
          Descargar JSON
        </MenuItem>

        <MenuItem onClick={downloadAsCSV} disabled={isDownloading}>
          <Iconify icon="vscode-icons:file-type-excel" />
          Descargar CSV
          {isDownloading && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </MenuItem>
      </CustomPopover>
    </>
  );
}
