import React, { memo, useCallback } from 'react';
// @mui
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Stack
} from '@mui/material';
import { Icon } from '@iconify/react';
// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
// types
import type { Product } from 'src/redux/pos/posSlice';

interface Props {
  products: Product[];
  onRemoveProduct: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
}

const PosProductList = memo(({ products, onRemoveProduct, onUpdateQuantity }: Props) => {
  const handleQuantityChange = useCallback(
    (productId: number, value: string) => {
      const quantity = parseInt(value, 10);
      if (quantity > 0) {
        onUpdateQuantity(productId, quantity);
      }
    },
    [onUpdateQuantity]
  );

  if (products.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Icon icon="mdi:cart-outline" style={{ fontSize: '48px', opacity: 0.3 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No hay productos agregados
        </Typography>
      </Box>
    );
  }

  return (
    <List dense>
      {products.map((product) => (
        <ListItem key={product.id} divider>
          <ListItemText
            primary={product.name}
            secondary={
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {formatCurrency(product.price)} x
                </Typography>
                <TextField
                  size="small"
                  type="number"
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                  inputProps={{ min: 1, style: { width: '60px', textAlign: 'center' } }}
                  sx={{ '& .MuiOutlinedInput-root': { height: '28px' } }}
                />
                <Typography variant="body2" fontWeight="bold">
                  = {formatCurrency(product.price * product.quantity)}
                </Typography>
              </Stack>
            }
          />
          <ListItemSecondaryAction>
            <IconButton size="small" onClick={() => onRemoveProduct(product.id)}>
              <Icon icon="mdi:delete-outline" />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
});

PosProductList.displayName = 'PosProductList';

export default PosProductList;
