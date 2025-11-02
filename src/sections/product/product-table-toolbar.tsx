import React, { useCallback, useMemo } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import * as XLSX from 'xlsx';
import { headerTable } from 'src/sections/product/constantsTableExportData';
import ReactToPrint from 'react-to-print';
// import { SliderThumb } from '@mui/material';
// import { useAppSelector } from 'src/hooks/store';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

const EXPORT_NAME = 'productos';

interface ProductTableToolbarProps {
  categoryView: boolean;
  filters: any;
  onFilters: any;
  dataFiltered: any;
  stockOptions: any;
  publishOptions: any;
  componentRef: any;
  onOpenFilters?: VoidFunction;
}

// PDF Styles and Component outside render to satisfy lint
const pdfStyles = StyleSheet.create({
  page: { padding: 24, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 8 },
  header: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 6, marginBottom: 6 },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, paddingVertical: 4 },
  cell: { flex: 1, paddingRight: 6 },
  small: { flex: 0.6 },
  large: { flex: 1.6 }
});

function ProductsPDF({ rows }: { rows: any[] }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Listado de productos</Text>
        <View style={pdfStyles.header}>
          <Text style={[pdfStyles.cell, pdfStyles.small]}>Código</Text>
          <Text style={[pdfStyles.cell, pdfStyles.large]}>Nombre</Text>
          <Text style={pdfStyles.cell}>Precio</Text>
          <Text style={pdfStyles.cell}>Stock</Text>
          <Text style={pdfStyles.cell}>PDV</Text>
        </View>
        {(rows || []).flatMap((product) => {
          const pdvs = product.productPdv && product.productPdv.length ? product.productPdv : [null];
          return pdvs.map((pdv) => (
            <View key={`${product.id}-${pdv ? pdv.pdv_id : 'none'}`} style={pdfStyles.row}>
              <Text style={[pdfStyles.cell, pdfStyles.small]}>{product.barCode || ''}</Text>
              <Text style={[pdfStyles.cell, pdfStyles.large]}>{product.name}</Text>
              <Text style={pdfStyles.cell}>${product.priceSale}</Text>
              <Text style={pdfStyles.cell}>{product.quantityStock}</Text>
              <Text style={pdfStyles.cell}>{pdv ? `${pdv.pdv_name} (${pdv.quantity})` : '-'}</Text>
            </View>
          ));
        })}
      </Page>
    </Document>
  );
}

export default function ProductTableToolbar({
  categoryView,
  filters,
  onFilters,
  dataFiltered,
  //
  stockOptions,
  publishOptions: _publishOptions,
  componentRef,
  onOpenFilters
}: ProductTableToolbarProps) {
  const popover = usePopover();
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  // const { products } = useAppSelector((state) => state.products);

  // Price options

  // const [priceOptions] = useState({ minPrice: 0, maxPrice: 0 });

  const handleFilterStock = useCallback(
    (event) => {
      onFilters('stock', typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
    },
    [onFilters]
  );

  // const handleFilterPublish = useCallback(
  //   (event) => {
  //     onFilters('publish', typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
  //   },
  //   [onFilters]
  // );
  const downloadExcel = (data) => {
    const worksheetData = headerTable;

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    let rowIndex = 2; // Start from the second row to avoid overwriting the header

    data.forEach((product) => {
      (product.productPdv || []).forEach((pdv) => {
        const rowData = {
          id: product.id,
          name: product.name,
          description: product.description,
          code: product.barCode,
          images: Array.isArray(product.images) ? product.images.join(', ') : '',
          typeProduct: product.typeProduct,
          state: product.state,
          sellInNegative: product.sellInNegative,
          taxesOption: product.taxesOption,
          sku: product.sku,
          priceSale: product.priceSale,
          priceBase: product.priceBase,
          quantityStock: product.quantityStock,
          pdvName: pdv.pdv_name,
          minQuantity: pdv.min_quantity,
          pdvQuantity: pdv.quantity,
          category: product.category?.name
        };
        XLSX.utils.sheet_add_json(worksheet, [rowData], {
          skipHeader: true,
          origin: `A${rowIndex}`
        });
        // eslint-disable-next-line no-plusplus
        rowIndex++;
      });
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${EXPORT_NAME}.xlsx`);
  };

  // PDF download link element
  const pdfLink = useMemo(
    () => (
      <PDFDownloadLink
        document={<ProductsPDF rows={dataFiltered} />}
        fileName={`${EXPORT_NAME}.pdf`}
        style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
      >
        <MenuItem>
          <Iconify icon="solar:document-bold" /> PDF
        </MenuItem>
      </PDFDownloadLink>
    ),
    [dataFiltered]
  );

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: categoryView ? 'row' : 'column',
          md: 'row'
        }}
        sx={{
          p: categoryView ? '20px 0px' : 2.5,
          pr: { xs: 2.5, md: 1 }
        }}
      >
        {!categoryView ? (
          <>
            <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
              <TextField
                fullWidth
                value={filters.name}
                onChange={handleFilterName}
                placeholder="Buscar (sku o nombre)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Stack>
            <FormControl
              sx={{
                flexShrink: 0,
                width: { xs: 1, md: 200 }
              }}
            >
              <InputLabel>Cantidad</InputLabel>

              <Select
                multiple
                value={filters.stock}
                onChange={handleFilterStock}
                input={<OutlinedInput label="Existencias" />}
                renderValue={(selected) => selected.map((value) => value).join(', ')}
                sx={{ textTransform: 'capitalize' }}
              >
                {stockOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox disableRipple size="small" checked={filters.stock.includes(option.value)} />
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* <FormControl
              sx={{
                flexShrink: 0,
                width: { xs: 1, md: 200 }
              }}
            >
              <Typography gutterBottom>Rango de precios</Typography>
              <Slider
                color="primary"
                size="medium"
                valueLabelDisplay="auto"
                marks
                aria-label="pretto slider"
                min={priceOptions.minPrice}
                max={priceOptions.maxPrice}
                slots={{ thumb: AirbnbThumbComponent }}
                getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
                defaultValue={[20, 40]}
              />
            </FormControl> */}
          </>
        ) : (
          <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
            <TextField
              fullWidth
              value={filters.name}
              onChange={handleFilterName}
              placeholder="Buscar (sku o nombre)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        )}

        {onOpenFilters && !categoryView && (
          <IconButton
            color="primary"
            onClick={onOpenFilters}
            sx={{
              bgcolor: 'action.selected'
            }}
          >
            <Iconify icon="solar:filter-bold" />
          </IconButton>
        )}

        <IconButton color="primary" onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 180 }}>
        <ReactToPrint
          trigger={() => (
            <MenuItem>
              <Iconify icon="solar:printer-minimalistic-bold" /> Imprimir{' '}
            </MenuItem>
          )}
          content={() => componentRef.current}
        />

        {pdfLink}

        <MenuItem
          onClick={() => {
            downloadExcel(dataFiltered);
          }}
        >
          <Iconify icon="solar:export-bold" />
          Excel
        </MenuItem>
      </CustomPopover>
    </>
  );
}

// function AirbnbThumbComponent(props) {
//   const { children, ...other } = props;
//   return (
//     <SliderThumb {...other}>
//       {children}
//       <span className="airbnb-bar" />
//       <span className="airbnb-bar" />
//       <span className="airbnb-bar" />
//     </SliderThumb>
//   );
// }
