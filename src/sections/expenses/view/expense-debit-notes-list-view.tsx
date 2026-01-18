import { useState, useCallback, useMemo } from 'react';
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
import { useGetDebitNotesQuery, useVoidDebitNoteMutation } from 'src/redux/services/billsApi';
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
import ExpenseDebitNoteTableRow from '../expense-debit-note-table-row';
import ExpenseDebitNoteTableToolbar from '../expense-debit-note-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'issue_date', label: 'Fecha' },
  { id: 'supplier', label: 'Proveedor' },
  { id: 'bill', label: 'Factura' },
  { id: 'total', label: 'Total' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abierta' },
  { value: 'void', label: 'Anulada' }
];

type FiltersType = {
  supplier: string;
  bill: string;
  status: 'all' | 'open' | 'void';
  startDate: Date | null;
  endDate: Date | null;
};

const defaultFilters: FiltersType = {
  supplier: '',
  bill: '',
  status: 'all',
  startDate: null,
  endDate: null
};

// ----------------------------------------------------------------------

export default function ExpenseDebitNotesListView() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useBoolean(false);

  const [filters, setFilters] = useState(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // RTK Query
  const { data, isLoading } = useGetDebitNotesQuery({
    limit: table.rowsPerPage,
    offset: table.page * table.rowsPerPage,
    ...(filters.status !== 'all' && { status: filters.status }),
    ...(filters.startDate && { date_from: filters.startDate.toISOString().split('T')[0] }),
    ...(filters.endDate && { date_to: filters.endDate.toISOString().split('T')[0] })
  });

  const [voidDebitNote, { isLoading: isVoiding }] = useVoidDebitNoteMutation();

  const totalCount = data?.length || 0;

  // Filtro local por proveedor y factura
  const dataFiltered = useMemo(() => {
    const debitNotes = data || [];

    return debitNotes.filter((note) => {
      const matchSupplier =
        !filters.supplier ||
        note.supplier_name?.toLowerCase().includes(filters.supplier.toLowerCase()) ||
        note.supplier?.name?.toLowerCase().includes(filters.supplier.toLowerCase());

      const matchBill = !filters.bill || note.bill?.number?.toLowerCase().includes(filters.bill.toLowerCase());

      return matchSupplier && matchBill;
    });
  }, [data, filters.supplier, filters.bill]);

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
  }, []);

  const handleVoidRow = useCallback(
    async (id: string) => {
      try {
        await voidDebitNote({ id }).unwrap();
        enqueueSnackbar('Nota débito anulada exitosamente', { variant: 'success' });
      } catch (error: any) {
        console.error('Error voiding debit note:', error);
        enqueueSnackbar(error?.data?.message || 'Error al anular la nota débito', {
          variant: 'error'
        });
      }
    },
    [voidDebitNote, enqueueSnackbar]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.expenses.debitNotes.details(id));
    },
    [router]
  );

  const handleConfirmVoid = useCallback(() => {
    if (selectedId) {
      handleVoidRow(selectedId);
      setSelectedId(null);
      confirm.onFalse();
    }
  }, [selectedId, handleVoidRow, confirm]);

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Notas Débito"
          subHeading="Gestiona las notas débito de tus facturas de compra. Reduce el saldo de cuentas por pagar por devoluciones, ajustes de precio o correcciones."
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Gastos', href: paths.dashboard.bill.root },
            { name: 'Notas Débito' }
          ]}
          icon="solar:document-text-bold"
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.expenses.debitNotes.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Nueva Nota Débito
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 }
          }}
        />

        <Card>
          <ExpenseDebitNoteTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            statusOptions={STATUS_OPTIONS}
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
                <Tooltip title="Anular seleccionadas">
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
                  {dataFiltered
                    .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                    .map((row) => (
                      <ExpenseDebitNoteTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onVoidRow={() => {
                          setSelectedId(row.id);
                          confirm.onTrue();
                        }}
                        onViewRow={() => handleViewRow(row.id)}
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
        title="Anular Nota Débito"
        content="¿Está seguro de anular esta nota débito? Esta acción no se puede deshacer."
        action={
          <Button variant="contained" color="error" onClick={handleConfirmVoid} disabled={isVoiding}>
            Anular
          </Button>
        }
      />
    </>
  );
}
