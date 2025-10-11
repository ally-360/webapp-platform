import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// ========================================
// 📋 Types & Interfaces
// ========================================

export interface BrandBase {
  name: string;
  description?: string;
}

export interface BrandCreate extends BrandBase {
  logo?: string; // Campo adicional para creación
}

export interface BrandUpdate extends Partial<BrandBase> {
  id?: string; // Para permitir actualizaciones parciales
}

export interface BrandOutput {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandListResponse {
  brands: BrandOutput[];
  total: number;
}

export interface BrandResponse {
  message?: string;
  [key: string]: any;
}

// ========================================
// 🔧 RTK Query API
// ========================================

export const brandsApi = createApi({
  reducerPath: 'brandsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      const { auth } = getState() as RootState;
      const { token } = auth;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Brand'],
  endpoints: (builder) => ({
    // ========================================
    // 📖 GET Brands - Obtener todas las marcas
    // ========================================
    getBrands: builder.query<BrandOutput[], void>({
      query: () => '/brands',
      providesTags: ['Brand'],
      transformResponse: (response: any) => {
        // Si la respuesta es un array directo
        if (Array.isArray(response)) {
          return response;
        }
        // Si la respuesta es un objeto con marcas
        return response?.brands || response?.data || [];
      }
    }),

    // ========================================
    // 📖 GET Brand by ID - Obtener marca específica
    // ========================================
    getBrandById: builder.query<BrandOutput, string>({
      query: (id) => `/brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }]
    }),

    // ========================================
    // ➕ POST Create Brand - Crear nueva marca
    // ========================================
    createBrand: builder.mutation<BrandOutput, BrandCreate>({
      query: (brandData) => ({
        url: '/brands',
        method: 'POST',
        body: brandData
      }),
      invalidatesTags: ['Brand'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate catalogApi brands as well
          dispatch(brandsApi.util.invalidateTags([{ type: 'Brand' as const }]));
          // Also invalidate catalogApi if it exists in the store
          const { catalogApi } = await import('./catalogApi');
          dispatch(catalogApi.util.invalidateTags([{ type: 'Brand' as const }]));
        } catch {
          // ignore
        }
      }
    }),

    // ========================================
    // ✏️ PUT Update Brand - Actualizar marca
    // ========================================
    updateBrand: builder.mutation<BrandOutput, { id: string; data: BrandUpdate }>({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand', id }, 'Brand']
    }),

    // ========================================
    // 🗑️ DELETE Brand - Eliminar marca
    // ========================================
    deleteBrand: builder.mutation<BrandResponse, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Brand']
    }),

    // ========================================
    // 📊 GET Brand with Products - Marca con productos asociados
    // ========================================
    getBrandWithProducts: builder.query<any, string>({
      query: (id) => `/brands/${id}/products`,
      providesTags: (result, error, id) => [{ type: 'Brand', id }]
    })
  })
});

// ========================================
// 🎣 Export Hooks
// ========================================
export const {
  useGetBrandsQuery,
  useGetBrandByIdQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandWithProductsQuery
} = brandsApi;

// ========================================
// 🔄 Export API Reducer
// ========================================
export default brandsApi.reducer;
