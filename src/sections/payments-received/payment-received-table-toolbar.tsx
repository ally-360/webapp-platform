import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// types
import { PaymentReceivedFilters, PaymentMethod } from 'src/types/payment-received';

// ----------------------------------------------------------------------

type Props = {
  filters: PaymentReceivedFilters;
  onFilters: (name: string, value: any) => void;
  onResetFilters: () => void;
};

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' }
];

const INVOICE_TYPE_OPTIONS = [
  { value: 'SALE', label: 'Venta' },
  { value: 'POS', label: 'POS' }
];

export default function PaymentReceivedTableToolbar({ filters, onFilters, onResetFilters }: Props) {
  const popover = usePopover();

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('start_date', newValue);
    },
    [onFilters]
  );

  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('end_date', newValue);
    },
    [onFilters]
  );

  const handleFilterMethod = useCallback(
    (event: SelectChangeEvent<PaymentMethod | ''>) => {
      onFilters('payment_method', event.target.value === '' ? undefined : event.target.value);
    },
    [onFilters]
  );

  const handleFilterInvoiceType = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('invoice_type', event.target.value === '' ? undefined : event.target.value);
    },
    [onFilters]
  );

  const handleFilterMinAmount = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      onFilters('min_amount', value ? parseFloat(value) : undefined);
    },
    [onFilters]
  );

  const handleFilterMaxAmount = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      onFilters('max_amount', value ? parseFloat(value) : undefined);
    },
    [onFilters]
  );

  const handleFilterIncludeVoided = useCallback(
    (checked: boolean) => {
      onFilters('include_voided', checked);
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
        {/* Buscador */}
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name || ''}
            onChange={handleFilterName}
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
            <Iconify icon="ic:round-filter-list" />
          </IconButton>
        </Stack>

        {/* Filtro rápido: Método de pago */}
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 180 }
          }}
        >
          <InputLabel>Método</InputLabel>
          <Select
            value={filters.payment_method || ''}
            onChange={handleFilterMethod}
            input={<OutlinedInput label="Método" />}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 }
              }
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Popover de filtros avanzados */}
      <CustomPopover open={popover.open} onClose={popover.onClose} arrow="right-top" sx={{ width: 420, p: 0 }}>
        <Stack spacing={2.5} sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="ic:round-filter-list" width={20} />
              <strong>Filtros Avanzados</strong>
            </Stack>
            <Button
              variant="text"
              color="error"
              onClick={() => {
                onResetFilters();
                popover.onClose();
              }}
              startIcon={<Iconify icon="solar:restart-bold" />}
            >
              Limpiar
            </Button>
          </Stack>

          {/* Filtros de fecha */}
          <Stack spacing={1.5}>
            <InputLabel sx={{ typography: 'subtitle2' }}>Rango de Fechas</InputLabel>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Desde"
                value={filters.start_date}
                onChange={handleFilterStartDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  }
                }}
              />
              <DatePicker
                label="Hasta"
                value={filters.end_date}
                onChange={handleFilterEndDate}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  }
                }}
              />
            </Stack>
          </Stack>

          {/* Tipo de factura */}
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Factura</InputLabel>
            <Select
              value={filters.invoice_type || ''}
              onChange={handleFilterInvoiceType}
              input={<OutlinedInput label="Tipo de Factura" />}
            >
              <MenuItem value="">Todos</MenuItem>
              {INVOICE_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Rango de montos */}
          <Stack spacing={1.5}>
            <InputLabel sx={{ typography: 'subtitle2' }}>Rango de Montos</InputLabel>
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Monto mínimo"
                value={filters.min_amount || ''}
                onChange={handleFilterMinAmount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                inputProps={{ min: 0 }}
              />
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Monto máximo"
                value={filters.max_amount || ''}
                onChange={handleFilterMaxAmount}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                inputProps={{ min: 0 }}
              />
            </Stack>
          </Stack>

          {/* Incluir anulados */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <InputLabel sx={{ typography: 'subtitle2' }}>Incluir pagos anulados</InputLabel>
            <Button
              variant={filters.include_voided ? 'contained' : 'outlined'}
              size="small"
              color={filters.include_voided ? 'error' : 'inherit'}
              onClick={() => handleFilterIncludeVoided(!filters.include_voided)}
            >
              {filters.include_voided ? 'Incluidos' : 'Excluidos'}
            </Button>
          </Stack>
        </Stack>
      </CustomPopover>
    </>
  );
}

PaymentReceivedTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  onResetFilters: PropTypes.func
};
