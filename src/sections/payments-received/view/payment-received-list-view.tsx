import { useState, useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
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
import { useDebounce } from 'src/hooks/use-debounce';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSnackbar } from 'src/components/snackbar';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
// redux
import { useGetPaymentsQuery, useDeletePaymentMutation } from 'src/redux/services/paymentsReceivedApi';
// types
import { PaymentReceivedFilters } from 'src/types/payment-received';
//
import PaymentReceivedTableRow from '../payment-received-table-row';
import PaymentReceivedTableToolbar from '../payment-received-table-toolbar';

// ----------------------------------------------------------------------

// Mock data removed - using real API

const TABLE_HEAD = [
  { id: 'customer', label: 'Cliente' },
  { id: 'date', label: 'Fecha' },
  { id: 'status', label: 'Estado', align: 'center' },
  { id: 'method', label: 'Método' },
  { id: 'amount', label: 'Monto' },
  { id: 'invoices', label: 'Facturas' },
  { id: '', width: 88 }
];

const defaultFilters: PaymentReceivedFilters = {
  name: '',
  payment_method: undefined,
  invoice_type: undefined,
  include_voided: false,
  start_date: null,
  end_date: null,
  min_amount: undefined,
  max_amount: undefined
};

// ----------------------------------------------------------------------

export default function PaymentReceivedListView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const confirm = useBoolean(false);
  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState<PaymentReceivedFilters>(defaultFilters);

  // Debounce para el buscador (500ms)
  const debouncedFilters = useDebounce(filters, 500);

  // RTK Query - Real API Integration
  const { data: paymentsData, isLoading } = useGetPaymentsQuery({
    ...debouncedFilters,
    page: table.page + 1,
    size: table.rowsPerPage
  });

  const [deletePayment] = useDeletePaymentMutation();

  const tableData = paymentsData?.payments || [];
  const totalCount = paymentsData?.total || 0;

  // Filtrado local por nombre de cliente (el backend no soporta búsqueda por texto)
  const dataFiltered = applyFilter({
    inputData: tableData,
    filters
  });

  const denseHeight = table.dense ? 52 : 72;

  const notFound = !isLoading && !dataFiltered.length;

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
    setFilters(defaultFilters);
    table.onResetPage();
  }, [table]);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deletePayment(id).unwrap();
        enqueueSnackbar('Pago eliminado exitosamente', { variant: 'success' });
      } catch (error) {
        console.error('Error al eliminar pago:', error);
        enqueueSnackbar(error?.data?.detail || 'Error al eliminar el pago', { variant: 'error' });
      }
    },
    [deletePayment, enqueueSnackbar]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(table.selected.map((id) => deletePayment(id).unwrap()));
      enqueueSnackbar('Pagos eliminados exitosamente', { variant: 'success' });
      table.onUpdatePageDeleteRows({
        totalRows: totalCount,
        totalRowsInPage: tableData.length,
        totalRowsFiltered: tableData.length
      });
    } catch (error) {
      console.error('Error al eliminar pagos:', error);
      enqueueSnackbar('Error al eliminar los pagos', { variant: 'error' });
    }
  }, [tableData.length, table, totalCount, deletePayment, enqueueSnackbar]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.paymentsReceived.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.paymentsReceived.details(id));
    },
    [router]
  );

  const handleVoidRow = useCallback((id: string) => {
    console.log('Void payment:', id);
    // 🔥 TODO: Integrar con API
  }, []);

  const handleSendEmail = useCallback((id: string) => {
    console.log('Send email for payment:', id);
    // 🔥 TODO: Integrar con API
  }, []);

  const handlePrint = useCallback((id: string) => {
    console.log('Print payment:', id);
    // 🔥 TODO: Integrar con API de impresión
  }, []);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Pagos Recibidos"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Pagos Recibidos', href: paths.dashboard.paymentsReceived.root },
            { name: 'Lista' }
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.paymentsReceived.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nuevo Pago
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        <Card>
          <PaymentReceivedTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
                )
              }
              action={
                <Tooltip title="Eliminar">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered.map((row) => (
                    <PaymentReceivedTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onVoidRow={() => handleVoidRow(row.id)}
                      onSendEmail={() => handleSendEmail(row.id)}
                      onPrint={() => handlePrint(row.id)}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar"
        content={
          <>
            ¿Está seguro de eliminar <strong> {table.selected.length} </strong> pagos?
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
            Eliminar
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }: { inputData: any[]; filters: PaymentReceivedFilters }) {
  const { name } = filters;

  // Filtrar por nombre de cliente (búsqueda local)
  if (name) {
    inputData = inputData.filter((payment) => payment.customer_name?.toLowerCase().includes(name.toLowerCase()));
  }

  return inputData;
}
