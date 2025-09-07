/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
// @mui
import { Grid, Box, Stack } from '@mui/material';

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
}

export default function PosProductGrid({ products, onAddProduct, loading = false }: Props) {
  const [openFiltersDrawer, setOpenFiltersDrawer] = useState(false);

  const { searchTerm, setSearchTerm, filters, filteredAndSortedProducts, handleFilters, handleResetFilters, canReset } =
    useProductFilters(products);

  const handleAddProduct = (product: Product) => {
    onAddProduct({ ...product, quantity: 1 });
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
          <ProductSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
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
            <ProductCard product={product} onAddProduct={handleAddProduct} />
          </Grid>
        ))}
      </Grid>

      {/* No results message */}
      {filteredAndSortedProducts.length === 0 && <NoProductsMessage searchTerm={searchTerm} />}
    </Box>
  );
}
