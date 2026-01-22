import { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Button,
  Stack,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Box,
  Typography,
  Alert,
  AlertTitle,
  InputAdornment
} from '@mui/material';
import { Icon } from '@iconify/react';
import { useRouter, useSearchParams } from 'src/routes/hook';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';

// Components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
// RTK Query
import { useGetReconciliationsQuery, useDeleteReconciliationMutation } from 'src/redux/services/bankReconciliationsApi';
import { useGetAccountsQuery } from 'src/redux/services/treasuryApi';

// Routes
import { paths } from 'src/routes/paths';

// Local components
import ReconciliationsTable from '../components/reconciliations-table';

// Types
import type { ReconciliationFilters, ReconciliationStatus } from '../types';

// ----------------------------------------------------------------------

const STATUS_OPTIONS: Array<{ value: ReconciliationStatus | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'in_progress', label: 'En Proceso' },
  { value: 'completed', label: 'Completada' },
  { value: 'reversed', label: 'Revertida' }
];

// ----------------------------------------------------------------------

export default function BankReconciliationsListView() {
  const settings = useSettingsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Filter state
  const [filters, setFilters] = useState<ReconciliationFilters>({
    limit: 50,
    offset: 0
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedAccount, setSelectedAccount] = useState(searchParams.get('account') || '');
  const [selectedStatus, setSelectedStatus] = useState<ReconciliationStatus | ''>(
    (searchParams.get('status') as ReconciliationStatus) || ''
  );
  const [dateRange, setDateRange] = useState<{
    from_date: string | null;
    to_date: string | null;
  }>({
    from_date: searchParams.get('from_date') || null,
    to_date: searchParams.get('to_date') || null
  });

  // Fetch data
  const { data, isLoading, error } = useGetReconciliationsQuery(filters);
  const { data: accountsData } = useGetAccountsQuery({ type: 'bank' });
  const [deleteReconciliation] = useDeleteReconciliationMutation();

  const reconciliations = data?.reconciliations || [];
  const total = data?.total || 0;
  const isEmpty = reconciliations.length === 0 && !isLoading;

  const bankAccounts = accountsData?.accounts || [];

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters: ReconciliationFilters = {
      limit: rowsPerPage,
      offset: page * rowsPerPage
    };

    const account = searchParams.get('account');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    if (account) urlFilters.bank_account_id = account;
    if (status) urlFilters.status_filter = status as ReconciliationStatus;
    if (fromDate) urlFilters.from_date = fromDate;
    if (toDate) urlFilters.to_date = toDate;

    setFilters(urlFilters);
  }, [searchParams, page, rowsPerPage]);

  // Handle filter changes
  const handleApplyFilters = useCallback(() => {
    // Reset to first page
    setPage(0);

    const newFilters: ReconciliationFilters = {
      limit: rowsPerPage,
      offset: 0
    };

    // Build URL params
    const params = new URLSearchParams();

    if (selectedAccount) {
      newFilters.bank_account_id = selectedAccount;
      params.set('account', selectedAccount);
    }

    if (selectedStatus) {
      newFilters.status_filter = selectedStatus;
      params.set('status', selectedStatus);
    }

    if (dateRange.from_date) {
      newFilters.from_date = dateRange.from_date;
      params.set('from_date', dateRange.from_date);
    }

    if (dateRange.to_date) {
      newFilters.to_date = dateRange.to_date;
      params.set('to_date', dateRange.to_date);
    }

    // Update URL
    router.replace(`${paths.dashboard.treasury.reconciliations}?${params.toString()}`);

    setFilters(newFilters);
  }, [selectedAccount, selectedStatus, dateRange, rowsPerPage, router]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAccount('');
    setSelectedStatus('');
    setDateRange({ from_date: null, to_date: null });
    setPage(0);
    setFilters({ limit: rowsPerPage, offset: 0 });

    // Clear URL params
    router.replace(paths.dashboard.treasury.reconciliations);
  };

  const handleCreateReconciliation = () => {
    router.push(paths.dashboard.treasury.reconciliationNew);
  };

  const handleViewReconciliation = (id: string) => {
    router.push(paths.dashboard.treasury.reconciliationDetails(id));
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    setFilters((prev) => ({ ...prev, offset: newPage * rowsPerPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    setFilters((prev) => ({ ...prev, limit: newRowsPerPage, offset: 0 }));
  };

  const handleDeleteReconciliation = async (id: string, accountName: string) => {
    try {
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas eliminar la conciliación de ${accountName}? Esta acción no se puede deshacer.`
      );

      if (confirmed) {
        await deleteReconciliation(id).unwrap();
        enqueueSnackbar('Conciliación eliminada exitosamente', { variant: 'success' });
      }
    } catch (err) {
      console.error('Error deleting reconciliation:', err);
      enqueueSnackbar('Error al eliminar la conciliación', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <CustomBreadcrumbs
        heading={t('treasury.bankReconciliations.title', 'Conciliaciones Bancarias')}
        subHeading="Cuadra tus movimientos registrados con el extracto del banco"
        icon="solar:check-square-bold-duotone"
        links={[
          { name: t('dashboard', 'Dashboard'), href: paths.dashboard.root },
          { name: t('treasury.title', 'Tesorería'), href: paths.dashboard.treasury.root },
          { name: t('treasury.bankReconciliations.title', 'Conciliaciones Bancarias') }
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Icon icon="mingcute:add-line" />}
            onClick={handleCreateReconciliation}
            color="primary"
          >
            {t('treasury.bankReconciliations.newReconciliation', 'Nueva Conciliación')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<Iconify icon="solar:info-circle-bold" />}>
        <AlertTitle>{t('treasury.bankReconciliations.infoTitle', 'Conciliaciones Bancarias')}</AlertTitle>
        <Typography variant="body2">
          {t(
            'treasury.bankReconciliations.infoDescription',
            'Gestiona y revisa las conciliaciones bancarias para asegurar que los registros contables coincidan con los extractos bancarios. Identifica diferencias y realiza ajustes necesarios.'
          )}
        </Typography>
      </Alert>

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:filter-bold-duotone" width={24} />
              {t('common.filters', 'Filtros')}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* Search */}
              <TextField
                fullWidth
                placeholder={t('treasury.bankReconciliations.searchPlaceholder', 'Buscar por nombre o referencia...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  )
                }}
              />

              {/* Bank Account */}
              <TextField
                select
                fullWidth
                label={t('treasury.bankReconciliations.bankAccount', 'Cuenta Bancaria')}
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                <MenuItem value="">{t('common.all', 'Todas')}</MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Status */}
              <TextField
                select
                fullWidth
                label={t('common.status', 'Estado')}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReconciliationStatus | '')}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Date Range */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label={t('common.fromDate', 'Desde')}
                type="date"
                value={dateRange.from_date || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, from_date: e.target.value || null }))}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label={t('common.toDate', 'Hasta')}
                type="date"
                value={dateRange.to_date || ''}
                onChange={(e) => setDateRange((prev) => ({ ...prev, to_date: e.target.value || null }))}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:refresh-linear" />}
                onClick={handleClearFilters}
              >
                {t('common.clearFilters', 'Limpiar Filtros')}
              </Button>
              <Button variant="contained" startIcon={<Iconify icon="solar:filter-bold" />} onClick={handleApplyFilters}>
                {t('common.applyFilters', 'Aplicar Filtros')}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {!isEmpty && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {`Mostrando ${total} resultado(s)`}
          </Typography>
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
          {t(
            'treasury.bankReconciliations.loadError',
            'Ocurrió un error al cargar las conciliaciones. Por favor, intenta nuevamente.'
          )}
        </Alert>
      )}

      {/* Empty state */}
      {isEmpty && !error && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Stack spacing={3} alignItems="center">
            <Iconify icon="solar:check-square-bold-duotone" width={120} sx={{ color: 'text.disabled', opacity: 0.3 }} />
            <Stack spacing={1}>
              <Typography variant="h5" color="text.secondary">
                {t('treasury.bankReconciliations.noReconciliations', 'No hay conciliaciones bancarias')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t(
                  'treasury.bankReconciliations.createFirstMessage',
                  'Crea tu primera conciliación bancaria para comenzar a verificar tus registros con los extractos bancarios.'
                )}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleCreateReconciliation}
              size="large"
            >
              {t('treasury.bankReconciliations.createFirst', 'Crear Primera Conciliación')}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Reconciliations Table */}
      {!isEmpty && (
        <ReconciliationsTable
          reconciliations={reconciliations}
          isLoading={isLoading}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          onView={handleViewReconciliation}
          onDelete={handleDeleteReconciliation}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Container>
  );
}
