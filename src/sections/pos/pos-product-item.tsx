import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
//
import { Typography } from '@mui/material';
import React from 'react';
// import { useCheckoutContext } from '../checkout/context'; // Comentado temporalmente

// ----------------------------------------------------------------------

export default function PosProductItem({ product }) {
  // Verificar que el producto existe y tiene las propiedades necesarias
  if (!product || typeof product !== 'object') {
    return null;
  }

  const { id, name, images = [], priceSale = 0, sku = '', quantityStock = 0 } = product;

  const colors = ['red', 'blue'];
  const available = quantityStock > 0;
  const sizes = ['S', 'M', 'L'];
  const saleLabel = { enabled: true, content: 'Sale' };

  const handleAddCart = async () => {
    const newProduct = {
      id,
      name: name || 'Producto sin nombre',
      images: images || ['/assets/placeholder.svg'],
      available,
      price: priceSale || 0, // El contexto espera 'price', no 'priceSale'
      priceSale: priceSale || 0,
      colors: [colors[0] || 'default'],
      size: sizes[0] || 'default',
      quantity: 1
    };
    try {
      console.log('Producto agregado al carrito (mockeado):', newProduct);
      // onAddToCart(newProduct); // Comentado temporalmente mientras se resuelve el contexto
    } catch (error) {
      console.error(error);
    }
  };

  const renderLabels = (quantityStock || saleLabel.enabled) && (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'absolute', zIndex: 9, top: 16, right: 16 }}>
      {quantityStock > 0 && (
        <Label variant="filled" color="info">
          <strong>Disponibles </strong> {` ${quantityStock}`}
        </Label>
      )}
      {!quantityStock && (
        <Label variant="filled" color="error">
          Sin unidades
        </Label>
      )}
    </Stack>
  );

  const renderImg = (
    <Box sx={{ position: 'relative', p: 1 }}>
      {!!quantityStock && (
        <Fab
          color="warning"
          size="medium"
          className="add-cart-btn"
          sx={{
            right: 16,
            bottom: 16,
            zIndex: 9,
            opacity: 0,
            position: 'absolute',
            transition: (theme) =>
              theme.transitions.create('all', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter
              })
          }}
        >
          <Iconify icon="solar:cart-plus-bold" width={24} />
        </Fab>
      )}

      <Tooltip title={!quantityStock && 'Out of stock'} placement="bottom-end">
        <Image
          alt={name || 'Producto'}
          src={images && images.length > 0 ? images[0] : '/assets/placeholder.svg'}
          ratio="1/1"
          sx={{
            borderRadius: 1.5,
            ...(!quantityStock && {
              opacity: 0.48,
              filter: 'grayscale(1)'
            })
          }}
        />
      </Tooltip>
    </Box>
  );

  const renderContent = (
    <Stack spacing={0.5} sx={{ p: 2, pt: 0.6 }}>
      <Typography variant="subtitle2" noWrap>
        {name || 'Producto sin nombre'}
      </Typography>
      <Typography variant="subtitle2" color="GrayText" sx={{ fontSize: 11 }} noWrap>
        <strong>SKU:</strong> {sku || 'N/A'}
      </Typography>

      <Stack direction="row" justifyContent="right" spacing={0.5} sx={{ typography: 'subtitle1' }}>
        <Box component="span">{fCurrency(priceSale || 0)}</Box>
      </Stack>
    </Stack>
  );

  return (
    <Card
      onClick={handleAddCart}
      sx={{
        '&:hover .add-cart-btn': {
          opacity: 1
        }
      }}
    >
      {renderLabels}

      {renderImg}

      {renderContent}
    </Card>
  );
}

PosProductItem.propTypes = {
  product: PropTypes.object
};
