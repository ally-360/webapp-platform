import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
// @mui
import {
  Stack,
  Button,
  Drawer,
  Divider,
  IconButton,
  Typography,
  TextField,
  Box,
  Chip,
  Slider,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  InputAdornment
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useGetCategoriesQuery, useGetBrandsQuery, useGetPDVsQuery } from 'src/redux/services/catalogApi';

// ----------------------------------------------------------------------

interface ProductTableFiltersAdvancedProps {
  open: boolean;
  onClose: VoidFunction;
  filters: any;
  onFilters: (name: string, value: any) => void;
  onResetFilters: VoidFunction;
  countsData?: {
    counts_by_status: Array<{ status: string; count: number }>;
  };
}

export default function ProductTableFiltersAdvanced({
  open,
  onClose,
  filters,
  onFilters,
  onResetFilters,
  countsData
}: ProductTableFiltersAdvancedProps) {
  const { t } = useTranslation();

  // Fetch data for filters
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data: pdvs = [] } = useGetPDVsQuery();

  // Local state for price range
  const [priceRange, setPriceRange] = useState<number[]>(filters.priceRange || [0, 10000000]);
  const [stockRange, setStockRange] = useState<number[]>(filters.stockRange || [0, 1000]);

  // Estados de conteo
  const activeCount = countsData?.counts_by_status?.find((c) => c.status === 'ACTIVE')?.count || 0;
  const inactiveCount = countsData?.counts_by_status?.find((c) => c.status === 'INACTIVE')?.count || 0;

  const handleApplyPriceRange = useCallback(() => {
    onFilters('priceRange', priceRange);
  }, [onFilters, priceRange]);

  const handleApplyStockRange = useCallback(() => {
    onFilters('stockRange', stockRange);
  }, [onFilters, stockRange]);

  const hasFilters =
    filters.categories?.length > 0 ||
    filters.brands?.length > 0 ||
    filters.pdvs?.length > 0 ||
    filters.status !== 'all' ||
    filters.priceRange?.[0] !== 0 ||
    filters.priceRange?.[1] !== 10000000 ||
    filters.stockRange?.[0] !== 0 ||
    filters.stockRange?.[1] !== 1000 ||
    filters.lowStock === true;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320 }
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 2.5, pb: 2, bgcolor: 'background.paper' }}
      >
        <Typography variant="h6">{t('Filtros Avanzados')}</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Scrollbar sx={{ px: 2.5, py: 3, bgcolor: 'background.paper' }}>
        <Stack spacing={3}>
          {/* ESTADO */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t('Estado del Producto')}</Typography>

            <Stack spacing={1}>
              <Button
                fullWidth
                variant={filters.status === 'all' ? 'contained' : 'outlined'}
                color="inherit"
                onClick={() => onFilters('status', 'all')}
                startIcon={<Iconify icon="solar:list-bold" />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>{t('Todos')}</Box>
                <Chip
                  size="small"
                  label={activeCount + inactiveCount}
                  sx={{
                    bgcolor: filters.status === 'all' ? 'common.white' : 'background.neutral',
                    color: filters.status === 'all' ? 'text.primary' : 'text.secondary'
                  }}
                />
              </Button>

              <Button
                fullWidth
                variant={filters.status === 'active' ? 'contained' : 'outlined'}
                color={filters.status === 'active' ? 'success' : 'inherit'}
                onClick={() => onFilters('status', 'active')}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>{t('Activos')}</Box>
                <Chip
                  size="small"
                  label={activeCount}
                  color={filters.status === 'active' ? 'success' : 'default'}
                  sx={{
                    bgcolor: filters.status === 'active' ? 'common.white' : 'background.neutral',
                    color: filters.status === 'active' ? 'success.dark' : 'text.secondary'
                  }}
                />
              </Button>

              <Button
                fullWidth
                variant={filters.status === 'inactive' ? 'contained' : 'outlined'}
                color={filters.status === 'inactive' ? 'error' : 'inherit'}
                onClick={() => onFilters('status', 'inactive')}
                startIcon={<Iconify icon="solar:close-circle-bold" />}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>{t('Inactivos')}</Box>
                <Chip
                  size="small"
                  label={inactiveCount}
                  color={filters.status === 'inactive' ? 'error' : 'default'}
                  sx={{
                    bgcolor: filters.status === 'inactive' ? 'common.white' : 'background.neutral',
                    color: filters.status === 'inactive' ? 'error.dark' : 'text.secondary'
                  }}
                />
              </Button>
            </Stack>
          </Stack>

          {/* STOCK BAJO */}
          <FormControlLabel
            control={
              <Switch checked={filters.lowStock || false} onChange={(e) => onFilters('lowStock', e.target.checked)} />
            }
            label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify icon="solar:danger-triangle-bold" sx={{ color: 'warning.main' }} />
                <Typography variant="body2">{t('Solo productos con stock bajo')}</Typography>
              </Stack>
            }
          />

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* CATEGORÍAS */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                <Iconify icon="solar:tag-bold" />
                <Typography variant="subtitle2">{t('Categorías')}</Typography>
                {filters.categories?.length > 0 && (
                  <Chip size="small" label={filters.categories.length} color="primary" />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={categories}
                getOptionLabel={(option) => option.name}
                value={filters.categories || []}
                onChange={(e, newValue) => onFilters('categories', newValue)}
                renderInput={(params) => (
                  <TextField {...params} placeholder={t('Seleccionar categorías')} size="small" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
                  ))
                }
              />
            </AccordionDetails>
          </Accordion>

          {/* MARCAS */}
          <Accordion>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                <Iconify icon="solar:star-bold" />
                <Typography variant="subtitle2">{t('Marcas')}</Typography>
                {filters.brands?.length > 0 && <Chip size="small" label={filters.brands.length} color="primary" />}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={brands}
                getOptionLabel={(option) => option.name}
                value={filters.brands || []}
                onChange={(e, newValue) => onFilters('brands', newValue)}
                renderInput={(params) => <TextField {...params} placeholder={t('Seleccionar marcas')} size="small" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
                  ))
                }
              />
            </AccordionDetails>
          </Accordion>

          {/* PUNTOS DE VENTA */}
          <Accordion>
            <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                <Iconify icon="solar:shop-2-bold" />
                <Typography variant="subtitle2">{t('Puntos de Venta')}</Typography>
                {filters.pdvs?.length > 0 && <Chip size="small" label={filters.pdvs.length} color="primary" />}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Autocomplete
                multiple
                options={pdvs}
                getOptionLabel={(option) => option.name}
                value={filters.pdvs || []}
                onChange={(e, newValue) => onFilters('pdvs', newValue)}
                renderInput={(params) => <TextField {...params} placeholder={t('Seleccionar PDVs')} size="small" />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
                  ))
                }
              />
            </AccordionDetails>
          </Accordion>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* RANGO DE PRECIOS */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t('Rango de Precios')}</Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                type="number"
                label={t('Mínimo')}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
              <Box sx={{ width: 20, textAlign: 'center' }}>-</Box>
              <TextField
                size="small"
                type="number"
                label={t('Máximo')}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Stack>

            <Slider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue as number[])}
              min={0}
              max={10000000}
              step={10000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${(value / 1000).toFixed(0)}K`}
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16
                }
              }}
            />

            <Button
              size="small"
              variant="outlined"
              onClick={handleApplyPriceRange}
              disabled={
                priceRange[0] === (filters.priceRange?.[0] || 0) &&
                priceRange[1] === (filters.priceRange?.[1] || 10000000)
              }
            >
              {t('Aplicar')}
            </Button>
          </Stack>

          {/* RANGO DE STOCK */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">{t('Rango de Stock')}</Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                size="small"
                type="number"
                label={t('Mínimo')}
                value={stockRange[0]}
                onChange={(e) => setStockRange([Number(e.target.value), stockRange[1]])}
              />
              <Box sx={{ width: 20, textAlign: 'center' }}>-</Box>
              <TextField
                size="small"
                type="number"
                label={t('Máximo')}
                value={stockRange[1]}
                onChange={(e) => setStockRange([stockRange[0], Number(e.target.value)])}
              />
            </Stack>

            <Slider
              value={stockRange}
              onChange={(e, newValue) => setStockRange(newValue as number[])}
              min={0}
              max={1000}
              valueLabelDisplay="auto"
              sx={{
                '& .MuiSlider-thumb': {
                  width: 16,
                  height: 16
                }
              }}
            />

            <Button
              size="small"
              variant="outlined"
              onClick={handleApplyStockRange}
              disabled={
                stockRange[0] === (filters.stockRange?.[0] || 0) && stockRange[1] === (filters.stockRange?.[1] || 1000)
              }
            >
              {t('Aplicar')}
            </Button>
          </Stack>
        </Stack>
      </Scrollbar>

      <Box sx={{ p: 2.5, pt: 2, borderTop: (theme) => `dashed 1px ${theme.palette.divider}` }}>
        <Stack spacing={1.5}>
          <Button
            fullWidth
            size="large"
            variant="contained"
            startIcon={<Iconify icon="solar:filter-bold" />}
            onClick={onClose}
          >
            {t('Aplicar Filtros')}
          </Button>

          {hasFilters && (
            <Button
              fullWidth
              size="large"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:restart-bold" />}
              onClick={() => {
                onResetFilters();
                setPriceRange([0, 10000000]);
                setStockRange([0, 1000]);
              }}
            >
              {t('Limpiar Todo')}
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
