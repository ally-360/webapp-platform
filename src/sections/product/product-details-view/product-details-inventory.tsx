import { Icon } from '@iconify/react';
import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Stack } from '@mui/system';
import React from 'react';
import PropTypes from 'prop-types';
import MenuCategories from 'src/sections/categories/MenuCategories';
import { fCurrency, fNumber } from 'src/utils/format-number';

function ProductDetailsInventory({ product }) {
  const { productPdv, priceBase } = product;
  return (
    <div>
      {productPdv.map((item: any) => (
        <Stack key={item.pdv_id || item.id} flexDirection="row" alignItems="center">
          <ListItem
            sx={{ paddingLeft: 0, cursor: 'pointer' }}
            onClick={() => {
              // setPdvEdit(item);
              console.log('item', item);
              // dispatch(setPopupAssignInventory(true));
            }}
          >
            <ListItemAvatar>
              <Avatar variant="rounded" sx={{ width: 60, height: 60 }}>
                <Icon width={40} height={40} icon="tabler:building-warehouse" />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={item.pdv_name}
              secondary={`Cantidad: ${fNumber(item.quantity)} Cantidad minima: ${fNumber(item.min_quantity)}`}
            />
            {/* TODO BACKEND: agregar precio en que se compra el producto, mantener trazabilidad y devolver valor del inventario por pdv */}
            <ListItemText primary="Valor del inventario" secondary={`${fCurrency(item.quantity * priceBase)} COP`} />
          </ListItem>
          <MenuCategories
            view={false}
            element={item}
            handleEdit={() => {
              // setPdvEdit(item);
              console.log('item', item);
              // dispatch(setPopupAssignInventory(true));
            }}
            handleDelete={() => {
              // const newPdv = values.productsPdvs.filter((pdv: PDVproduct) => pdv.id !== item.id);
              // setValue('productsPdvs', newPdv);
              console.log('item', item);
            }}
          />
        </Stack>
      ))}
    </div>
  );
}

export default ProductDetailsInventory;

ProductDetailsInventory.propTypes = {
  product: PropTypes.shape({
    productPdv: PropTypes.array,
    priceBase: PropTypes.number
  })
};
