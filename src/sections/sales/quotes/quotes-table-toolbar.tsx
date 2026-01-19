import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
// @mui
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    search: string;
    customer_id: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  onFilters: (name: string, value: any) => void;
  onResetFilters: VoidFunction;
  customers: any[];
  dateError: boolean;
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'sent', label: 'Enviada' },
  { value: 'accepted', label: 'Aceptada' },
  { value: 'rejected', label: 'Rechazada' },
  { value: 'expired', label: 'Vencida' },
  { value: 'converted', label: 'Convertida' }
];

// ----------------------------------------------------------------------

export default function QuotesTableToolbar({ filters, onFilters, onResetFilters, customers, dateError }: Props) {
  const popover = usePopover();

  const selectedCustomer = customers.find((c: any) => c.id === filters.customer_id) || null;

  const handleFilterSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onFilters('search', event.target.value);
    },
    [onFilters]
  );

  const handleFilterCustomer = useCallback(
    (_event: any, newValue: any) => {
      onFilters('customer_id', newValue?.id || '');
    },
    [onFilters]
  );

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent) => {
      onFilters('status', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('startDate', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('endDate', newValue);
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
        <TextField
          fullWidth
          size="small"
          value={filters.search}
          onChange={handleFilterSearch}
          placeholder="Buscar cotización..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            )
          }}
          sx={{
            maxWidth: { md: 260 }
          }}
        />

        <Autocomplete
          fullWidth
          size="small"
          value={selectedCustomer}
          options={customers}
          onChange={handleFilterCustomer}
          getOptionLabel={(option: any) => option?.name || ''}
          isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
          renderInput={(params) => <TextField {...params} label="Cliente" placeholder="Seleccionar cliente" />}
          sx={{
            maxWidth: { md: 280 }
          }}
        />

        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 }
          }}
        >
          <InputLabel size="small">Estado</InputLabel>
          <Select
            size="small"
            value={filters.status}
            onChange={handleFilterStatus}
            input={<OutlinedInput label="Estado" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 }
              }
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Fecha desde"
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
          sx={{
            maxWidth: { md: 180 }
          }}
        />

        <DatePicker
          label="Fecha hasta"
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
              error: dateError
            }
          }}
          sx={{
            maxWidth: { md: 180 }
          }}
        />

        <IconButton onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            popover.onClose();
            onResetFilters();
          }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Limpiar
        </MenuItem>
      </CustomPopover>
    </>
  );
}
