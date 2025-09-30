import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product, PaginatedResponse, ProductFilters } from 'src/api/types';
import type { RootState } from '../store';

// ========================================
// 📦 PRODUCTS API - RTK QUERY
// ========================================

export interface CreateProductRequest {
  name: string;
  description?: string;
  barCode?: string;
  images: string[];
  typeProduct: '1' | '2'; // '1' = simple, '2' = configurable
  taxesOption: number;
  sku?: string;
  priceSale: number; // en centavos
  priceBase: number; // en centavos
  categoryId: string;
  brandId: string;
  state?: boolean;
  sellInNegative?: boolean;
  quantityStock?: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_HOST_API,
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

        const url = `/products?${searchParams.toString()}`;
        console.log('📡 ProductsAPI Query URL:', url, { filters });
        return url;
      },
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Product' as const, id })), { type: 'ProductList', id: 'LIST' }]
          : [{ type: 'ProductList', id: 'LIST' }],
      transformResponse: (response: { success: boolean; data: PaginatedResponse<Product> }) => {
        console.log('📦 ProductsAPI Response:', response);
        return response.data;
      }
    }),

    /**
     * Obtener producto por ID
     */
    getProductById: builder.query<Product, string>({
      query: (productId) => `/products/${productId}`,
      providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
      transformResponse: (response: { success: boolean; data: Product }) => response.data
    }),

    // ========================================
    // ✏️ MUTACIONES (MUTATIONS)
    // ========================================

    /**
     * Crear nuevo producto
     */
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        body: newProduct
      }),
      invalidatesTags: [{ type: 'ProductList', id: 'LIST' }],
      transformResponse: (response: { success: boolean; data: Product }) => response.data
    }),

    /**
     * Actualizar producto existente
     */
    updateProduct: builder.mutation<Product, UpdateProductRequest>({
      query: ({ id, ...patch }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'ProductList', id: 'LIST' }
      ],
      transformResponse: (response: { success: boolean; data: Product }) => response.data
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
    toggleProductState: builder.mutation<Product, { productId: string; state: boolean }>({
      query: ({ productId, state }) => ({
        url: `/products/${productId}/state`,
        method: 'PATCH',
        body: { state }
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'ProductList', id: 'LIST' }
      ],
      transformResponse: (response: { success: boolean; data: Product }) => response.data
    }),

    /**
     * Actualizar stock de producto
     */
    updateProductStock: builder.mutation<Product, { productId: string; quantityStock: number }>({
      query: ({ productId, quantityStock }) => ({
        url: `/products/${productId}/stock`,
        method: 'PATCH',
        body: { quantityStock }
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        { type: 'ProductList', id: 'LIST' }
      ],
      transformResponse: (response: { success: boolean; data: Product }) => response.data
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
  useUpdateProductStockMutation,

  // Utils
  util: { getRunningQueriesThunk }
} = productsApi;

// ========================================
// 🔄 ACTION CREATORS PARA INVALIDACIÓN
// ========================================

export const { resetApiState: resetProductsApiState } = productsApi.util;
