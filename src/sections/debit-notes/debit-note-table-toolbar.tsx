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
import Select, { SelectChangeEvent } from '@mui/material/Select';
// types
import { DebitNoteTableFilters, DebitNoteTableFilterValue } from 'src/types/debit-note';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  filters: DebitNoteTableFilters;
  onFilters: (name: string, value: DebitNoteTableFilterValue) => void;
  //
  typeOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
};

export default function DebitNoteTableToolbar({ filters, onFilters, typeOptions, statusOptions }: Props) {
  const popover = usePopover();

  const handleFilterCustomer = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('customer', event.target.value);
    },
    [onFilters]
  );

  const handleFilterType = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('type', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

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
        {/* Buscador por cliente */}
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.customer}
            onChange={handleFilterCustomer}
            placeholder="Buscar por cliente..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>

        {/* Filtro por tipo */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 }
          }}
        >
          <InputLabel>Tipo</InputLabel>

          <Select
            value={filters.type}
            onChange={handleFilterType}
            input={<OutlinedInput label="Tipo" />}
            renderValue={(selected) => typeOptions.find((option) => option.value === selected)?.label || 'Todos'}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 }
              }
            }}
          >
            {typeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox disableRipple size="small" checked={filters.type === option.value} />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Filtro por estado */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 }
          }}
        >
          <InputLabel>Estado</InputLabel>

          <Select
            value={filters.status}
            onChange={handleFilterStatus}
            input={<OutlinedInput label="Estado" />}
            renderValue={(selected) => statusOptions.find((option) => option.value === selected)?.label || 'Todos'}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 }
              }
            }}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Checkbox disableRipple size="small" checked={filters.status === option.value} />
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Imprimir
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Importar
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:export-bold" />
          Exportar
        </MenuItem>
      </CustomPopover>
    </>
  );
}
