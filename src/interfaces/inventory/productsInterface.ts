import * as Yup from 'yup';
import { NewProductSchema } from './productsSchemas';

// export interface CreateProduct {
//   name: string;
//   description: string;
//   barCode: string;
//   images: string[];
//   typeProduct: number;
//   state: boolean;
//   sellInNegative: boolean;
//   taxesOption: number;
//   sku: string;
//   priceSale: number;
//   priceBase: number;
//   quantityStock: number;
//   brand: { id: string };
//   productMainProduct?: { id: string };
//   subProductsIds?: string[];
//   category: { id: string };
//   productsPdvs: string[];
// }

export type NewProductInterface = Yup.InferType<typeof NewProductSchema>;

export interface PDVproduct {
  id: string;
  pdv: string;
  name?: string;
  minQuantity: number;
  quantity: number;
}

export interface getProductResponse extends NewProductInterface {
  id: string;
  quantityStock: number;
  category: NewProductInterface['category'] & {
    name: string;
  };
  brand: NewProductInterface['brand'] & {
    name: string;
  };
}
