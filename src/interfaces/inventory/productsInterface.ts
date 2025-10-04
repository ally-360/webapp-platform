import type { Product, Brand, Category } from 'src/api/types';
import * as Yup from 'yup';
import { NewProductSchema } from './productsSchemas';

// ========================================
// 📦 PRODUCT INTERFACES - UPDATED FOR BACKEND
// ========================================

export type NewProductInterface = Yup.InferType<typeof NewProductSchema>;

// Extiende de la interfaz del backend con campos adicionales del frontend
export interface ProductWithExtendedInfo extends Product {
  // Información calculada del frontend
  globalStock?: number;
  inventoryType?: 'Existencias' | 'Sin existencias' | 'Pocas existencias';

  // Relaciones con nombres populados
  category?: Category;
  brand?: Brand;
}

// Para compatibilidad con código existente - simplified version
export interface getProductResponse {
  id: string;
  name: string;
  description?: string;
  barCode?: string;
  images: string[];
  typeProduct: '1' | '2';
  taxesOption: number;
  sku?: string;
  priceSale: number;
  priceBase: number;
  quantityStock: number;
  state?: boolean;
  sellInNegative?: boolean;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
  // Campos calculados frontend
  globalStock?: number;
  inventoryType?: 'Existencias' | 'Sin existencias' | 'Pocas existencias';
}

// Interfaz para formularios de creación/edición
export interface ProductFormData {
  name: string;
  description?: string;
  barCode?: string;
  images: string[];
  typeProduct: '1' | '2'; // '1' = simple, '2' = configurable
  taxesOption: number;
  sku?: string;
  priceSale: number;
  priceBase: number;
  categoryId: string;
  brandId: string;
  state?: boolean;
  sellInNegative?: boolean;
  quantityStock?: number;
}

// Para soporte de PDVs - Legacy
export interface PDVproduct {
  id: string;
  pdv: string;
  name?: string;
  minQuantity: number;
  quantity: number;
}
