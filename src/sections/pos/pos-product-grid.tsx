import React, { useState } from 'react';
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
  InputAdornment
} from '@mui/material';
import { Stack } from '@mui/system';
import { Icon } from '@iconify/react';

// utils
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { Product } from 'src/redux/pos/posSlice';

interface Props {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export default function PosProductGrid({ products, onAddProduct }: Props) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = (product: Product) => {
    onAddProduct({ ...product, quantity: 1 });
  };

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
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
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
      </Box>

      {/* Products Grid */}
      <Grid container spacing={2}>
        {filteredProducts.map((product) => (
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
      {filteredProducts.length === 0 && (
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
