import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from './baseQuery';

export interface Seller {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  document?: string;
  is_active: boolean;
  commission_rate?: string;
  base_salary?: string;
  notes?: string;
  role?: string;
  is_invitation_pending?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GetSellersResponse {
  sellers: Seller[];
  total: number;
  limit: number;
  offset: number;
}

export interface GetSellersParams {
  active_only?: boolean;
  limit?: number;
  offset?: number;
}

export const sellersApi = createApi({
  reducerPath: 'sellersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Sellers', 'Seller'],
  endpoints: (builder) => ({
    getSellers: builder.query<Seller[], GetSellersParams | void>({
      query: (params) => {
        const p = params || {};
        const sp = new URLSearchParams();

        if (typeof p.active_only === 'boolean') sp.set('active_only', String(p.active_only));
        if (typeof p.limit === 'number') sp.set('limit', String(p.limit));
        if (typeof p.offset === 'number') sp.set('offset', String(p.offset));

        const qs = sp.toString();
        return `/sellers/${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: GetSellersResponse): Seller[] => response?.sellers || [],
      providesTags: (result) =>
        result?.length
          ? [...result.map((s) => ({ type: 'Seller' as const, id: s.id })), { type: 'Sellers', id: 'LIST' }]
          : [{ type: 'Sellers', id: 'LIST' }]
    })
  })
});

export const { useGetSellersQuery } = sellersApi;
