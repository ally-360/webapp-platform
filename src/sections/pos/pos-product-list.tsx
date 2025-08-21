import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
//
import PosProductItem from 'src/sections/pos/pos-product-item';
import { useMediaQuery } from '@mui/material';
import json2mq from 'json2mq';
import React from 'react';
import { PosProductItemSkeleton } from './pos-product-skeleton';

// ----------------------------------------------------------------------

export default function PosProductList({ products, loading, ...other }) {
  const renderSkeleton = (
    <>
      {[...Array(16)].map((_, index) => (
        <PosProductItemSkeleton key={index} />
      ))}
    </>
  );

  const renderList = (
    <>
      {products && products.length > 0
        ? products.map((product, index) => <PosProductItem key={product?.id || index} product={product} />)
        : null}
    </>
  );

  const matches = useMediaQuery(
    json2mq({
      minWidth: 1800
    })
  );

  return (
    <>
      <Box
        gap={3}
        display="grid"
        sx={{
          ...(matches && {
            gridTemplateColumns: 'repeat(5, 1fr)'
          })
        }}
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)'
        }}
        {...other}
      >
        {loading ? renderSkeleton : renderList}
      </Box>

      {products.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center'
            }
          }}
        />
      )}
    </>
  );
}

PosProductList.propTypes = {
  loading: PropTypes.bool,
  products: PropTypes.array
};
