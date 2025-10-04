import React, { useCallback } from 'react';
// @mui
import {
  Box,
  Drawer,
  Typography,
  Stack,
  Divider,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  Badge,
  IconButton,
  Switch,
  Radio,
  Tooltip,
  InputBase,
  inputBaseClasses
} from '@mui/material';
import { alpha } from '@mui/material/styles';

// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { Product } from 'src/redux/pos/posSlice';

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  minStock?: number;
  inStockOnly: boolean;
  sortBy: 'name' | 'price' | 'stock' | 'category';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: ProductFilters;
  onFilters: (field: keyof ProductFilters, value: any) => void;
  canReset: boolean;
  onResetFilters: () => void;
  products: Product[];
}

export default function PosProductFiltersDrawer({
  open,
  onOpen,
  onClose,
  filters,
  onFilters,
  canReset,
  onResetFilters,
  products
}: Props) {
  // Extract unique categories from products
  const availableCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort();

  const priceRange = products.reduce(
    (acc, product) => [Math.min(acc[0], product.price), Math.max(acc[1], product.price)],
    [Infinity, -Infinity]
  );

  const handleFilterCategory = useCallback(
    (newValue: string) => {
      const checked = filters.categories.includes(newValue)
        ? filters.categories.filter((value) => value !== newValue)
        : [...filters.categories, newValue];
      onFilters('categories', checked);
    },
    [filters.categories, onFilters]
  );

  const handleFilterPriceRange = useCallback(
    (event: Event, newValue: number | number[]) => {
      onFilters('priceRange', newValue);
    },
    [onFilters]
  );

  const handleFilterSortBy = useCallback(
    (newValue: string) => {
      onFilters('sortBy', newValue);
    },
    [onFilters]
  );

  const marksLabel = [...Array(11)].map((_, index) => {
    const value = Math.round((index * (priceRange[1] - priceRange[0])) / 10) + priceRange[0];
    return {
      value,
      label: index % 2 ? '' : formatCurrency(value)
    };
  });

  const renderHead = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 2, pr: 1, pl: 2.5 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Filtros
      </Typography>

      <Tooltip title="Limpiar filtros">
        <IconButton onClick={onResetFilters}>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  const renderCategories = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Categorías
      </Typography>
      {availableCategories.map((category) => (
        <FormControlLabel
          key={category}
          control={
            <Checkbox checked={filters.categories.includes(category)} onChange={() => handleFilterCategory(category)} />
          }
          label={category}
        />
      ))}
    </Stack>
  );

  const renderPrice = (
    <Stack>
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Rango de Precio
      </Typography>

      <Stack direction="row" spacing={5} sx={{ my: 2 }}>
        <InputRange type="min" value={filters.priceRange} onFilters={onFilters} />
        <InputRange type="max" value={filters.priceRange} onFilters={onFilters} />
      </Stack>

      <Slider
        value={filters.priceRange}
        onChange={handleFilterPriceRange}
        step={1000}
        min={priceRange[0]}
        max={priceRange[1]}
        marks={marksLabel}
        getAriaValueText={(value) => formatCurrency(value)}
        valueLabelFormat={(value) => formatCurrency(value)}
        sx={{
          alignSelf: 'center',
          width: 'calc(100% - 24px)'
        }}
      />
    </Stack>
  );

  const renderStock = (
    <Stack>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Stock
      </Typography>
      <FormControlLabel
        control={<Switch checked={filters.inStockOnly} onChange={(e) => onFilters('inStockOnly', e.target.checked)} />}
        label="Solo productos en stock"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
          Stock mínimo: {filters.minStock || 0}
        </Typography>
        <Slider
          value={filters.minStock || 0}
          onChange={(_, newValue) => onFilters('minStock', newValue)}
          step={1}
          min={0}
          max={100}
          marks={[
            { value: 0, label: '0' },
            { value: 10, label: '10' },
            { value: 50, label: '50' },
            { value: 100, label: '100+' }
          ]}
          sx={{ width: 'calc(100% - 24px)' }}
        />
      </Box>
    </Stack>
  );

  const renderSort = (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Ordenamiento</Typography>

      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
          Ordenar por:
        </Typography>
        {[
          { value: 'name', label: 'Nombre' },
          { value: 'price', label: 'Precio' },
          { value: 'stock', label: 'Stock' },
          { value: 'category', label: 'Categoría' }
        ].map((option) => (
          <FormControlLabel
            key={option.value}
            control={
              <Radio checked={filters.sortBy === option.value} onChange={() => handleFilterSortBy(option.value)} />
            }
            label={option.label}
          />
        ))}
      </Box>

      <Box>
        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
          Orden:
        </Typography>
        <FormControlLabel
          control={<Radio checked={filters.sortOrder === 'asc'} onChange={() => onFilters('sortOrder', 'asc')} />}
          label="Ascendente"
        />
        <FormControlLabel
          control={<Radio checked={filters.sortOrder === 'desc'} onChange={() => onFilters('sortOrder', 'desc')} />}
          label="Descendente"
        />
      </Box>
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
      >
        Filtros
      </Button>

      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        slotProps={{
          backdrop: { invisible: true }
        }}
        PaperProps={{
          sx: { width: 320 }
        }}
      >
        {renderHead}

        <Divider />

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>
            {renderCategories}
            {renderPrice}
            {renderStock}
            {renderSort}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

interface InputRangeProps {
  type: 'min' | 'max';
  value: [number, number];
  onFilters: (field: string, value: any) => void;
}

function InputRange({ type, value, onFilters }: InputRangeProps) {
  const min = value[0];
  const max = value[1];

  const handleBlurInputRange = useCallback(() => {
    if (min < 0) {
      onFilters('priceRange', [0, max]);
    }
    if (max < 0) {
      onFilters('priceRange', [min, 0]);
    }
    if (min > max) {
      onFilters('priceRange', type === 'min' ? [max, max] : [min, min]);
    }
  }, [max, min, onFilters, type]);

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 1 }}>
      <Typography
        variant="caption"
        sx={{
          flexShrink: 0,
          color: 'text.disabled',
          textTransform: 'capitalize',
          fontWeight: 'fontWeightSemiBold'
        }}
      >
        {type === 'min' ? 'Desde' : 'Hasta'}
      </Typography>

      <InputBase
        fullWidth
        value={type === 'min' ? min : max}
        onChange={(event) =>
          type === 'min'
            ? onFilters('priceRange', [Number(event.target.value), max])
            : onFilters('priceRange', [min, Number(event.target.value)])
        }
        onBlur={handleBlurInputRange}
        inputProps={{
          step: 1000,
          min: 0,
          type: 'number',
          'aria-labelledby': 'input-slider'
        }}
        sx={{
          maxWidth: 80,
          borderRadius: 0.75,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          [`& .${inputBaseClasses.input}`]: {
            pr: 1,
            py: 0.75,
            textAlign: 'right',
            typography: 'body2'
          }
        }}
      />
    </Stack>
  );
}
