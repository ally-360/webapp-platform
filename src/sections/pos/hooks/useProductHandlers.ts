import { useAppDispatch } from 'src/hooks/store';
import {
  addProductToSaleWindow,
  removeProductFromSaleWindow,
  updateProductQuantity,
  type Product,
  type SaleWindow
} from 'src/redux/pos/posSlice';

/**
 * Hook para manejar las acciones de productos en una ventana de venta
 */
export const useProductHandlers = (sale: SaleWindow) => {
  const dispatch = useAppDispatch();

  const handleAddProduct = (product: Product) => {
    dispatch(addProductToSaleWindow({ windowId: sale.id, product }));
  };

  const handleRemoveProduct = (productId: number) => {
    dispatch(removeProductFromSaleWindow({ windowId: sale.id, productId }));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    dispatch(updateProductQuantity({ windowId: sale.id, productId, quantity }));
  };

  return {
    handleAddProduct,
    handleRemoveProduct,
    handleUpdateQuantity
  };
};
