/* eslint-disable no-nested-ternary */
import { useState, useCallback, useRef, useEffect } from 'react';
import isEqual from 'lodash/isEqual';
// @mui
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
// redux
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSettingsContext } from 'src/components/settings';
// _mock
import { PRODUCT_STOCK_OPTIONS } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table';
//
import { useGetProductsQuery, useDeleteProductMutation } from 'src/redux/services/productsApi';
import { useAuthContext } from 'src/auth/hooks';
import Scrollbar from 'src/components/scrollbar';
import ProductTableRow from '../product-table-row';
import ProductTableToolbar from '../product-table-toolbar';
import ProductTableFiltersResult from '../product-table-filters-result';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Producto' },
  { id: 'sku', label: 'SKU', width: 160 },
  { id: 'quantityStock', label: 'Cantidad', width: 160 },
  { id: 'priceSale', label: 'Price', width: 140 },
  { id: 'state', label: 'Estado', width: 110 },
  { id: '', width: 88 }
];

const PUBLISH_OPTIONS = [
  { value: true, label: 'Activo' },
  { value: false, label: 'Desactivado' }
];

const defaultFilters = {
  name: '',
  sku: '',
  publish: [],
  stock: []
};

// ----------------------------------------------------------------------

interface ProductListViewProps {
  categoryView?: boolean | any;
  brandView?: any;
}

export default function ProductListView({ categoryView = false, brandView }: ProductListViewProps) {
  const theme = useTheme();
  const router = useRouter();

  const { user } = useAuthContext();

  const componentRef = useRef<HTMLDivElement>(null);
  const table = useTable(true);
  const settings = useSettingsContext();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [filters, setFilters] = useState(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const confirm = useBoolean(false);

  const categoryId = typeof categoryView === 'object' && categoryView?.id ? categoryView.id : undefined;
  const brandId = brandView?.id || undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.name.length >= 2 || filters.name.length === 0) {
        setDebouncedSearch(filters.name);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.name]);

  // RTK QUERY - PRODUCTOS
  // ========================================

  const {
    data: productsData,
    isLoading: productsLoading,
    refetch: refetchProducts
  } = useGetProductsQuery(
    {
      page: table.page + 1,
      limit: table.rowsPerPage,
      search: debouncedSearch || undefined,
      categoryId,
      brandId
    },
    {
      skip: !user || (debouncedSearch.length > 0 && debouncedSearch.length < 2) // Solo hacer request si hay usuario y búsqueda válida
    }
  );

  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (categoryId !== undefined || brandId !== undefined) {
      table.onResetPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, brandId]);

  // DATOS PROCESADOS
  // ========================================

  const tableData = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const productsEmpty = !productsLoading && tableData.length === 0;

  const dataFiltered = tableData;
  const dataInPage = tableData;

  const denseHeight = table.dense ? 60 : 80;

  // Determinar si estamos en vista de categoría o marca
  const isCategoryOrBrandView = categoryView !== false || brandView !== undefined;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || productsEmpty;

  // ========================================
  // 🎯 HANDLERS
  // ========================================

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

  const handleDeleteRows = useCallback(async () => {
    try {
      const deletePromises = table.selected.map((productId) => deleteProduct(productId).unwrap());
      await Promise.all(deletePromises);

      // Actualizar la paginación después del borrado
      table.onUpdatePageDeleteRows({
        totalRows: totalProducts,
        totalRowsInPage: tableData.length,
        totalRowsFiltered: totalProducts
      });

      // Refetch para actualizar la lista
      refetchProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  }, [deleteProduct, table, totalProducts, tableData.length, refetchProducts]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteProduct(id).unwrap();
        refetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    [deleteProduct, refetchProducts]
  );

  // ========================================
  // 🎨 RENDER
  // ========================================

  return (
    <>
      {!isCategoryOrBrandView ? (
        <Container ref={componentRef} maxWidth={settings.themeStretch ? false : 'lg'}>
          <CustomBreadcrumbs
            heading="Productos"
            icon="icon-park-outline:ad-product"
            activeLast
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              {
                name: 'Inventario',
                href: paths.dashboard.inventory.list
              },
              { name: 'Productos' }
            ]}
            action={
              <>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.bill.newBill}
                  variant="contained"
                  color="primary"
                  style={{ marginRight: 10 }}
                  sx={isMobile ? { flex: 1 } : undefined}
                  startIcon={<Iconify width={24} icon="mdi:box-variant-closed-add" />}
                >
                  Abastecer
                </Button>
                <Button
                  component={RouterLink}
                  href={paths.dashboard.product.new}
                  variant="contained"
                  sx={isMobile ? { flex: 1 } : undefined}
                  color="primary"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                >
                  Crear producto
                </Button>
              </>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          <Card>
            <ProductTableToolbar
              filters={filters}
              componentRef={componentRef}
              dataFiltered={dataFiltered}
              onFilters={handleFilters}
              categoryView={isCategoryOrBrandView}
              //
              stockOptions={PRODUCT_STOCK_OPTIONS}
              publishOptions={PUBLISH_OPTIONS}
            />
            {canReset && (
              <ProductTableFiltersResult
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
                    {productsLoading &&
                      Array.from({ length: table.rowsPerPage }, (_, index) => (
                        <ProductTableRow key={index} row={null} selected={false} loading />
                      ))}

                    {!productsLoading &&
                      dataInPage.map((row) => (
                        <ProductTableRow
                          key={row.id}
                          row={row}
                          selected={table.selected.includes(row.id)}
                          onSelectRow={() => table.onSelectRow(row.id)}
                          onDeleteRow={() => handleDeleteRow(row.id)}
                          onEditRow={() => handleEditRow(row.id)}
                          onViewRow={() => handleViewRow(row.id)}
                        />
                      ))}

                    <TableNoData notFound={notFound} text="No se encontraron productos" />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>{' '}
            <TablePaginationCustom
              count={totalProducts}
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
      ) : (
        <>
          {/* Vista de categoría simplificada */}
          <ProductTableToolbar
            filters={filters}
            componentRef={componentRef}
            dataFiltered={dataFiltered}
            onFilters={handleFilters}
            categoryView={isCategoryOrBrandView}
            //
            stockOptions={PRODUCT_STOCK_OPTIONS}
            publishOptions={PUBLISH_OPTIONS}
          />
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
                  {productsLoading &&
                    Array.from({ length: table.rowsPerPage }, (_, index) => (
                      <ProductTableRow key={index} row={null} selected={false} loading />
                    ))}

                  {!productsLoading &&
                    dataInPage.map((row) => (
                      <ProductTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                      />
                    ))}
                  <TableNoData notFound={notFound} text="No hay productos en esta categoría" />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={totalProducts}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </>
      )}

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            ¿Esta seguro que desea eliminar <strong> {table.selected.length} </strong> producto(s)?
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
