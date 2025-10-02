import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

// Types
export interface PDV {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePDVRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface PDVsResponse {
  pdvs?: PDV[];
  data?: PDV[];
  total?: number;
  limit?: number;
  offset?: number;
}

export const pdvsApi = createApi({
  reducerPath: 'pdvsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['PDV'],
  endpoints: (builder) => ({
    // Get all PDVs
    getPDVs: builder.query<PDV[], void>({
      query: () => '/pdvs',
      transformResponse: (response: any) => {
        console.log('PDVs API response:', response);
        if (response?.pdvs) return response.pdvs;
        if (response?.data) return response.data;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['PDV']
    }),

    // Get single PDV by ID
    getPDVById: builder.query<PDV, string>({
      query: (id) => `/pdvs/${id}`,
      providesTags: (result, error, id) => [{ type: 'PDV', id }]
    }),

    // Create new PDV
    createPDV: builder.mutation<PDV, CreatePDVRequest>({
      query: (pdv) => ({
        url: '/pdvs',
        method: 'POST',
        body: pdv
      }),
      invalidatesTags: ['PDV']
    }),

    // Update existing PDV
    updatePDV: builder.mutation<PDV, { id: string; pdv: Partial<CreatePDVRequest> }>({
      query: ({ id, pdv }) => ({
        url: `/pdvs/${id}`,
        method: 'PUT',
        body: pdv
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PDV', id }, 'PDV']
    }),

    // Delete PDV
    deletePDV: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pdvs/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['PDV']
    })
  })
});

export const {
  useGetPDVsQuery,
  useGetPDVByIdQuery,
  useCreatePDVMutation,
  useUpdatePDVMutation,
  useDeletePDVMutation
} = pdvsApi;