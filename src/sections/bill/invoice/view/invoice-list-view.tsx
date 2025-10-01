import sumBy from 'lodash/sumBy';
import React, { useState, useCallback } from 'react';
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
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fTimestamp } from 'src/utils/format-time';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
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
import { useMediaQuery } from '@mui/material';
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from 'src/redux/services/invoicesApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { enqueueSnackbar } from 'notistack';
import InvoiceAnalytic from '../invoice-analytic';
import InvoiceTableRow from '../invoice-table-row';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'invoiceNumber', label: 'Proveedor' },
  { id: 'createDate', label: 'Creada' },
  { id: 'dueDate', label: 'Vencimiento' },
  { id: 'price', label: 'Valor' },
  { id: 'price', label: 'Pagado' },
  { id: 'price', label: 'Por pagar' },
  // { id: 'sent', label: 'Sent', align: 'center' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const defaultFilters = {
  name: '',
  service: [],
  status: 'all',
  startDate: null,
  endDate: null
};

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'issue_date' });
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const confirm = useBoolean(false);

  // RTK Query hooks
  const { data: invoices = [], isLoading } = useGetInvoicesQuery({ type: 'purchase' });
  const { data: contacts = [] } = useGetContactsQuery({});
  const [deleteInvoice] = useDeleteInvoiceMutation();

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? new Date(filters.startDate).getTime() > new Date(filters.endDate).getTime()
      : false;

  // Map invoices with customer data for display
  const enrichedInvoices = invoices.map((invoice) => {
    const customer = contacts.find((contact) => contact.id === invoice.customer_id);
    return {
      ...invoice,
      customerName: customer?.name || 'Cliente no encontrado',
      customerData: customer
    };
  });

  const dataFiltered = applyFilter({
    inputData: enrichedInvoices,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError
  });

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

  const getInvoiceLength = (status) => enrichedInvoices.filter((item) => item.status === status).length;

  const getTotalAmount = (status) =>
    sumBy(
      enrichedInvoices.filter((item) => item.status === status),
      (item) => parseFloat(item.total_amount || '0')
    );

  const getPercentByStatus = (status) => (getInvoiceLength(status) / enrichedInvoices.length) * 100;

  const TABS = [
    { value: 'all', label: 'Todas', color: 'default', count: enrichedInvoices.length },
    { value: 'paid', label: 'Pagadas', color: 'success', count: getInvoiceLength('paid') },
    { value: 'pending', label: 'Pendientes', color: 'warning', count: getInvoiceLength('pending') },
    { value: 'overdue', label: 'Vencidas', color: 'error', count: getInvoiceLength('overdue') },
    { value: 'draft', label: 'Borradores', color: 'default', count: getInvoiceLength('draft') }
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
    async (id) => {
      try {
        await deleteInvoice(id).unwrap();
        enqueueSnackbar('Factura eliminada exitosamente', { variant: 'success' });
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        enqueueSnackbar('Error al eliminar la factura', { variant: 'error' });
      }
    },
    [dataInPage.length, table, deleteInvoice]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => deleteInvoice(id).unwrap()));
      enqueueSnackbar('Facturas eliminadas exitosamente', { variant: 'success' });
      table.onUpdatePageDeleteRows({
        totalRows: enrichedInvoices.length,
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length
      });
    } catch (error) {
      console.error('Error deleting invoices:', error);
      enqueueSnackbar('Error al eliminar las facturas', { variant: 'error' });
    }
  }, [dataFiltered.length, dataInPage.length, table, enrichedInvoices.length, deleteInvoice]);

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

  const { t } = useTranslation();

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Facturas de compra')}
          icon="solar:bill-list-bold-duotone"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root
            },
            {
              name: 'Facturas de compra',
              href: paths.dashboard.bill.root
            },
            {
              name: 'Lista'
            }
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.bill.newBill}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
              sx={isMobile ? { width: '100%' } : {}}
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
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2, overflowX: 'auto' }}
          >
            <InvoiceAnalytic
              title="Total"
              total={enrichedInvoices.length}
              percent={100}
              price={sumBy(enrichedInvoices, (item) => parseFloat(item.total_amount || '0'))}
              icon="solar:bill-list-bold-duotone"
              color={theme.palette.info.main}
            />

            <InvoiceAnalytic
              title="Pagadas"
              total={getInvoiceLength('paid')}
              percent={getPercentByStatus('paid')}
              price={getTotalAmount('paid')}
              icon="solar:file-check-bold-duotone"
              color={theme.palette.success.main}
            />

            <InvoiceAnalytic
              title="Pendientes"
              total={getInvoiceLength('pending')}
              percent={getPercentByStatus('pending')}
              price={getTotalAmount('pending')}
              icon="solar:sort-by-time-bold-duotone"
              color={theme.palette.warning.main}
            />

            <InvoiceAnalytic
              title="Vencidas"
              total={getInvoiceLength('overdue')}
              percent={getPercentByStatus('overdue')}
              price={getTotalAmount('overdue')}
              icon="solar:bell-bing-bold-duotone"
              color={theme.palette.error.main}
            />

            <InvoiceAnalytic
              title="Borradores"
              total={getInvoiceLength('draft')}
              percent={getPercentByStatus('draft')}
              price={getTotalAmount('draft')}
              icon="solar:file-corrupted-bold-duotone"
              color={theme.palette.text.secondary}
            />
          </Stack>
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
                    color={tab.color as 'default' | 'success' | 'warning' | 'error'}
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
              rowCount={enrichedInvoices.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  enrichedInvoices.map((row) => row.id)
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

            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={enrichedInvoices.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    enrichedInvoices.map((row) => row.id)
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
                  emptyRows={emptyRows(table.page, table.rowsPerPage, enrichedInvoices.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
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

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, service, startDate, endDate } = filters;

  if (!Array.isArray(inputData)) {
    return [];
  }

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
        invoice.number?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        invoice.customerName?.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((invoice) => invoice.status === status);
  }

  if (service && service.length) {
    // For invoice service filtering - can be implemented later if needed
    // inputData = inputData.filter((invoice) => invoice.items?.some((filterItem) => service.includes(filterItem.service)));
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (invoice) =>
          fTimestamp(invoice.issue_date) >= fTimestamp(startDate) &&
          fTimestamp(invoice.issue_date) <= fTimestamp(endDate)
      );
    }
  }

  return inputData;
}
