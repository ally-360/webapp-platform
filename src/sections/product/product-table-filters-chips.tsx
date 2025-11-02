import { useTranslation } from 'react-i18next';
// @mui
import { Stack, Chip, Typography, Box } from '@mui/material';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

interface ProductTableFiltersChipsProps {
  filters: any;
  onRemoveFilter: (filterKey: string, value?: any) => void;
  onResetFilters: VoidFunction;
}

export default function ProductTableFiltersChips({
  filters,
  onRemoveFilter,
  onResetFilters
}: ProductTableFiltersChipsProps) {
  const { t } = useTranslation();

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

  if (!hasFilters) return null;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price}`;
  };

  return (
    <Stack
      spacing={1.5}
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      sx={{ p: 2.5, pt: 0 }}
    >
      <Typography variant="subtitle2" sx={{ flexShrink: 0 }}>
        {t('Filtros activos')}:
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ flex: 1 }}>
        {/* Status */}
        {filters.status !== 'all' && (
          <Chip
            size="small"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconify
                  icon={filters.status === 'active' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                  width={16}
                />
                {filters.status === 'active' ? t('Activos') : t('Inactivos')}
              </Box>
            }
            color={filters.status === 'active' ? 'success' : 'error'}
            onDelete={() => onRemoveFilter('status')}
          />
        )}

        {/* Low Stock */}
        {filters.lowStock && (
          <Chip
            size="small"
            icon={<Iconify icon="solar:danger-triangle-bold" width={16} />}
            label={t('Stock bajo')}
            color="warning"
            onDelete={() => onRemoveFilter('lowStock')}
          />
        )}

        {/* Categories */}
        {filters.categories?.map((category: any) => (
          <Chip
            key={category.id}
            size="small"
            icon={<Iconify icon="solar:tag-bold" width={16} />}
            label={category.name}
            onDelete={() => onRemoveFilter('categories', category)}
          />
        ))}

        {/* Brands */}
        {filters.brands?.map((brand: any) => (
          <Chip
            key={brand.id}
            size="small"
            icon={<Iconify icon="solar:star-bold" width={16} />}
            label={brand.name}
            onDelete={() => onRemoveFilter('brands', brand)}
          />
        ))}

        {/* PDVs */}
        {filters.pdvs?.map((pdv: any) => (
          <Chip
            key={pdv.id}
            size="small"
            icon={<Iconify icon="solar:shop-2-bold" width={16} />}
            label={pdv.name}
            onDelete={() => onRemoveFilter('pdvs', pdv)}
          />
        ))}

        {/* Price Range */}
        {(filters.priceRange?.[0] !== 0 || filters.priceRange?.[1] !== 10000000) && (
          <Chip
            size="small"
            icon={<Iconify icon="solar:dollar-bold" width={16} />}
            label={`${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`}
            onDelete={() => onRemoveFilter('priceRange')}
          />
        )}

        {/* Stock Range */}
        {(filters.stockRange?.[0] !== 0 || filters.stockRange?.[1] !== 1000) && (
          <Chip
            size="small"
            icon={<Iconify icon="solar:box-bold" width={16} />}
            label={`Stock: ${filters.stockRange[0]} - ${filters.stockRange[1]}`}
            onDelete={() => onRemoveFilter('stockRange')}
          />
        )}

        {/* Reset All */}
        <Chip
          size="small"
          label={t('Limpiar todo')}
          color="error"
          variant="outlined"
          onClick={onResetFilters}
          icon={<Iconify icon="solar:restart-bold" width={16} />}
        />
      </Stack>
    </Stack>
  );
}
