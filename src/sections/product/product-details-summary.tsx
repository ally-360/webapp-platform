/* eslint-disable no-nested-ternary */
import React from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
// utils
import { fCurrency, fNumber } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
//
import { Grid } from '@mui/material';
import { getProductResponse } from 'src/interfaces/inventory/productsInterface';

// ----------------------------------------------------------------------

export default function ProductDetailsSummary({ product, ...other }: { product: getProductResponse }) {
  const { name, taxesOption, sku, quantityStock, barCode, category, brand, priceBase, priceSale } = product;

  const renderLabels = (
    <Stack direction="row" alignItems="center" spacing={1}>
      {category.name && <Label color="info">Categoria: {category.name}</Label>}
      {category.name && <Label color="error">Marca: {brand.name}</Label>}
    </Stack>
  );

  const typeInventory =
    quantityStock > 10 ? 'Con unidades' : quantityStock > 0 ? 'Pocas existencias' : 'Sin existencias';

  const renderInventoryType = (
    <Box
      component="span"
      sx={{
        typography: 'overline',
        color: quantityStock > 10 ? 'success.main' : quantityStock > 0 ? 'warning.main' : 'error.main'
      }}
    >
      {typeInventory}
    </Box>
  );

  const itemDetail = (ItemName: string, value: string) => (
    <Grid item xs={12} md={4}>
      <Typography marginBottom={0} variant="subtitle2">
        {ItemName}:
      </Typography>
      <Typography borderBottom={1} maxWidth="calc(100% - 20px)" variant="body2">
        {value}
      </Typography>
    </Grid>
  );

  return (
    <Stack spacing={3} {...other}>
      <Stack spacing={2} alignItems="flex-start">
        {renderLabels}

        <Typography margin={0} variant="h5">
          {name}
        </Typography>
        {renderInventoryType}
        <Grid container spacing={3}>
          {sku && itemDetail('SKU', sku)}
          {barCode && itemDetail('Codigo de barras', barCode)}
          {itemDetail('Unidades totales', fNumber(quantityStock))}
          {itemDetail('Precio de venta', fCurrency(priceSale))}
          {itemDetail('Precio base', fCurrency(priceBase))}
          {itemDetail('Impuestos', `${taxesOption}%`)}
        </Grid>
      </Stack>
    </Stack>
  );
}
