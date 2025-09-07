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
  <Box
    sx={{
      p: 2,
      bgcolor: 'grey.50',
      borderRadius: 0
    }}
  >
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          Subtotal:
        </Typography>
        <Typography variant="body2" fontWeight="500">
          {formatCurrency(sale.subtotal)}
        </Typography>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          IVA:
        </Typography>
        <Typography variant="body2" fontWeight="500">
          {formatCurrency(sale.tax_amount)}
        </Typography>
      </Stack>

      {sale.discount_amount && sale.discount_amount > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Descuento:
          </Typography>
          <Typography variant="body2" color="success.main" fontWeight="500">
            -{formatCurrency(sale.discount_amount)}
          </Typography>
        </Stack>
      )}

      <Divider sx={{ my: 0.5 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="600">
          Total:
        </Typography>
        <Typography variant="h6" color="primary" fontWeight="700">
          {formatCurrency(sale.total)}
        </Typography>
      </Stack>
    </Stack>
  </Box>
));

PosSaleTotals.displayName = 'PosSaleTotals';

export default PosSaleTotals;
