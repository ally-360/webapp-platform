import sumBy from 'lodash/sumBy';
import { useState, useCallback, useEffect, useMemo } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
// redux
import { useSelector } from 'react-redux';
import { selectCurrentUser } from 'src/redux/slices/authSlice';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fTimestamp } from 'src/utils/format-time';
// _mock
import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  getComparator,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
//
import { useTranslation } from 'react-i18next';
import { useGetSalesInvoicesQuery, useDeleteSalesInvoiceMutation } from 'src/redux/services/salesInvoicesApi';
import InvoiceAnalytic from '../invoice-analytic';
import InvoiceTableRow from '../invoice-table-row';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'invoiceNumber', label: 'Cliente' },
  { id: 'createDate', label: 'Creada' },
  { id: 'dueDate', label: 'Vencimiento' },
  { id: 'price', label: 'Valor' },
  { id: 'price', label: 'Cobrado' },
  { id: 'price', label: 'Por cobrar' },
  // { id: 'sent', label: 'Sent', align: 'center' },
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
  const table = useTable({ defaultOrderBy: 'createDate' });
  const confirm = useBoolean(false);
  const { t } = useTranslation();

  // Redux selectors
  const user = useSelector(selectCurrentUser);

  const [filters, setFilters] = useState(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Calcular dateError
  const dateError =
    filters.startDate && filters.endDate ? filters.startDate.getTime() > filters.endDate.getTime() : false;

  // Debounce para búsqueda - solo buscar si tiene al menos 2 caracteres
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.name.length >= 2 || filters.name.length === 0) {
        setDebouncedSearch(filters.name);
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [filters.name]);

  // ========================================
  // 🔥 RTK QUERY - INVOICES
  // ========================================

  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    refetch: refetchInvoices
  } = useGetSalesInvoicesQuery(
    {
      page: table.page + 1, // RTK Query usa paginación desde 1
      limit: table.rowsPerPage,
      status: filters.status === 'all' ? undefined : filters.status,
      start_date: filters.startDate?.toISOString().split('T')[0],
      end_date: filters.endDate?.toISOString().split('T')[0]
    },
    {
      skip: !user // Solo hacer request si hay usuario
    }
  );

  const [deleteInvoice] = useDeleteSalesInvoiceMutation();

  // ========================================
  // 📊 DATOS PROCESADOS
  // ========================================

  // Extraer datos de la respuesta paginada del servidor
  const tableData = useMemo(() => invoicesData?.invoices || [], [invoicesData]);
  const totalInvoices = invoicesData?.total || 0;

  // Debug para verificar paginación
  console.log('🔍 InvoiceListView Pagination:', {
    tablePage: table.page,
    apiPage: table.page + 1,
    rowsPerPage: table.rowsPerPage,
    totalInvoices,
    invoicesCount: tableData.length,
    searchTerm: debouncedSearch,
    timestamp: new Date().toLocaleTimeString()
  });

  // Aplicar filtros del lado cliente para compatibilidad con la lógica existente
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

  // Los datos ya vienen paginados del servidor, pero aplicamos filtros locales
  const dataInPage = dataFiltered;

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
      'total_amount'
    );

  const getPercentByStatus = (status: string) => (getInvoiceLength(status) / tableData.length) * 100;

  const TABS = [
    { value: 'all', label: 'Todas', color: 'default' as const, count: tableData.length },
    { value: 'PAID', label: 'Pagadas', color: 'success' as const, count: getInvoiceLength('PAID') },
    { value: 'OPEN', label: 'Pendientes', color: 'warning' as const, count: getInvoiceLength('OPEN') },
    { value: 'OVERDUE', label: 'Vencidas', color: 'error' as const, count: getInvoiceLength('OVERDUE') },
    { value: 'DRAFT', label: 'Borrador', color: 'info' as const, count: getInvoiceLength('DRAFT') }
  ];

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const handleFilters = useCallback(
    (name: string, value: any) => {
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
        await deleteInvoice(id).unwrap();
        // El refetch se disparará automáticamente por la invalidación de tags
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    },
    [deleteInvoice, table, dataInPage.length]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = table.selected.map((invoiceId) => deleteInvoice(invoiceId).unwrap());
      await Promise.all(deletePromises);

      table.onUpdatePageDeleteRows({
        totalRows: totalInvoices,
        totalRowsInPage: tableData.length,
        totalRowsFiltered: totalInvoices
      });
    } catch (error) {
      console.error('Error deleting invoices:', error);
    }
  }, [deleteInvoice, table, totalInvoices, tableData.length]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.invoice.details(id));
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

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Facturas de venta')}
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
              variant="contained"
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
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, 'totalAmount')}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Paid"
                total={getInvoiceLength('paid')}
                percent={getPercentByStatus('paid')}
                price={getTotalAmount('paid')}
                icon="solar:file-check-bold-duotone"
                color={theme.palette.success.main}
              />

              <InvoiceAnalytic
                title="Pending"
                total={getInvoiceLength('pending')}
                percent={getPercentByStatus('pending')}
                price={getTotalAmount('pending')}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.palette.warning.main}
              />

              <InvoiceAnalytic
                title="Overdue"
                total={getInvoiceLength('overdue')}
                percent={getPercentByStatus('overdue')}
                price={getTotalAmount('overdue')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.palette.error.main}
              />

              {/* <InvoiceAnalytic
                title="Draft"
                total={getInvoiceLength('draft')}
                percent={getPercentByStatus('draft')}
                price={getTotalAmount('draft')}
                icon="solar:file-corrupted-bold-duotone"
                color={theme.palette.text.secondary}
              /> */}
            </Stack>
          </Scrollbar>
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
            serviceOptions={INVOICE_SERVICE_OPTIONS.map((option) => option.name)}
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

            <Scrollbar>
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
                  {invoicesLoading &&
                    Array.from({ length: table.rowsPerPage }, (_, index) => (
                      <InvoiceTableRow
                        key={index}
                        row={null}
                        selected={false}
                        onSelectRow={() => {}}
                        onViewRow={() => {}}
                        onEditRow={() => {}}
                        onDeleteRow={() => {}}
                      />
                    ))}

                  {!invoicesLoading &&
                    dataInPage.map((row) => (
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

                  <TableEmptyRows height={denseHeight} emptyRows={Math.max(0, table.rowsPerPage - dataInPage.length)} />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalInvoices}
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

function applyFilter({ inputData, comparator, filters, dateError }) {
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
        invoice.invoiceNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service.length) {
    inputData = inputData.filter((invoice) => invoice.items.some((filterItem) => service.includes(filterItem.service)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (invoice) =>
          fTimestamp(invoice.createDate) >= fTimestamp(startDate) &&
          fTimestamp(invoice.createDate) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
