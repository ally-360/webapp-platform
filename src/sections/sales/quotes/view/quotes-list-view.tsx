import { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
// @mui
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import {
  useAcceptQuoteMutation,
  useCloneQuoteMutation,
  useConvertToInvoiceMutation,
  useExpireQuoteMutation,
  useGetQuotesQuery,
  useRejectQuoteMutation,
  useSendQuoteMutation
} from 'src/redux/services/quotesApi';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import {
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable
} from 'src/components/table';
//
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

type PendingAction = 'send' | 'accept' | 'reject' | 'expire';

export default function QuotesListView() {
  const table = useTable({ defaultOrderBy: 'issue_date', defaultOrder: 'desc' });
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const convertDialog = useBoolean(false);
  const cloneDialog = useBoolean(false);
  const actionDialog = useBoolean(false);

  // Fetch contacts only for the customer filter dropdown
  const { data: customers = [] } = useGetContactsQuery({ type: 'client', limit: 100, offset: 0 });

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    customers.forEach((c: any) => map.set(c.id, c.name));
    return map;
  }, [customers]);

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

  const { data: quotesResponse, isLoading, isFetching } = useGetQuotesQuery(queryParams);

  const [sendQuote, { isLoading: isSending }] = useSendQuoteMutation();
  const [acceptQuote, { isLoading: isAccepting }] = useAcceptQuoteMutation();
  const [rejectQuote, { isLoading: isRejecting }] = useRejectQuoteMutation();
  const [expireQuote, { isLoading: isExpiring }] = useExpireQuoteMutation();
  const [convertToInvoice, { isLoading: isConverting }] = useConvertToInvoiceMutation();
  const [cloneQuote, { isLoading: isCloning }] = useCloneQuoteMutation();

  const searchText = filters.search.trim().toLowerCase();
  const dataInPage = useMemo(() => {
    const quotes = quotesResponse?.items || [];
    if (!searchText) return quotes;

    return quotes.filter((row: any) => {
      const quoteText = String(row.quote_number || row.id || '').toLowerCase();
      const customerNameText = String(
        row.customer_name ||
          [row.customer_first_name, row.customer_last_name].filter(Boolean).join(' ') ||
          customerNameById.get(row.customer_id) ||
          ''
      ).toLowerCase();
      const customerEmailText = String(row.customer_email || '').toLowerCase();

      return (
        quoteText.includes(searchText) ||
        customerNameText.includes(searchText) ||
        customerEmailText.includes(searchText)
      );
    });
  }, [quotesResponse?.items, customerNameById, searchText]);

  const totalCount = quotesResponse?.total || 0;

  const dateError = filters.startDate && filters.endDate ? filters.startDate > filters.endDate : false;
  const canReset =
    !!filters.search || !!filters.customer_id || !!filters.status || !!filters.startDate || !!filters.endDate;
  const notFound = (!dataInPage.length && canReset) || !dataInPage.length;
  const denseHeight = table.dense ? 52 : 72;

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

  const handleActionRow = useCallback(
    (id: string, action: PendingAction) => {
      setSelectedQuoteId(id);
      setPendingAction(action);
      actionDialog.onTrue();
    },
    [actionDialog]
  );

  const actionConfig = useMemo(() => {
    switch (pendingAction) {
      case 'send':
        return {
          title: 'Enviar Cotización',
          content: '¿Está seguro de enviar esta cotización al cliente?',
          buttonText: isSending ? 'Enviando...' : 'Enviar',
          buttonColor: 'primary' as const,
          loading: isSending
        };
      case 'accept':
        return {
          title: 'Aceptar Cotización',
          content: '¿Confirma que esta cotización fue aceptada por el cliente?',
          buttonText: isAccepting ? 'Aceptando...' : 'Aceptar',
          buttonColor: 'success' as const,
          loading: isAccepting
        };
      case 'reject':
        return {
          title: 'Rechazar Cotización',
          content: '¿Confirma que esta cotización fue rechazada por el cliente?',
          buttonText: isRejecting ? 'Rechazando...' : 'Rechazar',
          buttonColor: 'error' as const,
          loading: isRejecting
        };
      case 'expire':
        return {
          title: 'Expirar Cotización',
          content: '¿Desea marcar esta cotización como vencida?',
          buttonText: isExpiring ? 'Expirando...' : 'Expirar',
          buttonColor: 'warning' as const,
          loading: isExpiring
        };
      default:
        return null;
    }
  }, [pendingAction, isSending, isAccepting, isRejecting, isExpiring]);

  const handleConfirmAction = useCallback(async () => {
    if (!selectedQuoteId || !pendingAction) return;

    try {
      switch (pendingAction) {
        case 'send':
          await sendQuote(selectedQuoteId).unwrap();
          enqueueSnackbar('Cotización enviada', { variant: 'success' });
          break;
        case 'accept':
          await acceptQuote(selectedQuoteId).unwrap();
          enqueueSnackbar('Cotización aceptada', { variant: 'success' });
          break;
        case 'reject':
          await rejectQuote(selectedQuoteId).unwrap();
          enqueueSnackbar('Cotización rechazada', { variant: 'success' });
          break;
        case 'expire':
          await expireQuote(selectedQuoteId).unwrap();
          enqueueSnackbar('Cotización marcada como vencida', { variant: 'success' });
          break;
        default:
          break;
      }

      actionDialog.onFalse();
      setPendingAction(null);
    } catch (error: any) {
      console.error('Error performing quote action:', error);
      const message = error?.data?.detail || 'Error al ejecutar la acción';
      enqueueSnackbar(message, { variant: 'error' });
    }
  }, [acceptQuote, actionDialog, enqueueSnackbar, expireQuote, pendingAction, rejectQuote, selectedQuoteId, sendQuote]);

  const handleConfirmConvert = useCallback(async () => {
    if (!selectedQuoteId) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await convertToInvoice({
        id: selectedQuoteId,
        body: {
          invoice_type: 'SALE',
          issue_date: today,
          due_date: today,
          notes: ''
        }
      }).unwrap();

      enqueueSnackbar('Cotización convertida a factura exitosamente', { variant: 'success' });
      convertDialog.onFalse();

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
                  {(isFetching ? [] : dataInPage).map((row) => {
                    const customerName =
                      row.customer_name ||
                      [row.customer_first_name, row.customer_last_name].filter(Boolean).join(' ') ||
                      customerNameById.get(row.customer_id) ||
                      'Sin cliente';

                    const canConvert =
                      (row.status === 'sent' || row.status === 'accepted') && !row.converted_to_invoice_id;

                    return (
                      <QuotesTableRow
                        key={row.id}
                        row={row}
                        customerName={customerName}
                        customerEmail={row.customer_email}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onEditRow={row.status === 'draft' ? () => handleEditRow(row.id) : undefined}
                        onSend={row.status === 'draft' ? () => handleActionRow(row.id, 'send') : undefined}
                        onAccept={row.status === 'sent' ? () => handleActionRow(row.id, 'accept') : undefined}
                        onReject={row.status === 'sent' ? () => handleActionRow(row.id, 'reject') : undefined}
                        onExpire={row.status === 'sent' ? () => handleActionRow(row.id, 'expire') : undefined}
                        onConvertToInvoice={canConvert ? () => handleConvertRow(row.id) : undefined}
                        onClone={() => handleCloneRow(row.id)}
                        onViewInvoice={
                          row.converted_to_invoice_id
                            ? () => handleViewInvoice(row.converted_to_invoice_id!)
                            : undefined
                        }
                      />
                    );
                  })}

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

      <ConfirmDialog
        open={actionDialog.value}
        onClose={() => {
          actionDialog.onFalse();
          setPendingAction(null);
        }}
        title={actionConfig?.title || 'Confirmar'}
        content={actionConfig?.content || '¿Desea continuar?'}
        action={
          <Button
            variant="contained"
            color={actionConfig?.buttonColor || 'primary'}
            onClick={handleConfirmAction}
            disabled={!!actionConfig?.loading}
          >
            {actionConfig?.buttonText || 'Confirmar'}
          </Button>
        }
      />

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
