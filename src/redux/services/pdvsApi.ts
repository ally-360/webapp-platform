import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

// Types
export interface PDV {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone_number: string;
  phoneNumber?: string;
  is_active: boolean;
  main?: boolean;
  location?: {
    id: string;
    name: string;
  };
}

export interface CreatePDVRequest {
  name: string;
  description?: string;
  address: string;
  phoneNumber: string;
  location: {
    id: string;
  };
  company?: string;
  main?: boolean;
}

export interface UpdatePDVRequest {
  name?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  location?: {
    id: string;
  };
  main?: boolean;
}

export interface PDVsResponse {
  pdvs: PDV[];
}

export const pdvsApi = createApi({
  reducerPath: 'pdvsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['PDV'],
  endpoints: (builder) => ({
    // Get all PDVs
    getPDVs: builder.query<PDV[], void>({
      query: () => '/pdvs/',
      transformResponse: (response: PDVsResponse) => response.pdvs || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'PDV' as const, id })), { type: 'PDV', id: 'LIST' }]
          : [{ type: 'PDV', id: 'LIST' }]
    }),

    // Get single PDV by ID
    getPDVById: builder.query<PDV, string>({
      query: (id) => `/pdvs/${id}`,
      providesTags: (result, error, id) => [{ type: 'PDV', id }]
    }),

    // Create new PDV
    createPDV: builder.mutation<PDV, CreatePDVRequest>({
      query: (pdv) => ({
        url: '/pdvs/',
        method: 'POST',
        body: pdv
      }),
      invalidatesTags: [{ type: 'PDV', id: 'LIST' }]
    }),

    // Update existing PDV
    updatePDV: builder.mutation<PDV, { id: string; pdv: UpdatePDVRequest }>({
      query: ({ id, pdv }) => ({
        url: `/pdvs/${id}`,
        method: 'PATCH',
        body: pdv
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PDV', id },
        { type: 'PDV', id: 'LIST' }
      ]
    }),

    // Delete PDV
    deletePDV: builder.mutation<void, string>({
      query: (id) => ({
        url: `/pdvs/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'PDV', id: 'LIST' }]
    })
  })
});

export const { useGetPDVsQuery, useGetPDVByIdQuery, useCreatePDVMutation, useUpdatePDVMutation, useDeletePDVMutation } =
  pdvsApi;
