import PropTypes from 'prop-types';
import { useCallback } from 'react';
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
// ----------------------------------------------------------------------

const EXPORT_NAME = 'productos';

export default function ProductTableToolbar({
  categoryView,
  filters,
  onFilters,
  dataFiltered,
  //
  stockOptions,
  publishOptions,
  componentRef
}) {
  const popover = usePopover();
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStock = useCallback(
    (event) => {
      onFilters('stock', typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
    },
    [onFilters]
  );

  const handleFilterPublish = useCallback(
    (event) => {
      onFilters('publish', typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value);
    },
    [onFilters]
  );
  const downloadExcel = (data) => {
    const worksheetData = headerTable;

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    let rowIndex = 2; // Start from the second row to avoid overwriting the header

    data.forEach((product) => {
      product.productPdv.forEach((pdv) => {
        const rowData = {
          id: product.id,
          name: product.name,
          description: product.description,
          code: product.code,
          images: product.images.join(', '), // Assuming images is an array
          typeProduct: product.typeProduct,
          state: product.state,
          sellInNegative: product.sellInNegative,
          taxesOption: product.taxesOption,
          sku: product.sku,
          priceSale: product.priceSale,
          priceBase: product.priceBase,
          quantityStock: product.quantityStock,
          pdvName: pdv.pdv.name,
          minQuantity: pdv.minQuantity,
          maxQuantity: pdv.maxQuantity,
          pdvQuantity: pdv.quantity,
          category: product.category
        };
        XLSX.utils.sheet_add_json(worksheet, [rowData], { skipHeader: true, origin: `A${rowIndex}` });
        rowIndex++;
      });
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${EXPORT_NAME}.xlsx`);
  };

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

            <FormControl
              sx={{
                flexShrink: 0,
                width: { xs: 1, md: 200 }
              }}
            >
              <InputLabel>Precio</InputLabel>

              <Select
                multiple
                value={filters.publish}
                onChange={handleFilterPublish}
                input={<OutlinedInput label="Publish" />}
                renderValue={(selected) => selected.map((value) => value).join(', ')}
                sx={{ textTransform: 'capitalize' }}
              >
                {publishOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Checkbox disableRipple size="small" checked={filters.publish.includes(option.value)} />
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

        <IconButton color="primary" onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <ReactToPrint
          trigger={() => (
            <MenuItem>
              <Iconify icon="solar:printer-minimalistic-bold" /> Imprimir{' '}
            </MenuItem>
          )}
          content={() => componentRef.current}
        />

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
          onClick={() => {
            downloadExcel(dataFiltered);
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exportar
        </MenuItem>
      </CustomPopover>
    </>
  );
}

ProductTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  publishOptions: PropTypes.array,
  stockOptions: PropTypes.array,
  dataFiltered: PropTypes.array,
  componentRef: PropTypes.any
};
