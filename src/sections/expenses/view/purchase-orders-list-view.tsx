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
// redux
import { useGetPurchaseOrdersQuery } from 'src/redux/services/billsApi';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import PurchaseOrderTableRow from '../purchase-order-table-row';
import PurchaseOrderTableToolbar from '../purchase-order-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'order_number', label: 'N° Orden' },
  { id: 'issue_date', label: 'Fecha' },
  { id: 'supplier', label: 'Proveedor' },
  { id: 'total', label: 'Total' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const defaultFilters = {
  supplier: '',
  status: '',
  startDate: null,
  endDate: null
};

// ----------------------------------------------------------------------

export default function PurchaseOrdersListView() {
  const table = useTable({ defaultOrderBy: 'issue_date', defaultOrder: 'desc' });
  const settings = useSettingsContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const [filters, setFilters] = useState(defaultFilters);
  const confirm = useBoolean(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Fetch purchase orders
  const { data: purchaseOrders = [] } = useGetPurchaseOrdersQuery({
    limit: table.rowsPerPage,
    offset: table.page * table.rowsPerPage,
    status: filters.status || undefined
  });

  const dataFiltered = applyFilter({
    inputData: purchaseOrders,
    filters
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 52 : 72;
  const canReset = !!filters.supplier || !!filters.status || !!filters.startDate || !!filters.endDate;
  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback((name: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.expenses.purchaseOrders.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.expenses.purchaseOrders.edit(id));
    },
    [router]
  );

  const handleVoidRow = useCallback(
    (id: string) => {
      setSelectedOrderId(id);
      confirm.onTrue();
    },
    [confirm]
  );

  const handleConfirmVoid = useCallback(async () => {
    if (selectedOrderId) {
      try {
        // TODO: Implement void mutation when backend endpoint is ready
        enqueueSnackbar('Orden anulada exitosamente', { variant: 'success' });
        confirm.onFalse();
        setSelectedOrderId(null);
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Error al anular la orden', { variant: 'error' });
      }
    }
  }, [selectedOrderId, enqueueSnackbar, confirm]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'xl'}>
        <CustomBreadcrumbs
          icon=""
          heading="Órdenes de Compra"
          subHeading="Gestiona las órdenes de compra a proveedores. Documento de control que indica las cantidades solicitadas y pendientes por recibir. No genera movimientos en inventario ni cuentas contables."
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Gastos', href: paths.dashboard.bill.root },
            { name: 'Órdenes de Compra' }
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.expenses.purchaseOrders.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nueva Orden
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <PurchaseOrderTableToolbar filters={filters} onFilters={handleFilters} onResetFilters={handleResetFilters} />

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
                  <IconButton color="primary">
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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
                  {dataInPage.map((row) => (
                    <PurchaseOrderTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onVoidRow={() => handleVoidRow(row.id)}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
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
        title="Anular Orden"
        content="¿Está seguro de anular esta orden de compra? Esta acción no se puede deshacer."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmVoid}>
            Anular
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, filters }: { inputData: any[]; filters: any }) {
  const { supplier, status, startDate, endDate } = filters;

  if (supplier) {
    inputData = inputData.filter((order) => order.supplier?.name.toLowerCase().includes(supplier.toLowerCase()));
  }

  if (status) {
    inputData = inputData.filter((order) => order.status === status);
  }

  if (startDate) {
    inputData = inputData.filter((order) => new Date(order.issue_date) >= startDate);
  }

  if (endDate) {
    inputData = inputData.filter((order) => new Date(order.issue_date) <= endDate);
  }

  return inputData;
}
