import React, { useState, useEffect } from 'react';
// @mui
import {
  Box,
  Drawer,
  Typography,
  Stack,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  IconButton,
  Switch,
  Radio
} from '@mui/material';

// components

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
  onClose: () => void;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  products: Product[];
}

export default function PosProductFiltersDrawer({ open, onClose, filters, onFiltersChange, products }: Props) {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);

  // Extract unique categories from products
  const availableCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort();

  const priceRange = products.reduce(
    (acc, product) => [Math.min(acc[0], product.price), Math.max(acc[1], product.price)],
    [Infinity, -Infinity]
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCategoryChange = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c) => c !== category)
      : [...localFilters.categories, category];

    setLocalFilters((prev) => ({
      ...prev,
      categories: newCategories
    }));
  };

  const handlePriceRangeChange = (_event: Event, newValue: number | number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: newValue as [number, number]
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: ProductFilters = {
      categories: [],
      priceRange: [priceRange[0], priceRange[1]],
      minStock: undefined,
      inStockOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
      searchTerm: ''
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0) count += 1;
    if (localFilters.inStockOnly) count += 1;
    if (localFilters.minStock && localFilters.minStock > 0) count += 1;
    if (localFilters.priceRange[0] !== priceRange[0] || localFilters.priceRange[1] !== priceRange[1]) count += 1;
    return count;
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          maxWidth: '90vw'
        }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtros de Productos
          </Typography>
          <Stack direction="row" spacing={1}>
            {getActiveFiltersCount() > 0 && (
              <Chip label={`${getActiveFiltersCount()} activos`} size="small" color="primary" variant="filled" />
            )}
            <IconButton onClick={onClose} size="small">
              <Icon icon="mdi:close" />
            </IconButton>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Filters Content */}
        <Stack spacing={3} sx={{ flex: 1, overflow: 'auto' }}>
          {/* Search */}
          <Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar productos..."
              value={localFilters.searchTerm}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              InputProps={{
                startAdornment: <Icon icon="mdi:magnify" style={{ marginRight: 8 }} />
              }}
            />
          </Box>

          {/* Categories Filter */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography variant="subtitle2">
                Categorías {localFilters.categories.length > 0 && `(${localFilters.categories.length})`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                {availableCategories.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={localFilters.categories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                        size="small"
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>
            </AccordionDetails>
          </Accordion>

          {/* Price Range Filter */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography variant="subtitle2">Rango de Precio</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={localFilters.priceRange}
                  onChange={handlePriceRangeChange}
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatCurrency}
                  min={priceRange[0]}
                  max={priceRange[1]}
                  step={100}
                />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption">{formatCurrency(localFilters.priceRange[0])}</Typography>
                  <Typography variant="caption">{formatCurrency(localFilters.priceRange[1])}</Typography>
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Stock Filter */}
          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography variant="subtitle2">Stock</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={localFilters.inStockOnly}
                      onChange={(e) =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          inStockOnly: e.target.checked
                        }))
                      }
                    />
                  }
                  label="Solo productos en stock"
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stock mínimo"
                  value={localFilters.minStock || ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      minStock: e.target.value ? parseInt(e.target.value, 10) : undefined
                    }))
                  }
                />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Sort Options */}
          <Accordion>
            <AccordionSummary expandIcon={<Icon icon="mdi:chevron-down" />}>
              <Typography variant="subtitle2">Ordenamiento</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <FormControl>
                  <FormLabel component="legend">Ordenar por:</FormLabel>
                  <RadioGroup
                    value={localFilters.sortBy}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as any
                      }))
                    }
                  >
                    <FormControlLabel value="name" control={<Radio size="small" />} label="Nombre" />
                    <FormControlLabel value="price" control={<Radio size="small" />} label="Precio" />
                    <FormControlLabel value="stock" control={<Radio size="small" />} label="Stock" />
                    <FormControlLabel value="category" control={<Radio size="small" />} label="Categoría" />
                  </RadioGroup>
                </FormControl>

                <FormControl>
                  <FormLabel component="legend">Orden:</FormLabel>
                  <RadioGroup
                    value={localFilters.sortOrder}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortOrder: e.target.value as 'asc' | 'desc'
                      }))
                    }
                  >
                    <FormControlLabel value="asc" control={<Radio size="small" />} label="Ascendente" />
                    <FormControlLabel value="desc" control={<Radio size="small" />} label="Descendente" />
                  </RadioGroup>
                </FormControl>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            <Button variant="contained" onClick={handleApplyFilters} startIcon={<Icon icon="mdi:filter" />} fullWidth>
              Aplicar Filtros
            </Button>
            <Button variant="outlined" onClick={handleResetFilters} startIcon={<Icon icon="mdi:refresh" />} fullWidth>
              Limpiar Filtros
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
