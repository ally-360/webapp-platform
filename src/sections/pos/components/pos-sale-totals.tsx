import React, { memo } from 'react';
// @mui
import { Box, Typography, Stack, Divider } from '@mui/material';
// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
// types
import type { SaleWindow } from 'src/redux/pos/posSlice';

interface Props {
  sale: SaleWindow;
}

const PosSaleTotals = memo(({ sale }: Props) => (
  <Box sx={{ p: 2 }}>
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">Subtotal:</Typography>
        <Typography variant="body2">{formatCurrency(sale.subtotal)}</Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">IVA:</Typography>
        <Typography variant="body2">{formatCurrency(sale.tax_amount)}</Typography>
      </Stack>

      {sale.discount_amount && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="success.main">
            Descuento:
          </Typography>
          <Typography variant="body2" color="success.main">
            -{formatCurrency(sale.discount_amount)}
          </Typography>
        </Stack>
      )}

      <Divider />

      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6" color="primary">
          {formatCurrency(sale.total)}
        </Typography>
      </Stack>
    </Stack>
  </Box>
));

PosSaleTotals.displayName = 'PosSaleTotals';

export default PosSaleTotals;
