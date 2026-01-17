import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// ----------------------------------------------------------------------

type Props = {
  filters: {
    supplier: string;
    bill: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
  };
  onFilters: (name: string, value: any) => void;
  onResetFilters: VoidFunction;
  statusOptions: { value: string; label: string }[];
};

// ----------------------------------------------------------------------

export default function ExpenseDebitNoteTableToolbar({ filters, onFilters, onResetFilters, statusOptions }: Props) {
  const popover = usePopover();

  const handleFilterSupplier = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('supplier', event.target.value);
    },
    [onFilters]
  );

  const handleFilterBill = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('bill', event.target.value);
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
        <DatePicker
          label="Fecha inicio"
          value={filters.startDate}
          onChange={handleFilterStartDate}
          slotProps={{
            textField: {
              fullWidth: true
            }
          }}
          sx={{
            maxWidth: { md: 200 }
          }}
        />

        <DatePicker
          label="Fecha fin"
          value={filters.endDate}
          onChange={handleFilterEndDate}
          slotProps={{
            textField: {
              fullWidth: true
            }
          }}
          sx={{
            maxWidth: { md: 200 }
          }}
        />

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
            renderValue={(selected) => statusOptions.find((option) => option.value === selected)?.label}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.supplier}
            onChange={handleFilterSupplier}
            placeholder="Buscar proveedor..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            value={filters.bill}
            onChange={handleFilterBill}
            placeholder="Buscar factura..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="solar:document-text-bold" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 140 }}>
        <MenuItem
          onClick={() => {
            popover.onClose();
            onResetFilters();
          }}
        >
          <Iconify icon="solar:restart-bold" />
          Limpiar
        </MenuItem>
      </CustomPopover>
    </>
  );
}
