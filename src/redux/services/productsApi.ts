import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';
import type { Product, PaginatedResponse, ProductFilters } from 'src/api/types';
import type { getProductResponse } from 'src/interfaces/inventory/productsInterface';

// ========================================
// 📦 PRODUCTS API - RTK QUERY
// ========================================

export interface ProductStock {
  pdv_id: string;
  quantity: number;
  min_quantity: number;
}

export interface CreateProductRequest {
  name: string;
  sku?: string;
  description?: string;
  barCode?: string;
  typeProduct: '1' | '2'; // '1' = simple, '2' = configurable
  priceSale: number;
  priceBase: number;
  state?: boolean;
  sellInNegative?: boolean;
  brand_id: string;
  category_id: string;
  tax_ids: string[];

  // 🆕 STAGED UPLOADS - Nuevo sistema
  upload_ids?: string[]; // IDs de StagedUpload confirmados

  // 🗑️ DEPRECATED - Base64 images (mantener compatibilidad)
  images?: string[];

  stocks: ProductStock[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: HOST_API,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Product', 'ProductList'],
  endpoints: (builder) => ({
    // ========================================
    // 📋 CONSULTAS (QUERIES)
    // ========================================

    /**
     * Obtener lista de productos con filtros y paginación
     */
    getProducts: builder.query<PaginatedResponse<Product>, ProductFilters>({
      query: (filters = {}) => {
        const searchParams = new URLSearchParams();

        // Búsqueda y filtros básicos
        if (filters.search) searchParams.set('search', filters.search);
        if (filters.category_id || filters.categoryId) {
          searchParams.set('category_id', filters.category_id || filters.categoryId || '');
        }
        if (filters.brand_id || filters.brandId) {
          searchParams.set('brand_id', filters.brand_id || filters.brandId || '');
        }
        if (typeof filters.is_active === 'boolean') {
          searchParams.set('is_active', filters.is_active.toString());
        }

        // Filtros de rango de precios
        if (filters.price_min !== undefined && filters.price_min > 0) {
          searchParams.set('price_min', filters.price_min.toString());
        }
        if (filters.price_max !== undefined && filters.price_max > 0) {
          searchParams.set('price_max', filters.price_max.toString());
        }

        // Filtros de rango de stock
        if (filters.stock_min !== undefined && filters.stock_min > 0) {
          searchParams.set('stock_min', filters.stock_min.toString());
        }
        if (filters.stock_max !== undefined && filters.stock_max < 1000) {
          searchParams.set('stock_max', filters.stock_max.toString());
        }

        // Filtros especiales
        if (filters.pdv_id) searchParams.set('pdv_id', filters.pdv_id);
        if (filters.has_low_stock === true) {
          searchParams.set('has_low_stock', 'true');
        }

        // Ordenamiento
        if (filters.sort_by) searchParams.set('sort_by', filters.sort_by);
        if (filters.sort_order) searchParams.set('sort_order', filters.sort_order);

        // Paginación
        if (filters.page) searchParams.set('page', filters.page.toString());
        if (filters.limit) searchParams.set('limit', filters.limit.toString());

        return `/products/?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'ProductList', id: 'LIST' }]
          : [{ type: 'ProductList', id: 'LIST' }]
    }),

    /**
     * Obtener producto por ID
     */
    getProductById: builder.query<getProductResponse, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
      transformResponse: (response: any): getProductResponse => (response?.data ? response.data : response)
    }),

    // ========================================
    // ✏️ MUTACIONES (MUTATIONS)
    // ========================================

    /**
     * Crear nuevo producto
     */
    createProduct: builder.mutation<getProductResponse, CreateProductRequest>({
      query: (newProduct) => ({
        url: '/products/simple',
        method: 'POST',
        body: newProduct
      }),
      invalidatesTags: [{ type: 'ProductList', id: 'LIST' }],
      transformResponse: (response: any): getProductResponse => (response?.data ? response.data : response)
    }),

    /**
     * Actualizar producto existente
     */
    updateProduct: builder.mutation<getProductResponse, UpdateProductRequest>({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'ProductList', id: 'LIST' }
      ],
      transformResponse: (response: any): getProductResponse => (response?.data ? response.data : response)
    }),

    /**
     * Eliminar producto
     */
    deleteProduct: builder.mutation<{ success: boolean }, string>({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
        { type: 'ProductList', id: 'LIST' }
      ]
    }),

    /**
     * Cambiar estado del producto (activar/desactivar)
     */
    toggleProductState: builder.mutation<getProductResponse, { productId: string; state: boolean }>({
      query: ({ productId, state }) => ({
        url: `/products/${productId}`,
        method: 'PATCH',
        body: { state }
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'ProductList', id: 'LIST' }
      ],
      transformResponse: (response: any): getProductResponse => (response?.data ? response.data : response)
    }),

    /** Assign taxes to a product */
    assignProductTaxes: builder.mutation<any, { productId: string; tax_ids: string[] }>({
      query: ({ productId, tax_ids }) => ({
        url: `/products/${productId}/taxes`,
        method: 'POST',
        body: { tax_ids }
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'ProductList', id: 'LIST' }
      ]
    }),

    /** Update min stock for a product in a PDV */
    updateProductMinStock: builder.mutation<any, { productId: string; pdvId: string; minQuantity: number }>({
      query: ({ productId, pdvId, minQuantity }) => ({
        url: `/products/${productId}/stock/${pdvId}/min-quantity`,
        method: 'PATCH',
        body: { min_quantity: minQuantity }
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: 'Product', id: productId }]
    })
  })
});

// ========================================
// 🎯 EXPORT HOOKS
// ========================================

export const {
  // Queries
  useGetProductsQuery,
  useGetProductByIdQuery,

  // Mutations
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductStateMutation,
  useAssignProductTaxesMutation,
  useUpdateProductMinStockMutation,

  // Utils
  util: { getRunningQueriesThunk }
} = productsApi;

// ========================================
// 🔄 ACTION CREATORS PARA INVALIDACIÓN
// ========================================

export const { resetApiState: resetProductsApiState } = productsApi.util;
