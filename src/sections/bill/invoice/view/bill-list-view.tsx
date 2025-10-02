import sumBy from 'lodash/sumBy';
import React, { useState, useCallback, useMemo } from 'react';
import { pdf } from '@react-pdf/renderer';
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
  CircularProgress
} from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import * as XLSX from 'xlsx';
import { fDate } from 'src/utils/format-time';
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
// Redux
import { useGetBillsQuery, useVoidBillMutation } from 'src/redux/services/billsApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
//
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import BillTableRow from '../bill-table-row';
import InvoiceAnalytic from '../invoice-analytic';
import InvoiceTableToolbar from '../invoice-table-toolbar';
import InvoiceTableFiltersResult from '../invoice-table-filters-result';
import BillPDF from '../bill-pdf';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'number', label: 'Número' },
  { id: 'supplier', label: 'Proveedor' },
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

export default function BillListView() {
  const theme = useTheme();
  const settings = useSettingsContext();
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'issue_date' });
  const confirm = useBoolean(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  const [filters, setFilters] = useState(defaultFilters);
  const [isProcessing, setIsProcessing] = useState(false);

  // RTK Query hooks
  const { data: bills = [], isLoading } = useGetBillsQuery();
  const { data: contacts = [] } = useGetContactsQuery({});
  const [voidBill] = useVoidBillMutation();

  // Enrich bills with supplier data
  const enrichedBills = useMemo(
    () =>
      bills.map((bill) => {
        const supplier = contacts.find((contact) => contact.id === bill.supplier_id);
        return {
          ...bill,
          supplier
        };
      }),
    [bills, contacts]
  );

  const dateError =
    filters.startDate && filters.endDate ? filters.startDate.getTime() > filters.endDate.getTime() : false;

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: enrichedBills,
        comparator: getComparator(table.order, table.orderBy),
        filters,
        dateError
      }),
    [enrichedBills, table.order, table.orderBy, filters, dateError]
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

  const getInvoiceLength = (status: string) => enrichedBills.filter((item) => item.status === status).length;

  const getTotalAmount = (status: string) =>
    sumBy(
      enrichedBills.filter((item) => item.status === status),
      (item) => parseFloat(item.total_amount)
    );

  const getPercentByStatus = (status: string) => (getInvoiceLength(status) / enrichedBills.length) * 100;

  const TABS = [
    { value: 'all', label: 'Todas', color: 'default' as const, count: enrichedBills.length },
    { value: 'open', label: 'Abiertas', color: 'info' as const, count: getInvoiceLength('open') },
    { value: 'paid', label: 'Pagadas', color: 'success' as const, count: getInvoiceLength('paid') },
    { value: 'void', label: 'Anuladas', color: 'error' as const, count: getInvoiceLength('void') },
    { value: 'draft', label: 'Borrador', color: 'warning' as const, count: getInvoiceLength('draft') }
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
        await voidBill({ id, reason: 'Anulada desde el listado' }).unwrap();
        enqueueSnackbar('Factura anulada correctamente', { variant: 'success' });
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error voiding bill:', error);
        enqueueSnackbar('Error al anular la factura', { variant: 'error' });
      }
    },
    [voidBill, table, dataInPage.length]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const voidPromises = table.selected.map((id) =>
        voidBill({ id, reason: 'Anulada desde el listado (múltiple)' }).unwrap()
      );
      await Promise.all(voidPromises);
      enqueueSnackbar('Facturas anuladas correctamente', { variant: 'success' });
      table.onUpdatePageDeleteRows({
        totalRows: enrichedBills.length,
        totalRowsInPage: dataInPage.length,
        totalRowsFiltered: dataFiltered.length
      });
    } catch (error) {
      console.error('Error voiding bills:', error);
      enqueueSnackbar('Error al anular las facturas', { variant: 'error' });
    }
  }, [voidBill, table, enrichedBills.length, dataInPage.length, dataFiltered.length]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.bill.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.bill.details(id));
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

  // Export to Excel
  const handleExportExcel = useCallback(async () => {
    try {
      setIsProcessing(true);
      const selectedBills =
        table.selected.length > 0 ? enrichedBills.filter((bill) => table.selected.includes(bill.id)) : enrichedBills;

      const worksheetData = selectedBills.map((bill: any) => ({
        Número: bill.number,
        Proveedor: bill.supplier?.name || 'Sin proveedor',
        NIT: bill.supplier?.document_number || '',
        'Fecha Emisión': fDate(bill.issue_date, 'dd/MM/yyyy'),
        Vencimiento: fDate(bill.due_date, 'dd/MM/yyyy'),
        'Total (COP)': parseFloat(bill.total_amount),
        'Pagado (COP)': parseFloat(bill.paid_amount),
        'Pendiente (COP)': parseFloat(bill.balance_due),
        Estado: bill.status,
        Email: bill.supplier?.email || '',
        Teléfono: bill.supplier?.phone || '',
        Notas: bill.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Facturas');
      XLSX.writeFile(workbook, `facturas-compra-${fDate(new Date(), 'yyyy-MM-dd')}.xlsx`);

      enqueueSnackbar(`${selectedBills.length} factura(s) exportada(s) a Excel`, { variant: 'success' });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      enqueueSnackbar('Error al exportar a Excel', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, enrichedBills]);

  // Download PDFs
  const handleDownloadPDFs = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedBills =
        table.selected.length > 0 ? enrichedBills.filter((bill) => table.selected.includes(bill.id)) : enrichedBills;

      if (selectedBills.length === 0) {
        enqueueSnackbar('No hay facturas seleccionadas', { variant: 'warning' });
        return;
      }

      if (selectedBills.length === 1) {
        const bill = selectedBills[0];
        const blob = await pdf(<BillPDF bill={bill} currentStatus={bill.status} />).toBlob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura-compra-${bill.number}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const pdfPromises = selectedBills.map(async (bill, index) => {
          const blob = await pdf(<BillPDF bill={bill} currentStatus={bill.status} />).toBlob();
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `factura-compra-${bill.number}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              resolve();
            }, index * 500);
          });
        });

        await Promise.all(pdfPromises);
      }

      enqueueSnackbar(`${selectedBills.length} PDF(s) descargado(s)`, { variant: 'success' });
    } catch (error) {
      console.error('Error downloading PDFs:', error);
      enqueueSnackbar('Error al descargar los PDFs', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, enrichedBills]);

  // Send Emails
  const handleSendEmails = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedBills =
        table.selected.length > 0 ? enrichedBills.filter((bill) => table.selected.includes(bill.id)) : [];

      if (selectedBills.length === 0) {
        enqueueSnackbar('No hay facturas seleccionadas', { variant: 'warning' });
        setIsProcessing(false);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const companyId = localStorage.getItem('companyId');

      const results = await Promise.all(
        selectedBills.map(async (bill) => {
          try {
            if (!bill.supplier?.email) {
              return { success: false };
            }

            const pdfBlob = await pdf(<BillPDF bill={bill} currentStatus={bill.status} />).toBlob();

            const formData = new FormData();
            formData.append('to_email', bill.supplier.email);
            formData.append('subject', `Factura de Compra ${bill.number}`);
            formData.append('message', 'Estimado proveedor, adjunto encontrará la factura de compra. Gracias.');
            formData.append('pdf_file', pdfBlob, `factura-compra-${bill.number}.pdf`);

            const response = await fetch(`${(import.meta as any).env.VITE_HOST_API}/bills/${bill.id}/send-email`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'X-Company-ID': companyId || ''
              },
              body: formData
            });

            return { success: response.ok };
          } catch (error) {
            console.error(`Error sending email for bill ${bill.number}:`, error);
            return { success: false };
          }
        })
      );

      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        enqueueSnackbar(`${successCount} email(s) enviado(s) exitosamente`, { variant: 'success' });
      }
      if (successCount < selectedBills.length) {
        enqueueSnackbar(`${selectedBills.length - successCount} email(s) fallaron (sin email o error)`, {
          variant: 'warning'
        });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      enqueueSnackbar('Error al enviar emails', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, enrichedBills]);

  // Print Invoices
  const handlePrintInvoices = useCallback(async () => {
    setIsProcessing(true);
    try {
      const selectedBills =
        table.selected.length > 0 ? enrichedBills.filter((bill) => table.selected.includes(bill.id)) : [];

      if (selectedBills.length === 0) {
        enqueueSnackbar('No hay facturas seleccionadas', { variant: 'warning' });
        setIsProcessing(false);
        return;
      }

      const printPromises = selectedBills.map(
        (bill, index) =>
          new Promise<void>((resolve) => {
            setTimeout(async () => {
              try {
                const blob = await pdf(<BillPDF bill={bill} currentStatus={bill.status} />).toBlob();
                const url = window.URL.createObjectURL(blob);
                const printWindow = window.open(url, '_blank');
                if (printWindow) {
                  printWindow.onload = () => {
                    printWindow.print();
                  };
                }
                setTimeout(() => {
                  window.URL.revokeObjectURL(url);
                }, 1000);
                resolve();
              } catch (error) {
                console.error(`Error printing bill ${bill.number}:`, error);
                resolve();
              }
            }, index * 1000);
          })
      );

      await Promise.all(printPromises);
      enqueueSnackbar(`${selectedBills.length} factura(s) enviada(s) a impresión`, { variant: 'success' });
    } catch (error) {
      console.error('Error printing invoices:', error);
      enqueueSnackbar('Error al imprimir facturas', { variant: 'error' });
    } finally {
      setIsProcessing(false);
    }
  }, [table.selected, enrichedBills]);

  if (isLoading) {
    return (
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Facturas de Compra')}
          icon="solar:bill-list-bold-duotone"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
            { name: 'Lista' }
          ]}
        />
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress />
        </Card>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={t('Facturas de Compra')}
          icon="solar:bill-list-bold-duotone"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Facturas de Compra', href: paths.dashboard.bill.root },
            { name: 'Lista' }
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
              {t('Nueva Factura')}
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
            sx={{ py: 2, overflowX: 'auto' }}
          >
            <InvoiceAnalytic
              title="Total"
              total={enrichedBills.length}
              percent={100}
              price={sumBy(enrichedBills, (item) => parseFloat(item.total_amount))}
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
              icon="solar:file-check-bold-duotone"
              color={theme.palette.success.main}
            />

            <InvoiceAnalytic
              title="Anuladas"
              total={getInvoiceLength('void')}
              percent={getPercentByStatus('void')}
              price={getTotalAmount('void')}
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
            dateError={dateError}
            serviceOptions={[]}
            dataFiltered={dataFiltered}
          />

          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={enrichedBills.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  enrichedBills.map((row) => row.id)
                )
              }
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Enviar Emails">
                    <IconButton color="primary" onClick={handleSendEmails} disabled={isProcessing}>
                      {isProcessing ? <CircularProgress size={24} /> : <Iconify icon="iconamoon:send-fill" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Descargar PDFs">
                    <IconButton color="primary" onClick={handleDownloadPDFs} disabled={isProcessing}>
                      {isProcessing ? <CircularProgress size={24} /> : <Iconify icon="eva:download-outline" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Imprimir">
                    <IconButton color="primary" onClick={handlePrintInvoices} disabled={isProcessing}>
                      {isProcessing ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Iconify icon="solar:printer-minimalistic-bold" />
                      )}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Exportar Excel">
                    <IconButton color="primary" onClick={handleExportExcel} disabled={isProcessing}>
                      {isProcessing ? <CircularProgress size={24} /> : <Iconify icon="vscode-icons:file-type-excel" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Anular">
                    <IconButton color="error" onClick={confirm.onTrue} disabled={isProcessing}>
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
                rowCount={enrichedBills.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    enrichedBills.map((row) => row.id)
                  )
                }
              />

              <TableBody>
                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <BillTableRow
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
                  emptyRows={emptyRows(table.page, table.rowsPerPage, enrichedBills.length)}
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
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Anular Facturas"
        content={
          <>
            ¿Está seguro de que desea anular <strong>{table.selected.length}</strong>{' '}
            {table.selected.length === 1 ? 'factura' : 'facturas'}?
            <br />
            <br />
            Las facturas anuladas no se pueden revertir y cambiarán su estado a VOID.
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
            Anular Facturas
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, dateError }) {
  const { name, status, startDate, endDate } = filters;

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
      (bill) =>
        bill.number?.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        bill.supplier?.name?.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((bill) => bill.status === status);
  }

  if (!dateError && startDate && endDate) {
    inputData = inputData.filter((bill) => {
      const issueDate = new Date(bill.issue_date).getTime();
      return issueDate >= startDate.getTime() && issueDate <= endDate.getTime();
    });
  }

  return inputData;
}
