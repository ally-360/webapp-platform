/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
// @mui
import { Grid, Box, Stack, Button, Typography, CircularProgress } from '@mui/material';
// components
import Iconify from 'src/components/iconify';
// utils
import type { Product } from 'src/redux/pos/posSlice';
// hooks
import { useProductFilters } from './hooks';
// components
import PosProductGridSkeleton from './pos-product-grid-skeleton';
import PosProductFiltersDrawer from './pos-product-filters-new';
import PosProductSort from './pos-product-sort';
import { ProductSearchBar, ProductCard, NoProductsMessage } from './components';

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
  loading?: boolean;
  onSearch?: (searchTerm: string) => void;
  onCategoryFilter?: (categoryId: string) => void;
  onBrandFilter?: (brandId: string) => void;
  onBarcodeDetected?: (barcode: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalProducts?: number;
  currentPage?: number;
  totalPages?: number;
  // New props for search validation
  searchTerm?: string;
  isSearchValid?: boolean;
  minSearchLength?: number;
}

export default function PosProductGrid({
  products,
  onAddProduct,
  loading = false,
  onSearch,
  onCategoryFilter: _onCategoryFilter,
  onBrandFilter: _onBrandFilter,
  onBarcodeDetected,
  onLoadMore,
  hasMore = false,
  totalProducts = 0,
  currentPage = 1,
  totalPages = 1,
  searchTerm: externalSearchTerm,
  isSearchValid: _isSearchValid = true,
  minSearchLength = 2
}: Props) {
  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);

  const { searchTerm, setSearchTerm, filters, filteredAndSortedProducts, handleFilters, handleResetFilters, canReset } =
    useProductFilters(products);

  const handleAddProduct = (product: Product) => {
    onAddProduct({ ...product, quantity: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleBarcodeDetectedLocal = (barcode: string) => {
    if (onBarcodeDetected) {
      onBarcodeDetected(barcode);
    } else {
      // Fallback to local search
      const foundProduct = products.find(
        (product) => product.sku === barcode || product.barCode === barcode || product.id?.toString() === barcode
      );

      if (foundProduct) {
        handleAddProduct(foundProduct);
        console.log('Producto encontrado y agregado:', foundProduct.name);
      } else {
        console.log('Producto no encontrado para código:', barcode);
      }
    }
  };

  const sortOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'price', label: 'Precio' },
    { value: 'stock', label: 'Stock' },
    { value: 'category', label: 'Categoría' }
  ];

  if (loading) {
    return <PosProductGridSkeleton count={12} />;
  }

  const displayProducts = onSearch ? products : filteredAndSortedProducts;

  const currentSearchTerm = externalSearchTerm !== undefined ? externalSearchTerm : searchTerm;

  return (
    <Box sx={{ p: 2, pb: 10 }}>
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
          <ProductSearchBar
            searchTerm={currentSearchTerm}
            onSearchChange={handleSearchChange}
            onBarcodeDetected={handleBarcodeDetectedLocal}
            minSearchLength={minSearchLength}
            isLoading={loading}
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

      <Grid container spacing={2}>
        {displayProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard product={product} onAddProduct={handleAddProduct} />
          </Grid>
        ))}
      </Grid>

      {onLoadMore && hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="mdi:refresh" />}
          >
            {loading ? 'Cargando...' : `Cargar más productos (${displayProducts.length} de ${totalProducts})`}
          </Button>
        </Box>
      )}

      {displayProducts.length === 0 && <NoProductsMessage searchTerm={currentSearchTerm} />}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Página {currentPage} de {totalPages} ({totalProducts} productos en total)
          </Typography>
        </Box>
      )}
    </Box>
  );
}
