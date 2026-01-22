import { Controller } from 'react-hook-form';
import { Card, Stack, Button, MenuItem, TextField, InputAdornment } from '@mui/material';

import Iconify from 'src/components/iconify';
import { RHFSelect, RHFAutocomplete } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  products: any[];
  pdvs: any[];
  productsLoading: boolean;
  pdvsLoading: boolean;
  onClearFilters: VoidFunction;
  localSearch: string;
  onLocalSearchChange: (value: string) => void;
};

export default function MovementsFilters({
  products,
  pdvs,
  productsLoading,
  pdvsLoading,
  onClearFilters,
  localSearch,
  onLocalSearchChange
}: Props) {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack spacing={2.5}>
        {/* Row 1: Product + PDV + Type */}
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ width: 1 }}>
          <Controller
            name="product_id"
            render={({ field }) => (
              <RHFAutocomplete
                {...field}
                label="Producto"
                options={products}
                loading={productsLoading}
                getOptionLabel={(option: any) =>
                  typeof option === 'string' ? products.find((p) => p.id === option)?.name || '' : option.name || ''
                }
                renderOption={(props, option: any) => (
                  <li {...props} key={option.id}>
                    <Stack>
                      <span>{option.name}</span>
                      {option.sku && <span style={{ fontSize: 12, color: 'text.secondary' }}>SKU: {option.sku}</span>}
                    </Stack>
                  </li>
                )}
                onChange={(_, value) => field.onChange(value?.id || '')}
                value={products.find((p) => p.id === field.value) || null}
                sx={{ width: 1 }}
              />
            )}
          />

          <RHFSelect name="pdv_id" label="PDV" disabled={pdvsLoading} sx={{ minWidth: 200 }}>
            <MenuItem value="">Todos</MenuItem>
            {pdvs.map((pdv) => (
              <MenuItem key={pdv.id} value={pdv.id}>
                {pdv.name}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFSelect name="movement_type" label="Tipo" sx={{ minWidth: 200 }}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="IN">Entrada</MenuItem>
            <MenuItem value="OUT">Salida</MenuItem>
          </RHFSelect>
        </Stack>

        {/* Row 2: Search + Clear */}
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center">
          <TextField
            fullWidth
            value={localSearch}
            onChange={(e) => onLocalSearchChange(e.target.value)}
            placeholder="Buscar por referencia, notas, producto..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              )
            }}
          />

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:trash-bin-minimalistic-bold" />}
            onClick={onClearFilters}
            sx={{ flexShrink: 0 }}
          >
            Limpiar Filtros
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
