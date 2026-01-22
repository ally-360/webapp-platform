/* eslint-disable import/no-duplicates */
import { useNavigate } from 'react-router-dom';
import { Stack, Button, Chip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { paths } from 'src/routes/paths';

import type { BankReconciliation } from '../types';

// ----------------------------------------------------------------------

type Props = {
  reconciliation: BankReconciliation;
  onRefresh: () => void;
};

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'default' as const },
  in_progress: { label: 'En Proceso', color: 'info' as const },
  completed: { label: 'Completada', color: 'success' as const },
  reversed: { label: 'Revertida', color: 'error' as const }
};

// ----------------------------------------------------------------------

export default function ReconciliationDetailHeader({ reconciliation, onRefresh }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const statusConfig = STATUS_CONFIG[reconciliation.status as keyof typeof STATUS_CONFIG] || {
    label: 'Desconocido',
    color: 'default' as const
  };

  const formatPeriod = () => {
    try {
      const start = format(new Date(reconciliation.period_start_date), 'dd MMM yyyy', {
        locale: es
      });
      const end = format(new Date(reconciliation.period_end_date), 'dd MMM yyyy', { locale: es });
      return `${start} - ${end}`;
    } catch {
      return `${reconciliation.period_start_date} - ${reconciliation.period_end_date}`;
    }
  };

  const handleBack = () => {
    navigate(paths.dashboard.treasury.reconciliations);
  };

  const handleImportStatement = () => {
    // Navigate to same page with step=import
    navigate(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=import`);
  };

  const handleViewReport = () => {
    navigate(`${paths.dashboard.treasury.reconciliationDetails(reconciliation.id)}?step=report`);
  };

  const handleReverse = () => {
    // TODO: Open reverse modal
    console.log('Open reverse modal');
  };

  const canImport = reconciliation.status === 'draft' || reconciliation.status === 'in_progress';
  const canReverse = reconciliation.status === 'completed';
  const canViewReport = reconciliation.status === 'completed';

  const accountInfo = `${reconciliation.bank_account?.name || 'Cuenta bancaria'}${
    reconciliation.bank_account?.code ? ` (${reconciliation.bank_account.code})` : ''
  }`;

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Conciliación Bancaria</Typography>
        <Chip label={statusConfig.label} color={statusConfig.color} size="small" />
      </Stack>

      <CustomBreadcrumbs
        heading={accountInfo}
        subHeading={formatPeriod()}
        icon="solar:document-text-bold-duotone"
        links={[
          { name: t('dashboard', 'Dashboard'), href: paths.dashboard.root },
          { name: t('treasury.title', 'Tesorería'), href: paths.dashboard.treasury.root },
          {
            name: t('treasury.bankReconciliations.title', 'Conciliaciones Bancarias'),
            href: paths.dashboard.treasury.reconciliations
          },
          { name: `Conciliación #${reconciliation.id?.slice(0, 8) || 'N/A'}` }
        ]}
        action={
          <Stack direction="row" spacing={1.5}>
            {/* Back button */}
            <Button variant="outlined" startIcon={<Iconify icon="eva:arrow-back-fill" />} onClick={handleBack}>
              Volver al Listado
            </Button>

            {/* Import statement - draft/in_progress */}
            {canImport && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:upload-bold" />}
                onClick={handleImportStatement}
              >
                Importar Extracto
              </Button>
            )}

            {/* View report - completed */}
            {canViewReport && (
              <Button
                variant="contained"
                color="info"
                startIcon={<Iconify icon="solar:document-text-bold" />}
                onClick={handleViewReport}
              >
                Ver Reporte
              </Button>
            )}

            {/* Reverse - completed */}
            {canReverse && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Iconify icon="solar:undo-left-bold" />}
                onClick={handleReverse}
              >
                Revertir
              </Button>
            )}

            {/* Refresh */}
            <Button variant="outlined" color="inherit" onClick={onRefresh}>
              <Iconify icon="solar:refresh-linear" />
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
    </>
  );
}
