/* eslint-disable no-nested-ternary */
import React from 'react';
import { Card, CardContent, Typography, Button, Chip, Stack, Box } from '@mui/material';
import { Icon } from '@iconify/react';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { Product } from 'src/redux/pos/posSlice';

interface ProductCardProps {
  product: Product;
  onAddProduct: (product: Product) => void;
}

/**
 * Tarjeta optimizada de producto con diseño visual mejorado para POS
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddProduct }) => {
  const getStockStatus = (stock?: number) => {
    if (!stock) return { color: 'error', bgColor: '#ffebee', text: 'Sin stock' };
    if (stock <= 5) return { color: 'warning', bgColor: '#fff8e1', text: 'Stock bajo' };
    return { color: 'success', bgColor: '#e8f5e8', text: 'Disponible' };
  };

  const stockStatus = getStockStatus(product.stock);

  const handleAddProduct = () => {
    onAddProduct({ ...product, quantity: 1 });
  };

  // URL de imagen placeholder si no existe
  const imageUrl =
    product.image || `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShgQohP7LbySUaHF37ObdMPlqm-rIsjQ4fOQ&s`;

  return (
    <Card
      sx={{
        height: 280,
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          '& .product-image': {
            transform: 'scale(1.1)'
          },
          '& .add-button': {
            transform: 'translateY(0)',
            opacity: 1
          }
        }
      }}
      onClick={handleAddProduct}
    >
      {/* Image Container */}
      <Box
        sx={{
          height: 140,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          className="product-image"
          src={product?.images?.length > 0 ? product.images[0] : imageUrl}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />

        {/* Category Badge */}
        {product.category && (
          <Chip
            label={product.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'grey.700',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        )}

        {/* Stock Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: alpha(
              stockStatus.color === 'error' ? '#f44336' : stockStatus.color === 'warning' ? '#ff9800' : '#4caf50',
              0.9
            ),
            color: 'white',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            fontSize: '0.7rem',
            fontWeight: 600
          }}
        >
          {`Stock: ${product.stock || 0}`}
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 1.5, height: 140, display: 'flex', flexDirection: 'column' }}>
        {/* Product Name */}
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            lineHeight: 1.2,
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: 'text.primary'
          }}
        >
          {product.name}
        </Typography>

        {/* SKU */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.7rem',
            mb: 1
          }}
        >
          {product.sku}
        </Typography>

        {/* Price and Stock */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.1rem',
              color: 'primary.main',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {formatCurrency(product.price)}
          </Typography>
          {/* 
          <Box
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: stockStatus.bgColor,
              border: `1px solid ${alpha(
                stockStatus.color === 'error' ? '#f44336' : stockStatus.color === 'warning' ? '#ff9800' : '#4caf50',
                0.3
              )}`
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color:
                  stockStatus.color === 'error' ? '#d32f2f' : stockStatus.color === 'warning' ? '#ed6c02' : '#2e7d32'
              }}
            >
              {stockStatus.text}
            </Typography>
          </Box> */}
        </Stack>

        {/* Main Add Button */}
        <Button
          variant="outlined"
          fullWidth
          size="small"
          disabled={!product.stock || product.stock === 0}
          onClick={(e) => {
            e.stopPropagation();
            handleAddProduct();
          }}
          startIcon={<Icon icon="mdi:cart-plus" />}
          sx={{
            mt: 1,
            height: 32,
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
            background: 'primary.lighter',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
            color: 'primary.main'
          }}
        >
          Agregar
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
