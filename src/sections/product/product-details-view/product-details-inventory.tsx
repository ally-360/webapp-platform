import { Icon } from '@iconify/react';
import { Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { Stack } from '@mui/system';
import React, { memo, useCallback } from 'react';
import PropTypes from 'prop-types';
import MenuCategories from 'src/sections/categories/MenuCategories';
import { fCurrency, fNumber } from 'src/utils/format-number';
import { getProductResponse } from 'src/interfaces/inventory/productsInterface';

// Tipado del producto para evitar any
interface ProductPdv {
  pdv_id?: string;
  id?: string;
  pdv_name: string;
  quantity: number;
  min_quantity: number;
}

interface ProductDetailsInventoryProps {
  product: getProductResponse & {
    productPdv?: ProductPdv[];
  };
}

// Componente memoizado para evitar re-renderizados innecesarios
function ProductDetailsInventory({ product }: ProductDetailsInventoryProps) {
  const { productPdv = [], priceBase } = product;

  // ========================================
  // 🎯 CALLBACKS ESTABLES
  // ========================================

  const handleEditItem = useCallback((item: ProductPdv) => {
    console.log('Editar item:', item);
    // TODO: Implementar lógica de edición
    // setPdvEdit(item);
    // dispatch(setPopupAssignInventory(true));
  }, []);

  const handleDeleteItem = useCallback((item: ProductPdv) => {
    console.log('Eliminar item:', item);
    // TODO: Implementar lógica de eliminación
    // const newPdv = values.productsPdvs.filter((pdv: PDVproduct) => pdv.id !== item.id);
    // setValue('productsPdvs', newPdv);
  }, []);

  const handleClickItem = useCallback((item: ProductPdv) => {
    console.log('Click en item:', item);
    // TODO: Implementar lógica de click
    // setPdvEdit(item);
    // dispatch(setPopupAssignInventory(true));
  }, []);

  // ========================================
  // 🏗️ RENDERIZADO DE ITEMS
  // ========================================

  if (!productPdv || productPdv.length === 0) {
    return (
      <div>
        <p>No hay inventario disponible para este producto.</p>
      </div>
    );
  }

  return (
    <div>
      {productPdv.map((item) => {
        const itemKey = item.pdv_id || item.id || `pdv-${Math.random()}`;
        const inventoryValue = item.quantity * priceBase;

        return (
          <Stack key={itemKey} flexDirection="row" alignItems="center">
            <ListItem sx={{ paddingLeft: 0, cursor: 'pointer' }} onClick={() => handleClickItem(item)}>
              <ListItemAvatar>
                <Avatar variant="rounded" sx={{ width: 60, height: 60 }}>
                  <Icon width={40} height={40} icon="tabler:building-warehouse" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.pdv_name}
                secondary={`Cantidad: ${fNumber(item.quantity)} | Cantidad mínima: ${fNumber(item.min_quantity)}`}
              />
              <ListItemText
                primary="Valor del inventario"
                secondary={`${fCurrency(inventoryValue)} COP`}
                sx={{ textAlign: 'right' }}
              />
            </ListItem>
            <MenuCategories
              view={false}
              element={item}
              handleEdit={() => handleEditItem(item)}
              handleDelete={() => handleDeleteItem(item)}
            />
          </Stack>
        );
      })}
    </div>
  );
}

// Memoización del componente para prevenir re-renderizados innecesarios
export default memo(ProductDetailsInventory);

ProductDetailsInventory.propTypes = {
  product: PropTypes.shape({
    productPdv: PropTypes.array,
    priceBase: PropTypes.number.isRequired
  }).isRequired
};
