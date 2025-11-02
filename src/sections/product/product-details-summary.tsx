/* eslint-disable no-nested-ternary */
import React, { memo, useMemo, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/material';
// utils
import { fCurrency, fNumber } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
// types
import { getProductResponse } from 'src/interfaces/inventory/productsInterface';

// ----------------------------------------------------------------------

interface ProductDetailsSummaryProps {
  product: getProductResponse;
}

// Componente memoizado para evitar re-renderizados innecesarios
function ProductDetailsSummary({ product, ...other }: ProductDetailsSummaryProps) {
  const { name, taxesOption, sku, quantityStock, barCode, category, brand, priceBase, priceSale } = product;

  // ========================================
  // 🎯 MEMOIZACIÓN DE ELEMENTOS COMPLEJOS
  // ========================================

  const renderLabels = useMemo(
    () => (
      <Stack direction="row" alignItems="center" spacing={1}>
        {category?.name && <Label color="info">Categoria: {category.name}</Label>}
        {brand?.name && <Label color="error">Marca: {brand.name}</Label>}
      </Stack>
    ),
    [category?.name, brand?.name]
  );

  const { typeInventory, colorType } = useMemo(() => {
    if (quantityStock > 10) {
      return { typeInventory: 'Con unidades', colorType: 'success.main' };
    }
    if (quantityStock > 0) {
      return { typeInventory: 'Pocas existencias', colorType: 'warning.main' };
    }
    return { typeInventory: 'Sin existencias', colorType: 'error.main' };
  }, [quantityStock]);

  const renderInventoryType = useMemo(
    () => (
      <Box
        component="span"
        sx={{
          typography: 'overline',
          color: colorType
        }}
      >
        {typeInventory}
      </Box>
    ),
    [typeInventory, colorType]
  );

  // ========================================
  // 🏗️ FUNCIÓN PARA RENDERIZAR ITEMS
  // ========================================

  const renderItemDetail = useCallback(
    (ItemName: string, value: string) => (
      <Grid item xs={12} md={4} key={ItemName}>
        <Typography marginBottom={0} variant="subtitle2">
          {ItemName}:
        </Typography>
        <Typography borderBottom={1} maxWidth="calc(100% - 20px)" variant="body2">
          {value}
        </Typography>
      </Grid>
    ),
    []
  );

  // ========================================
  // 🎨 RENDERIZADO PRINCIPAL
  // ========================================

  return (
    <Stack spacing={3} {...other}>
      <Stack spacing={2} alignItems="flex-start">
        {renderLabels}

        <Typography margin={0} variant="h5">
          {name}
        </Typography>

        {renderInventoryType}

        <Grid container spacing={3}>
          {sku && renderItemDetail('SKU', sku)}
          {barCode && renderItemDetail('Codigo de barras', barCode)}
          {renderItemDetail('Unidades totales', fNumber(quantityStock))}
          {renderItemDetail('Precio de venta', fCurrency(priceSale))}
          {renderItemDetail('Precio base', fCurrency(priceBase))}
          {renderItemDetail('Impuestos', `${taxesOption}%`)}
        </Grid>
      </Stack>
    </Stack>
  );
}

// Exportación memoizada para prevenir re-renderizados innecesarios
export default memo(ProductDetailsSummary);
