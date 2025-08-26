/* eslint-disable no-nested-ternary */
import React, { useState, useMemo, useEffect } from 'react';
// @mui
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Avatar,
  Chip,
  InputAdornment,
  Stack
} from '@mui/material';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { Product } from 'src/redux/pos/posSlice';

// components
import PosProductGridSkeleton from './pos-product-grid-skeleton';
import PosProductFiltersDrawer, { type ProductFilters } from './pos-product-filters-new';
import PosProductSort from './pos-product-sort';

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  loading?: boolean;
}

export default function PosProductGrid({ products, onAddProduct, loading = false }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 100000],
    minStock: undefined,
    inStockOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    searchTerm: ''
  });

  // Update search term from filters
  useEffect(() => {
    setSearchTerm(filters.searchTerm);
  }, [filters.searchTerm]);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Text search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        (product.category && product.category.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Category filter
      if (filters.categories.length > 0 && product.category) {
        if (!filters.categories.includes(product.category)) return false;
      }

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && product.stock !== undefined && product.stock <= 0) {
        return false;
      }

      if (filters.minStock !== undefined && product.stock !== undefined && product.stock < filters.minStock) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, searchTerm, filters]);

  const handleAddProduct = (product: Product) => {
    onAddProduct({ ...product, quantity: 1 });
  };

  const handleFilters = (field: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    const priceRange = products.reduce(
      (acc, product) => [Math.min(acc[0], product.price), Math.max(acc[1], product.price)],
      [Infinity, -Infinity]
    );

    setFilters({
      categories: [],
      priceRange: [priceRange[0], priceRange[1]],
      minStock: undefined,
      inStockOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
      searchTerm: ''
    });
    setSearchTerm('');
  };

  const canReset =
    filters.categories.length > 0 ||
    filters.inStockOnly ||
    (filters.minStock && filters.minStock > 0) ||
    filters.searchTerm !== '' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'stock', label: 'Stock' },
    { value: 'category', label: 'Categoría' }
  ];

  if (loading) {
    return <PosProductGridSkeleton count={12} />;
  }

  if (loading) {
    return <PosProductGridSkeleton count={12} />;
  }

  const getCategoryColor = (category?: string) => {
    const colors = {
      Bebidas: 'primary',
      Panadería: 'secondary',
      Lácteos: 'info',
      Granos: 'warning',
      Aceites: 'success',
      Café: 'error',
      Proteínas: 'primary',
      Higiene: 'info',
      Enlatados: 'warning'
    };
    return colors[category || ''] || 'default';
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Search Bar with Filter Button and Sort */}
      <Box
        sx={{
          mb: 3,
          mr: 1,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <Stack direction="row" width="100%" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            fullWidth
            sx={{ minWidth: 240, maxWidth: 480 }}
            placeholder="Buscar productos por nombre, código o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:magnify" />
                </InputAdornment>
              )
            }}
            size="small"
          />
          <PosProductFiltersDrawer
            open={openFiltersDrawer}
            onOpen={() => setOpenFiltersDrawer(true)}
            onClose={() => setOpenFiltersDrawer(false)}
            filters={filters}
            onFilters={handleFilters}
            canReset={canReset}
            onResetFilters={handleResetFilters}
            products={products}
          />
          <PosProductSort
            sort={filters.sortBy}
            onSort={(sortBy) => handleFilters('sortBy', sortBy)}
            sortOptions={sortOptions}
          />
        </Stack>
      </Box>

      {/* Products Grid */}
      <Grid container spacing={2}>
        {filteredAndSortedProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ flex: 1, pb: 1 }}>
                <Stack spacing={1}>
                  {/* Product Avatar & Category */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main'
                      }}
                    >
                      <Icon icon="mdi:package-variant" />
                    </Avatar>
                    {product.category && (
                      <Chip
                        label={product.category}
                        size="small"
                        color={getCategoryColor(product.category) as any}
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Product Name */}
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {product.name}
                  </Typography>

                  {/* SKU */}
                  <Typography variant="caption" color="text.secondary">
                    SKU: {product.sku}
                  </Typography>

                  {/* Price */}
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 700, mt: 'auto' }}>
                    {formatCurrency(product.price)}
                  </Typography>

                  {/* Stock Info */}
                  {product.stock !== undefined && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Icon
                        icon={
                          product.stock > 10
                            ? 'mdi:check-circle'
                            : product.stock > 0
                            ? 'mdi:alert-circle'
                            : 'mdi:close-circle'
                        }
                        style={{
                          color: product.stock > 10 ? '#22c55e' : product.stock > 0 ? '#f59e0b' : '#ef4444',
                          fontSize: '16px'
                        }}
                      />
                      <Typography
                        variant="caption"
                        color={product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'}
                      >
                        Stock: {product.stock}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  onClick={() => handleAddProduct(product)}
                  disabled={product.stock === 0}
                  startIcon={<Icon icon="mdi:cart-plus" />}
                >
                  Agregar
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* No results message */}
      {filteredAndSortedProducts.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            textAlign: 'center'
          }}
        >
          <Icon icon="mdi:package-variant-off" style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? `No hay resultados para "${searchTerm}"` : 'No hay productos disponibles'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
