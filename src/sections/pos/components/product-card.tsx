import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Avatar, Chip, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { Product } from 'src/redux/pos/posSlice';

interface ProductCardProps {
  product: Product;
  onAddProduct: (product: Product) => void;
}

/**
 * Tarjeta individual de producto
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddProduct }) => {
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

  const getStockInfo = (stock: number) => {
    if (stock > 10) {
      return {
        icon: 'mdi:check-circle',
        color: '#22c55e',
        textColor: 'success.main' as const
      };
    }
    if (stock > 0) {
      return {
        icon: 'mdi:alert-circle',
        color: '#f59e0b',
        textColor: 'warning.main' as const
      };
    }
    return {
      icon: 'mdi:close-circle',
      color: '#ef4444',
      textColor: 'error.main' as const
    };
  };

  const handleAddProduct = () => {
    onAddProduct({ ...product, quantity: 1 });
  };

  const stockInfo = product.stock !== undefined ? getStockInfo(product.stock) : null;

  return (
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
          {product.stock !== undefined && stockInfo && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Icon
                icon={stockInfo.icon}
                style={{
                  color: stockInfo.color,
                  fontSize: '16px'
                }}
              />
              <Typography variant="caption" color={stockInfo.textColor}>
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
          onClick={handleAddProduct}
          disabled={product.stock === 0}
          startIcon={<Icon icon="mdi:cart-plus" />}
        >
          Agregar
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
