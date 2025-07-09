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
import ReactToPrint from 'react-to-print';
import { useTranslation } from 'react-i18next';
import { FormControlLabel, Switch } from '@mui/material';
// ----------------------------------------------------------------------

const EXPORT_NAME = 'puntos de venta';

export default function PDVSTableToolbar({
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

  const { t } = useTranslation();
  const handleFilterStock = useCallback(
    (event) => {
      onFilters(
        'municipio',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );
  const handleFilterMain = useCallback(
    (event) => {
      // switch component
      // onFilters('main', event.target.checked);
      onFilters('main', event.target.checked);
    },
    [onFilters]
  );
  const downloadExcel = (data) => {
    const worksheetData = [
      // Header row data
      {
        name: 'Nombre',
        description: 'Descripción',
        address: 'Dirección',
        phone: 'Teléfono',
        location: 'Municipio'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { skipHeader: true });

    // Apply the headerStyle to the header row
    const headerStyle = {
      fill: {
        fgColor: { rgb: 'FFFF0000' } // Red color, you can change the RGB code as desired
      },
      font: {
        color: { rgb: 'FFFFFFFF' }, // White text color for better visibility
        bold: true
      }
    };

    Object.keys(worksheet).forEach((cellRef) => {
      if (cellRef.endsWith('1')) {
        // Check if the cell is in the first row (header)
        const cell = worksheet[cellRef];
        cell.s = headerStyle; // Apply the headerStyle to the cell
      }
    });

    let rowIndex = 2; // Start from the second row to avoid overwriting the header

    dataFiltered.forEach((pdv) => {
      const rowData = {
        name: pdv.name,
        description: pdv.description,
        address: pdv.address,
        phone: pdv.phone,
        location: pdv.location.name // Extract the name from the location object
      };
      XLSX.utils.sheet_add_json(worksheet, [rowData], { skipHeader: true, origin: `A${rowIndex}` });
      // eslint-disable-next-line no-plusplus
      rowIndex++;
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PDVsSheet');

    XLSX.writeFile(workbook, `${EXPORT_NAME}.xlsx`);
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row'
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            placeholder="Buscar (nombre o dirección)"
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
          <InputLabel>{t('Municipio')}</InputLabel>

          <Select
            multiple
            value={filters.municipio}
            onChange={handleFilterStock}
            input={<OutlinedInput label="Municipio" />}
            renderValue={(selected) => selected.map((value) => value).join(', ')}
            sx={{ textTransform: 'capitalize' }}
          >
            {stockOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox disableRipple size="small" checked={filters.municipio.includes(option.value)} />
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
          <FormControlLabel control={<Switch checked={filters.main} onChange={handleFilterMain} />} label="Principal" />
        </FormControl>

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

PDVSTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  publishOptions: PropTypes.array,
  stockOptions: PropTypes.array,
  dataFiltered: PropTypes.array,
  componentRef: PropTypes.any
};
