import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';
import type { Product, PaginatedResponse, ProductFilters } from 'src/api/types';
import type { getProductResponse } from 'src/interfaces/inventory/productsInterface';
import type { RootState } from '../store';

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
  images: string[];
  stocks: ProductStock[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: HOST_API,
    prepareHeaders: (headers, { getState }) => {
      const { auth } = getState() as RootState;
      console.log('🔑 ProductsAPI prepareHeaders:', { token: auth.token ? 'EXISTS' : 'MISSING' });
      if (auth.token) {
        headers.set('Authorization', `Bearer ${auth.token}`);
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

        if (filters.companyId) searchParams.set('companyId', filters.companyId);
        if (filters.search) searchParams.set('search', filters.search);
        if (filters.categoryId) searchParams.set('categoryId', filters.categoryId);
        if (filters.brandId) searchParams.set('brandId', filters.brandId);
        if (filters.page) searchParams.set('page', filters.page.toString());
        if (filters.limit) searchParams.set('limit', filters.limit.toString());

        return `/products?${searchParams.toString()}`;
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
