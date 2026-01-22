import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ========================================
// 🏷️ TAXES API - RTK QUERY
// ========================================

export interface Tax {
  id: string;
  name: string;
  percentage: number; // derived from API's `rate`
  description?: string;
  isActive?: boolean;
}

export interface PDV {
  id: string;
  name: string;
  address: string;
  phone_number?: string;
  is_active: boolean;
}

export const catalogApi = createApi({
  reducerPath: 'catalogApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tax', 'PDV', 'Category', 'Brand'],
  endpoints: (builder) => ({
    // ========================================
    // 💰 TAXES
    // ========================================
    getTaxes: builder.query<Tax[], void>({
      query: () => '/taxes',
      transformResponse: (response: any): Tax[] => {
        // Backend returns: { taxes: [...], total, limit, offset }
        const list = Array.isArray(response?.taxes) ? response.taxes : [];
        return list.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          percentage: typeof t.rate === 'string' ? parseFloat(t.rate) : Number(t.rate ?? 0),
          description: t.code || undefined,
          isActive: true
        }));
      },
      providesTags: ['Tax']
    }),

    // ========================================
    // 🏢 PDVS
    // ========================================
    getPDVs: builder.query<PDV[], void>({
      query: () => '/pdvs',
      transformResponse: (response: any): PDV[] => {
        const list = Array.isArray(response?.pdvs) ? response.pdvs : [];
        return list.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          address: p.address,
          phone_number: p.phone_number,
          is_active: Boolean(p.is_active)
        }));
      },
      providesTags: ['PDV']
    }),

    // ========================================
    // 🏷️ CATEGORIES
    // ========================================
    getCategories: builder.query<Array<{ id: string; name: string; description?: string }>, void>({
      query: () => '/categories',
      transformResponse: (response: any) => {
        const list = Array.isArray(response?.categories) ? response.categories : [];
        return list.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          description: c.description
        }));
      },
      providesTags: ['Category']
    }),

    // ========================================
    // 🏷️ BRANDS
    // ========================================
    getBrands: builder.query<Array<{ id: string; name: string; description?: string }>, void>({
      query: () => '/brands',
      transformResponse: (response: any) => {
        const list = Array.isArray(response?.brands) ? response.brands : [];
        return list.map((b: any) => ({
          id: String(b.id),
          name: b.name,
          description: b.description
        }));
      },
      providesTags: ['Brand']
    })
  })
});

export const { useGetTaxesQuery, useGetPDVsQuery, useGetCategoriesQuery, useGetBrandsQuery } = catalogApi;
