import { useState, useCallback, useMemo } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useGetQuotesQuery, useConvertToInvoiceMutation, useCloneQuoteMutation } from 'src/redux/services/quotesApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSnackbar } from 'src/components/snackbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom
} from 'src/components/table';
//
import { format } from 'date-fns';
import QuotesTableRow from '../quotes-table-row';
import QuotesTableToolbar from '../quotes-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'quote_number', label: 'Número' },
  { id: 'customer', label: 'Cliente' },
  { id: 'issue_date', label: 'Fecha' },
  { id: 'expiration_date', label: 'Vence' },
  { id: 'status', label: 'Estado' },
  { id: 'total', label: 'Total' },
  { id: 'converted', label: 'Facturada' },
  { id: '' }
];

const defaultFilters = {
  search: '',
  customer_id: '',
  status: '',
  startDate: null as Date | null,
  endDate: null as Date | null
};

// ----------------------------------------------------------------------

export default function QuotesListView() {
  const table = useTable({ defaultOrderBy: 'issue_date', defaultOrder: 'desc' });
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const convertDialog = useBoolean(false);
  const cloneDialog = useBoolean(false);

  // Fetch contacts for customer filter
  const { data: allContacts = [] } = useGetContactsQuery({});
  const customers = useMemo(
    () => allContacts.filter((contact: any) => contact.type && contact.type.includes('customer')),
    [allContacts]
  );

  // Create customer name map for display
  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    (customers || []).forEach((c: any) => map.set(c.id, c.name));
    return map;
  }, [customers]);

  // Build query params
  const queryParams = useMemo(() => {
    const params: any = {
      page: table.page + 1,
      page_size: table.rowsPerPage
    };

    if (filters.customer_id) params.customer_id = filters.customer_id;
    if (filters.status) params.status_filter = filters.status;
    if (filters.startDate) params.date_from = format(filters.startDate, 'yyyy-MM-dd');
    if (filters.endDate) params.date_to = format(filters.endDate, 'yyyy-MM-dd');

    return params;
  }, [filters, table.page, table.rowsPerPage]);

  // Fetch quotes
  const { data: quotesResponse, isLoading, isFetching } = useGetQuotesQuery(queryParams);

  // Mutations
  const [convertToInvoice, { isLoading: isConverting }] = useConvertToInvoiceMutation();
  const [cloneQuote, { isLoading: isCloning }] = useCloneQuoteMutation();

  // Apply client-side search filter if needed
  const searchText = filters.search.trim().toLowerCase();
  const dataInPage = useMemo(() => {
    const quotes = quotesResponse?.items || [];
    if (!searchText) return quotes;

    return quotes.filter((row: any) => {
      const quoteText = String(row.quote_number || row.id || '').toLowerCase();
      const customerText = String(customerNameById.get(row.customer_id) || '').toLowerCase();

      return quoteText.includes(searchText) || customerText.includes(searchText);
    });
  }, [quotesResponse?.items, customerNameById, searchText]);

  const totalCount = quotesResponse?.total || 0;

  const dateError = filters.startDate && filters.endDate ? filters.startDate > filters.endDate : false;
  const canReset =
    !!filters.search || !!filters.customer_id || !!filters.status || !!filters.startDate || !!filters.endDate;
  const notFound = (!dataInPage.length && canReset) || !dataInPage.length;
  const denseHeight = table.dense ? 52 : 72;

  // Handlers
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

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    setFilters(defaultFilters);
  }, [table]);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.sales.quotes.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.sales.quotes.edit(id));
    },
    [router]
  );

  const handleConvertRow = useCallback(
    (id: string) => {
      setSelectedQuoteId(id);
      convertDialog.onTrue();
    },
    [convertDialog]
  );

  const handleCloneRow = useCallback(
    (id: string) => {
      setSelectedQuoteId(id);
      cloneDialog.onTrue();
    },
    [cloneDialog]
  );

  const handleConfirmConvert = useCallback(async () => {
    if (!selectedQuoteId) return;

    try {
      const result = await convertToInvoice(selectedQuoteId).unwrap();
      enqueueSnackbar('Cotización convertida a factura exitosamente', { variant: 'success' });
      convertDialog.onFalse();

      // Navigate to invoice if ID is returned
      if (result?.id) {
        router.push(paths.dashboard.sales.details(result.id));
      }
    } catch (error: any) {
      console.error('Error converting quote:', error);
      const message = error?.data?.detail || 'Error al convertir cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [selectedQuoteId, convertToInvoice, enqueueSnackbar, convertDialog, router]);

  const handleConfirmClone = useCallback(async () => {
    if (!selectedQuoteId) return;

    try {
      const result = await cloneQuote(selectedQuoteId).unwrap();
      enqueueSnackbar('Cotización clonada exitosamente', { variant: 'success' });
      cloneDialog.onFalse();

      // Navigate to new quote
      if (result?.id) {
        router.push(paths.dashboard.sales.quotes.edit(result.id));
      }
    } catch (error: any) {
      console.error('Error cloning quote:', error);
      const message = error?.data?.detail || 'Error al clonar cotización';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [selectedQuoteId, cloneQuote, enqueueSnackbar, cloneDialog, router]);

  const handleViewInvoice = useCallback(
    (invoiceId: string) => {
      router.push(paths.dashboard.sales.details(invoiceId));
    },
    [router]
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          icon=""
          heading="Cotizaciones"
          subHeading="Gestiona cotizaciones enviadas a clientes. Las cotizaciones no afectan inventario ni cuentas por cobrar hasta que se convierten en facturas."
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Ventas', href: paths.dashboard.sales.root },
            { name: 'Cotizaciones' }
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.sales.quotes.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nueva cotización
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <QuotesTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            customers={customers}
            dateError={dateError}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataInPage.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                />

                <TableBody>
                  {(isFetching ? [] : dataInPage).map((row) => (
                    <QuotesTableRow
                      key={row.id}
                      row={row}
                      customerName={customerNameById.get(row.customer_id)}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={row.status === 'draft' ? () => handleEditRow(row.id) : undefined}
                      onConvertToInvoice={row.status === 'accepted' ? () => handleConvertRow(row.id) : undefined}
                      onClone={() => handleCloneRow(row.id)}
                      onViewInvoice={
                        row.converted_to_invoice_id ? () => handleViewInvoice(row.converted_to_invoice_id!) : undefined
                      }
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, totalCount)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalCount}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      {/* Convert to Invoice Confirm Dialog */}
      <ConfirmDialog
        open={convertDialog.value}
        onClose={convertDialog.onFalse}
        title="Convertir a Factura"
        content="¿Está seguro de convertir esta cotización en una factura? Esta acción no se puede deshacer."
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmConvert} disabled={isConverting}>
            {isConverting ? 'Convirtiendo...' : 'Convertir'}
          </Button>
        }
      />

      {/* Clone Quote Confirm Dialog */}
      <ConfirmDialog
        open={cloneDialog.value}
        onClose={cloneDialog.onFalse}
        title="Clonar Cotización"
        content="Se creará una copia de esta cotización en estado borrador. ¿Desea continuar?"
        action={
          <Button variant="contained" color="primary" onClick={handleConfirmClone} disabled={isCloning}>
            {isCloning ? 'Clonando...' : 'Clonar'}
          </Button>
        }
      />
    </>
  );
}
