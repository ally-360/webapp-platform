import PropTypes from 'prop-types';
// @mui
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
// routes
import { paths } from 'src/routes/paths';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Label from 'src/components/label';
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
//
import { Typography } from '@mui/material';
import React from 'react';
import { useCheckoutContext } from '../checkout/context';

// ----------------------------------------------------------------------

export default function PosProductItem({ product }) {
  const { onAddToCart } = useCheckoutContext();

  // const { id, name, images[0], price, colors, available, sizes, priceSale, newLabel, saleLabel } = product;
  const { id, name, images, priceSale, sku, quantityStock } = product;

  const colors = ['red', 'blue'];
  const available = true;
  const sizes = ['S', 'M', 'L'];
  const saleLabel = { enabled: true, content: 'Sale' };

  const linkTo = paths.dashboard.product.details(id);

  const handleAddCart = async () => {
    const newProduct = {
      id,
      name,
      images,
      available,
      priceSale,
      colors: [colors[0]],
      size: sizes[0],
      quantity: 1
    };
    try {
      console.log('newProduct', newProduct);
      onAddToCart(newProduct);
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
          alt={name}
          src={images[0]}
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
      {name}
      <Typography variant="subtitle2" color="GrayText" sx={{ fontSize: 11 }} noWrap>
        <strong>SKU:</strong> {sku}
      </Typography>

      <Stack direction="row" justifyContent="right" spacing={0.5} sx={{ typography: 'subtitle1' }}>
        <Box component="span">{fCurrency(priceSale)}</Box>
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
