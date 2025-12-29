/* eslint-disable no-nested-ternary */
import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Button, Chip, Stack, Box, Tooltip } from '@mui/material';
import { Icon } from '@iconify/react';
import { alpha } from '@mui/material/styles';
import { formatCurrency } from 'src/redux/pos/posUtils';
import type { Product } from 'src/redux/pos/posSlice';

interface ProductCardProps {
  product: Product;
  onAddProduct: (product: Product) => void;
  currentPdvId?: string; // ID del PDV actual para validar stock
}

/**
 * Tarjeta optimizada de producto con diseño visual mejorado para POS
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddProduct, currentPdvId }) => {
  // Calcular stock disponible en el PDV actual usando productPdv del backend
  const stockInfo = useMemo(() => {
    if (!currentPdvId || !product.productPdv || product.productPdv.length === 0) {
      // Sin información de PDV, producto NO tiene stock en este PDV
      return {
        available: 0,
        hasStock: false,
        otherPdvs: []
      };
    }

    // Buscar stock en el PDV actual
    const currentPdvStock = product.productPdv.find((pdv) => pdv.pdv_id === currentPdvId);

    if (!currentPdvStock) {
      // Si no existe el PDV en productPdv, NO tiene stock en este PDV
      const otherPdvs = product.productPdv.map((pdv) => ({
        pdv_name: pdv.pdv_name,
        quantity: pdv.quantity
      }));

      return {
        available: 0,
        hasStock: false,
        otherPdvs
      };
    }

    const availableInCurrentPdv = currentPdvStock.quantity || 0;

    // Buscar otros PDVs con stock (excluyendo el actual)
    const otherPdvs = product.productPdv
      .filter((pdv) => pdv.pdv_id !== currentPdvId && pdv.quantity > 0)
      .map((pdv) => ({
        pdv_name: pdv.pdv_name,
        quantity: pdv.quantity
      }));

    return {
      available: availableInCurrentPdv,
      hasStock: availableInCurrentPdv > 0,
      otherPdvs
    };
  }, [product.productPdv, currentPdvId]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'error', bgColor: '#ffebee', text: 'Sin stock' };
    if (stock <= 5) return { color: 'warning', bgColor: '#fff8e1', text: 'Stock bajo' };
    return { color: 'success', bgColor: '#e8f5e8', text: 'Disponible' };
  };

  const stockStatus = getStockStatus(stockInfo.available);
  const isOutOfStock = !stockInfo.hasStock;

  const handleAddProduct = () => {
    if (isOutOfStock && !product.sellInNegative) {
      // No agregar si no hay stock y no se permite vender en negativo
      return;
    }
    onAddProduct({ ...product, quantity: 1 });
  };

  // URL de imagen placeholder si no existe
  const imageUrl = product.image || `https://app.ally360.co/logo/logoFondoTransparentesvg.svg`;

  // Tooltip para productos sin stock
  const stockTooltip = useMemo(() => {
    if (stockInfo.hasStock) return '';

    if (stockInfo.otherPdvs.length === 0) {
      return 'Sin stock en ningún punto de venta';
    }

    return (
      <>
        <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
          Disponible en:
        </Typography>
        {stockInfo.otherPdvs.map((pdv, index) => (
          <Typography key={index} variant="caption" sx={{ display: 'block' }}>
            • {pdv.pdv_name}: {pdv.quantity} unidades
          </Typography>
        ))}
      </>
    );
  }, [stockInfo]);

  return (
    <Tooltip
      title={stockTooltip}
      placement="top"
      arrow
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'grey.900',
            '& .MuiTooltip-arrow': {
              color: 'grey.900'
            }
          }
        }
      }}
    >
      <Card
        sx={{
          height: 280,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isOutOfStock && !product.sellInNegative ? 'not-allowed' : 'pointer',
          opacity: isOutOfStock && !product.sellInNegative ? 0.5 : 1,
          filter: isOutOfStock && !product.sellInNegative ? 'grayscale(70%)' : 'none',
          '&:hover':
            isOutOfStock && !product.sellInNegative
              ? {}
              : {
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
              width: !product?.images?.length ? '50%' : '100%',
              height: '100%',
              objectFit: 'contain',
              margin: !product?.images?.length ? '0 auto' : '0',
              display: 'block',
              transition: 'transform 0.3s ease',
              filter: !product?.images?.length ? 'grayscale(1)' : 'none'
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
            {`Stock: ${stockInfo.available}`}
          </Box>

          {/* Out of Stock Overlay */}
          {isOutOfStock && !product.sellInNegative && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Chip
                label="SIN STOCK"
                color="error"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          )}
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
            disabled={isOutOfStock && !product.sellInNegative}
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
            {isOutOfStock && !product.sellInNegative ? 'Sin stock' : 'Agregar'}
          </Button>
        </CardContent>
      </Card>
    </Tooltip>
  );
};

export default ProductCard;
