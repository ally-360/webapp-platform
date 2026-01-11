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
import {
  useGetDebitNotesQuery,
  useDeleteDebitNoteMutation,
  useVoidDebitNoteMutation
} from 'src/redux/services/debitNotesApi';
// types
import type { DebitNoteTableFilters, DebitNoteTableFilterValue } from 'src/types/debit-note';
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
//
import DebitNoteTableRow from '../debit-note-table-row';
import DebitNoteTableToolbar from '../debit-note-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'number', label: 'Número' },
  { id: 'customer', label: 'Cliente' },
  { id: 'invoice', label: 'Factura' },
  { id: 'type', label: 'Tipo' },
  { id: 'total', label: 'Total' },
  { id: 'status', label: 'Estado' },
  { id: '' }
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'interest', label: 'Intereses' },
  { value: 'price_adjustment', label: 'Ajuste de Precio' },
  { value: 'additional_charge', label: 'Cargo Adicional' },
  { value: 'other', label: 'Otro' }
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'open', label: 'Abierta' },
  { value: 'applied', label: 'Aplicada' },
  { value: 'void', label: 'Anulada' }
];

const defaultFilters: DebitNoteTableFilters = {
  customer: '',
  type: 'all',
  status: 'all',
  startDate: null,
  endDate: null
};

// ----------------------------------------------------------------------

export default function DebitNoteListView() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const confirm = useBoolean(false);

  const [filters, setFilters] = useState(defaultFilters);

  // RTK Query
  const { data, isLoading } = useGetDebitNotesQuery({
    limit: table.rowsPerPage,
    offset: table.page * table.rowsPerPage,
    ...(filters.type !== 'all' && { type: filters.type as any }),
    ...(filters.status !== 'all' && { status: filters.status as any }),
    ...(filters.startDate && { date_from: filters.startDate.toISOString().split('T')[0] }),
    ...(filters.endDate && { date_to: filters.endDate.toISOString().split('T')[0] })
  });

  const [deleteDebitNote] = useDeleteDebitNoteMutation();
  const [voidDebitNote] = useVoidDebitNoteMutation();

  const totalCount = data?.total || 0;

  // Filtro local por cliente
  const dataFiltered = useMemo(() => {
    const debitNotes = data?.items || [];

    if (!filters.customer) return debitNotes;

    return debitNotes.filter((note) => note.customer_name?.toLowerCase().includes(filters.customer!.toLowerCase()));
  }, [data?.items, filters.customer]);

  const denseHeight = table.dense ? 52 : 72;
  const notFound = !isLoading && !dataFiltered.length;

  const handleFilters = useCallback(
    (name: string, value: DebitNoteTableFilterValue) => {
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
        await deleteDebitNote(id).unwrap();
        enqueueSnackbar('Nota débito eliminada exitosamente', { variant: 'success' });
      } catch (error) {
        console.error('Error deleting debit note:', error);
        enqueueSnackbar('Error al eliminar la nota débito', { variant: 'error' });
      }
    },
    [deleteDebitNote, enqueueSnackbar]
  );

  const handleVoidRow = useCallback(
    async (id: string) => {
      try {
        await voidDebitNote(id).unwrap();
        enqueueSnackbar('Nota débito anulada exitosamente', { variant: 'success' });
      } catch (error) {
        console.error('Error voiding debit note:', error);
        enqueueSnackbar('Error al anular la nota débito', { variant: 'error' });
      }
    },
    [voidDebitNote, enqueueSnackbar]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.debitNotes.details(id));
    },
    [router]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.debitNotes.edit(id));
    },
    [router]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Notas Débito"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Notas Débito', href: paths.dashboard.debitNotes.root },
          { name: 'Listado' }
        ]}
        icon="solar:document-text-bold"
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.debitNotes.new}
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
        <DebitNoteTableToolbar
          filters={filters}
          onFilters={handleFilters}
          typeOptions={TYPE_OPTIONS}
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
                {dataFiltered
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row) => (
                    <DebitNoteTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onVoidRow={() => handleVoidRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
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
          count={totalCount}
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
  );
}
