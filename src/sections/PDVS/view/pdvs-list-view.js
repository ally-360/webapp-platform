/* eslint-disable prettier/prettier */
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback, useRef } from 'react';
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
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { useSettingsContext } from 'src/components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableSkeleton,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
// eslint-disable-next-line import/no-extraneous-dependencies
import { useDispatch, useSelector } from 'react-redux';
import { deletePDV, getAllPDVS, getAllPDVSWhitoutLoading, setSeePDV, switchPopup } from 'src/redux/inventory/pdvsSlice';
import PDVSTableRow from '../pdvs-table-row';
import PDVSTableToolbar from '../pdvs-table-toolbar';
import PDVSTableFiltersResult from '../pdvs-table-filters-result';
import FormPDVS from '../pdv-new-edit-form';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Nombre', minWidth: 220, align: 'left', width: 150 },
  { id: 'description', label: 'Dirección', width: 200, maxWidth: 250 },
  { id: 'location', label: 'Municipio', width: 160, maxWidth: 160,  },
  { id: 'main', label: 'Principal', width: 20, align: 'left' },
  { id: '', width: 88 }
];

const defaultFilters = {
  name: '',
  address: '',
  main: false,
  municipio: []
};

// ----------------------------------------------------------------------

export default function PdvsListView() {

  const [MUNICIPIO_OPTIONS, SETMUNICIPIO_OPTIONS] = useState([]);

  // Ref component to print
  const componentRef = useRef();

  const table = useTable();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  // const { products, pdvsLoading, pdvsEmpty } = useSelector((state) => state.products);

  const {pdvs , pdvsLoading, pdvsEmpty} = useSelector((state) => state.pdvs);

  const dispatch = useDispatch();

  useEffect(() => {

    dispatch(getAllPDVSWhitoutLoading());
    
  }, [dispatch]);

  useEffect(() => {
    if (pdvs.length) {
      const municipios = pdvs.map((pdv) => ({ value: pdv.location.name, label: pdv.location.name }));
      // Eliminar duplicados
      const municipiosSinDuplicados = municipios.filter((municipio, index, self) => self.findIndex((m) => m.value === municipio.value) === index);
      SETMUNICIPIO_OPTIONS(municipiosSinDuplicados);
    }
  }, [pdvs]);


  const confirm = useBoolean();

  useEffect(() => {
    if (pdvs.length) {
      setTableData(pdvs.map((pdv) => ({ ...pdv, location: pdv.location.name }) ));
    }
  }, [pdvs]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 60 : 80;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || pdvsEmpty;

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


  const handleDeleteRows = useCallback(() => {
    table.selected.forEach((id) => {
      dispatch(deletePDV(id));
    });

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length
    });
    
  }, [dataFiltered.length, dataInPage.length, dispatch, table, tableData.length]);

  
  const handleEditRow = useCallback(
    (id) => {
      dispatch(switchPopup(id));
    },
    [dispatch]
  );

  const handleViewRow = useCallback(
    (id) => {
      dispatch(setSeePDV({ seePDV: true, id }));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // nueva logica


  const handleDeleteRow = useCallback(
    (id) => {
      dispatch(deletePDV(id));
    },
    [ dispatch ]
  );

  // Popup create punto de venta

  
  const { openPopup } = useSelector((state) => state.pdvs);


  return (
    <>
      <Container ref={componentRef} maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Puntos de venta"
          icon="ic:round-store"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            {
              name: 'Inventario',
              href: paths.dashboard.inventory.list
            },
            { name: 'Puntos de venta' }
          ]}
          action={
            <Button
              onClick={() => dispatch(switchPopup())}
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Crear Punto De Venta
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <PDVSTableToolbar
            filters={filters}
            componentRef={componentRef}
            dataFiltered={dataFiltered}
            onFilters={handleFilters}
            //
            stockOptions={MUNICIPIO_OPTIONS}
          />

          {canReset && (
            <PDVSTableFiltersResult
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
                <Tooltip title="Delete">
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
                  {pdvsLoading ? (
                    [...Array(table.rowsPerPage)].map((i, index) => (
                      <TableSkeleton key={index} sx={{ height: denseHeight }} />
                    ))
                  ) : (
                    <>
                      {dataFiltered
                        .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                        .map((row) => (
                          <PDVSTableRow
                            key={row.id}
                            row={row}
                            selected={table.selected.includes(row.id)}
                            onSelectRow={() => table.onSelectRow(row.id)}
                            onDeleteRow={() => handleDeleteRow(row.id)}
                            onEditRow={() => handleEditRow(row.id)}
                            onViewRow={() => handleViewRow(row.id)}
                          />
                        ))}
                    </>
                  )}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
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
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Eliminar Puntos de venta"
        content={
          <>
            ¿Esta seguro que desea eliminar <strong> {table.selected.length} </strong> Puntos de venta?
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

// Filtros
function applyFilter({ inputData, comparator, filters }) {
  const { name, municipio, main } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {

    console.log(inputData);
    const order = comparator(a[0], b[0]);

    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (product) =>
        product.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        product.address.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (municipio.length) {
    inputData = inputData.filter((product) => municipio.includes(product.location));
  }

  if (main) {
    inputData = inputData.filter((product) => product.main === main);
  }

  return inputData;
}
