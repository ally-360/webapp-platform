import sumBy from 'lodash/sumBy';
import React, { useState, useCallback, useMemo } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Divider,
  Tooltip,
  Container,
  TableBody,
  IconButton,
  TableContainer,
  useMediaQuery,
  Box
} from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
//
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
// Redux
import { useGetSalesInvoicesQuery, useDeleteSalesInvoiceMutation } from 'src/redux/services/salesInvoicesApi';
//
import InvoiceAnalytic from '../invoice-analytic';
import InvoiceTableRow from '../invoice-table-row';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'number', label: 'Número' },
  { id: 'customer', label: 'Cliente' },
  { id: 'issue_date', label: 'Fecha emisión' },
  { id: 'due_date', label: 'Vencimiento' },
  { id: 'total_amount', label: 'Total' },
  { id: 'paid_amount', label: 'Pagado' },
  { id: 'balance_due', label: 'Por pagar' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null as Date | null,
  endDate: null as Date | null
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'issue_date' });
  const confirm = useBoolean(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  const [filters, setFilters] = useState(defaultFilters);

  // RTK Query hooks
  const {
    data: invoicesData,
    isLoading,
    isError,
    refetch
  } = useGetSalesInvoicesQuery({
    page: table.page + 1,
    limit: table.rowsPerPage,
    status: filters.status === 'all' ? undefined : filters.status,
    start_date: filters.startDate?.toISOString().split('T')[0],
    end_date: filters.endDate?.toISOString().split('T')[0]
  });

  const [deleteSalesInvoice] = useDeleteSalesInvoiceMutation();

  // Data processing
  const tableData = useMemo(() => invoicesData?.invoices || [], [invoicesData]);
  const totalCount = invoicesData?.total || 0;

  const dateError =
    filters.startDate && filters.endDate ? filters.startDate.getTime() > filters.endDate.getTime() : false;

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters,
        dateError
      }),
    [tableData, table.order, table.orderBy, filters, dateError]
  );

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

  const canReset =
    !!filters.name ||
    !!filters.service.length ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const getInvoiceLength = (status: string) => tableData.filter((item) => item.status === status).length;

  const getTotalAmount = (status: string) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      (item) => parseFloat(item.total_amount)
    );

  const getPercentByStatus = (status: string) => (getInvoiceLength(status) / tableData.length) * 100;

  const TABS = [
    { value: 'all', label: 'Todas', color: 'default' as const, count: tableData.length },
    { value: 'open', label: 'Abiertas', color: 'info' as const, count: getInvoiceLength('OPEN') },
    { value: 'paid', label: 'Pagadas', color: 'success' as const, count: getInvoiceLength('PAID') },
    { value: 'cancelled', label: 'Canceladas', color: 'error' as const, count: getInvoiceLength('CANCELLED') },
    { value: 'draft', label: 'Borrador', color: 'warning' as const, count: getInvoiceLength('DRAFT') }
  ];

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value
      }));
    },
    [table]
  );

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteSalesInvoice(id).unwrap();
        enqueueSnackbar('Factura eliminada correctamente', { variant: 'success' });
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        enqueueSnackbar('Error al eliminar la factura', { variant: 'error' });
      }
    },
    [deleteSalesInvoice, table, dataInPage.length]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = table.selected.map((id) => deleteSalesInvoice(id).unwrap());
      await Promise.all(deletePromises);
      enqueueSnackbar('Facturas eliminadas correctamente', { variant: 'success' });
      table.onUpdatePageDeleteRows({
        totalRows: totalCount,
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length
      });
    } catch (error) {
      console.error('Error deleting invoices:', error);
      enqueueSnackbar('Error al eliminar las facturas', { variant: 'error' });
    }
  }, [deleteSalesInvoice, table, totalCount, dataInPage.length, dataFiltered.length]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.sales.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.sales.details(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Facturas de venta')}
          icon="solar:bill-list-bold-duotone"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root
            },
            {
              name: 'Facturas de venta',
              href: paths.dashboard.sales.root
            },
            {
              name: 'Lista'
            }
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.sales.newSale}
              sx={isMobile ? { width: '100%' } : undefined}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              {t('Nueva factura')}
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        <Card
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        >
          <Box sx={{ overflow: 'auto' }}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, (item) => parseFloat(item.total_amount))}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Abiertas"
                total={getInvoiceLength('open')}
                percent={getPercentByStatus('open')}
                price={getTotalAmount('open')}
                icon="solar:file-check-bold-duotone"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Pagadas"
                total={getInvoiceLength('paid')}
                percent={getPercentByStatus('paid')}
                price={getTotalAmount('paid')}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.palette.success.main}
              />

              <InvoiceAnalytic
                title="Canceladas"
                total={getInvoiceLength('cancelled')}
                percent={getPercentByStatus('cancelled')}
                price={getTotalAmount('cancelled')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.palette.error.main}
              />
            </Stack>
          </Box>
        </Card>

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'}
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            dateError={dateError}
            serviceOptions={[]}
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Box sx={{ overflow: 'auto' }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Box>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

interface FilterProps {
  inputData: any[];
  comparator: (a: any, b: any) => number;
  filters: {
    name: string;
    service: string[];
    status: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  dateError: boolean;
}

function applyFilter({ inputData, comparator, filters, dateError }: FilterProps) {
  const { name, status, service, startDate, endDate } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.number.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        (invoice.customer?.name && invoice.customer.name.toLowerCase().indexOf(name.toLowerCase()) !== -1)
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    // For now, we'll skip service filtering since the API structure is different
    // inputData = inputData.filter((invoice) => invoice.line_items?.some((item) => service.includes(item.name)));
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter(
      (invoice) => new Date(invoice.issue_date) >= startDate && new Date(invoice.issue_date) <= endDate
    );
  }

  return inputData;
}
