import { useMemo, useState, useCallback } from 'react';
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
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetPDVsQuery } from 'src/redux/services/catalogApi';
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
import ConvertPOToBillDialog from '../convert-po-to-bill-dialog';
import VoidPurchaseOrderDialog from '../void-purchase-order-dialog';
//
import PurchaseOrderTableRow from '../purchase-order-table-row';
import PurchaseOrderTableToolbar from '../purchase-order-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'order_number', label: 'N° Orden' },
  { id: 'issue_date', label: 'Fecha' },
  { id: 'supplier', label: 'Proveedor' },
  { id: 'pdv', label: 'PDV' },
  { id: 'total', label: 'Total' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const defaultFilters = {
  search: '',
  supplier_id: '',
  pdv_id: '',
  status: ''
};

// ----------------------------------------------------------------------

export default function PurchaseOrdersListView() {
  const table = useTable({ defaultOrderBy: 'issue_date', defaultOrder: 'desc' });
  const settings = useSettingsContext();
  const router = useRouter();

  const [filters, setFilters] = useState(defaultFilters);

  const convertDialog = useBoolean(false);
  const voidDialog = useBoolean(false);
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; order_number?: string } | null>(null);

  const { data: allContacts = [] } = useGetContactsQuery({});
  const { data: allPDVs = [] } = useGetPDVsQuery();
  const suppliers = useMemo(
    () => allContacts.filter((contact: any) => contact.type && contact.type.includes('provider')),
    [allContacts]
  );

  const pdvNameById = useMemo(() => {
    const map = new Map<string, string>();
    (allPDVs || []).forEach((p: any) => map.set(p.id, p.name));
    return map;
  }, [allPDVs]);

  // Fetch purchase orders
  const { data: purchaseOrdersResponse } = useGetPurchaseOrdersQuery({
    limit: table.rowsPerPage,
    offset: table.page * table.rowsPerPage,
    status: filters.status || undefined,
    supplier_id: filters.supplier_id || undefined,
    pdv_id: filters.pdv_id || undefined
  });

  const purchaseOrders = purchaseOrdersResponse?.items || [];
  const totalCount = purchaseOrdersResponse?.total || 0;

  const searchText = filters.search.trim().toLowerCase();

  const dataInPage = useMemo(() => {
    if (!searchText) return purchaseOrders;

    return purchaseOrders.filter((row: any) => {
      const orderText = String(row.order_number || row.id || '').toLowerCase();
      const supplierText = String(row.supplier_name || row.supplier?.name || '').toLowerCase();
      const pdvText = String(pdvNameById.get(row.pdv_id) || row.pdv?.name || row.pdv_id || '').toLowerCase();

      return (
        orderText.includes(searchText) ||
        supplierText.includes(searchText) ||
        pdvText.includes(searchText)
      );
    });
  }, [purchaseOrders, pdvNameById, searchText]);

  const denseHeight = table.dense ? 52 : 72;
  const canReset = !!filters.search || !!filters.supplier_id || !!filters.pdv_id || !!filters.status;
  const notFound = (!dataInPage.length && canReset) || !dataInPage.length;

  const handleFilters = useCallback((name: string, value: any) => {
    table.onResetPage();
    setFilters((prevState) => ({
      ...prevState,
      [name]: value
    }));
  }, [table]);

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    setFilters(defaultFilters);
  }, [table]);

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
    (id: string, order_number?: string) => {
      setSelectedOrder({ id, order_number });
      voidDialog.onTrue();
    },
    [voidDialog]
  );

  const handleConvertRow = useCallback(
    (id: string, order_number?: string) => {
      setSelectedOrder({ id, order_number });
      convertDialog.onTrue();
    },
    [convertDialog]
  );

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
          <PurchaseOrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            suppliers={suppliers}
            pdvs={allPDVs}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataInPage.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataInPage.map((row) => row.id)
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
                  rowCount={dataInPage.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataInPage.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataInPage.map((row) => (
                    <PurchaseOrderTableRow
                      key={row.id}
                      row={row}
                      pdvName={pdvNameById.get(row.pdv_id)}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onConvertRow={() => handleConvertRow(row.id, row.order_number)}
                      onVoidRow={() => handleVoidRow(row.id, row.order_number)}
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

      <ConvertPOToBillDialog
        open={convertDialog.value}
        onClose={convertDialog.onFalse}
        poId={selectedOrder?.id || ''}
        poNumber={selectedOrder?.order_number}
        onSuccess={(billId) => {
          convertDialog.onFalse();
          if (billId) {
            router.push(paths.dashboard.bill.details(billId));
          }
        }}
      />

      <VoidPurchaseOrderDialog
        open={voidDialog.value}
        onClose={voidDialog.onFalse}
        poId={selectedOrder?.id || ''}
        poNumber={selectedOrder?.order_number}
      />
    </>
  );
}
