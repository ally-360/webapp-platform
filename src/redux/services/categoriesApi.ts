import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// ========================================
// 📋 Types & Interfaces
// ========================================

export interface CategoryBase {
  name: string;
  description?: string;
  parent_id?: string | null;
}

export interface CategoryCreate extends CategoryBase {
  company_id?: string; // Campo adicional para especificar la empresa
}

export interface CategoryUpdate extends Partial<CategoryBase> {
  id?: string; // Para permitir actualizaciones parciales
}

export interface CategoryOutput {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: CategoryOutput | null;
  subcategories?: CategoryOutput[];
}

export interface CategoryListResponse {
  categories: CategoryOutput[];
  total: number;
}

export interface CategoryResponse {
  message?: string;
  [key: string]: any;
}

// ========================================
// 🔧 RTK Query API
// ========================================

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
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
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // ========================================
    // 📖 GET Categories - Obtener todas las categorías
    // ========================================
    getCategories: builder.query<CategoryOutput[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
      transformResponse: (response: any) => {
        // Si la respuesta es un array directo
        if (Array.isArray(response)) {
          return response;
        }
        // Si la respuesta es un objeto con categorías
        return response?.categories || response?.data || [];
      }
    }),

    // ========================================
    // 📖 GET Category by ID - Obtener categoría específica
    // ========================================
    getCategoryById: builder.query<CategoryOutput, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }]
    }),

    // ========================================
    // ➕ POST Create Category - Crear nueva categoría
    // ========================================
    createCategory: builder.mutation<CategoryOutput, CategoryCreate>({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData
      }),
      invalidatesTags: ['Category']
    }),

    // ========================================
    // ✏️ PUT Update Category - Actualizar categoría
    // ========================================
    updateCategory: builder.mutation<CategoryOutput, { id: string; data: CategoryUpdate }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }, 'Category']
    }),

    // ========================================
    // 🗑️ DELETE Category - Eliminar categoría
    // ========================================
    deleteCategory: builder.mutation<CategoryResponse, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Category']
    }),

    // ========================================
    // 📊 GET Category with Products - Categoría con productos asociados
    // ========================================
    getCategoryWithProducts: builder.query<any, string>({
      query: (id) => `/categories/${id}/products`,
      providesTags: (result, error, id) => [{ type: 'Category', id }]
    })
  })
});

// ========================================
// 🎣 Export Hooks
// ========================================
export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryWithProductsQuery
} = categoriesApi;

// ========================================
// 🔄 Export API Reducer
// ========================================
export default categoriesApi.reducer;
