import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';

// Minimal types for Contacts aligned with backend docs
export type ContactType = 'client' | 'provider';
export type IdType = 'CC' | 'NIT' | 'CE' | 'PASSPORT' | string;
export type PersonType = 'natural' | 'juridica' | 'NATURAL' | 'JURIDICA' | string;

export interface ContactAddress {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string | null;
}

export interface Contact {
  id: string;
  name: string;
  type: ContactType[];
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
  mobile?: string;
  id_type?: IdType;
  id_number?: string;
  dv?: number | null;
  person_type?: PersonType;
  fiscal_responsibilities?: string[];
  payment_terms_days?: number | null;
  credit_limit?: number | null;
  seller_id?: string | null;
  price_list_id?: string | null;
  billing_address?: ContactAddress;
  shipping_address?: ContactAddress;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactCreateRequest {
  name: string;
  type: ContactType[];
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
  mobile?: string;
  id_type?: IdType;
  id_number?: string;
  dv?: number | null;
  person_type?: PersonType;
  fiscal_responsibilities?: string[];
  payment_terms_days?: number | null;
  credit_limit?: number | null;
  seller_id?: string | null;
  price_list_id?: string | null;
  billing_address?: ContactAddress;
  shipping_address?: ContactAddress;
  notes?: string;
  is_active?: boolean;
}

export interface ContactFilters {
  search?: string;
  type?: ContactType;
  is_active?: boolean;
  seller_id?: string;
  limit?: number;
  offset?: number;
}

export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: HOST_API,
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Contacts', 'Contact'],
  endpoints: (builder) => ({
    getContacts: builder.query<Contact[], ContactFilters>({
      query: (filters = {}) => {
        const sp = new URLSearchParams();
        if (filters.search) sp.set('search', filters.search);
        if (filters.type) sp.set('type', filters.type);
        if (typeof filters.is_active === 'boolean') sp.set('is_active', String(filters.is_active));
        if (filters.seller_id) sp.set('seller_id', filters.seller_id);
        if (filters.limit) sp.set('limit', String(filters.limit));
        if (filters.offset) sp.set('offset', String(filters.offset));
        const qs = sp.toString();
        return `/contacts/${qs ? `?${qs}` : ''}`;
      },
      providesTags: (result) =>
        result?.length
          ? [...result.map((c) => ({ type: 'Contact' as const, id: c.id })), { type: 'Contacts', id: 'LIST' }]
          : [{ type: 'Contacts', id: 'LIST' }],
      transformResponse: (response: any): Contact[] => {
        if (response?.items) return response.items;
        if (response?.data) return response.data;
        return response;
      }
    }),
    getContactById: builder.query<Contact, string>({
      query: (id) => `/contacts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contact', id }],
      transformResponse: (response: any): Contact => {
        if (response?.data) return response.data;
        return response;
      }
    }),
    createContact: builder.mutation<Contact, ContactCreateRequest>({
      query: (body) => ({ url: '/contacts/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
      transformResponse: (response: any): Contact => {
        if (response?.data) return response.data;
        return response;
      }
    }),
    updateContact: builder.mutation<Contact, { id: string } & Partial<ContactCreateRequest>>({
      query: ({ id, ...body }) => ({ url: `/contacts/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Contact', id },
        { type: 'Contacts', id: 'LIST' }
      ],
      transformResponse: (response: any): Contact => {
        if (response?.data) return response.data;
        return response;
      }
    }),
    deleteContact: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/contacts/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Contact', id },
        { type: 'Contacts', id: 'LIST' }
      ]
    }),
    restoreContact: builder.mutation<any, string>({
      query: (id) => ({ url: `/contacts/${id}/restore`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [{ type: 'Contact', id }]
    }),
    getContactsForInvoices: builder.query<Contact[], { search?: string }>({
      query: (q = {}) => `/contacts/clients/for-invoices${q.search ? `?search=${encodeURIComponent(q.search)}` : ''}`,
      transformResponse: (response: any): Contact[] => {
        if (response?.items) return response.items;
        if (response?.data) return response.data;
        return response;
      }
    }),
    getContactsForBills: builder.query<Contact[], { search?: string }>({
      query: (q = {}) => `/contacts/providers/for-bills${q.search ? `?search=${encodeURIComponent(q.search)}` : ''}`,
      transformResponse: (response: any): Contact[] => {
        if (response?.items) return response.items;
        if (response?.data) return response.data;
        return response;
      }
    })
  })
});

export const {
  useGetContactsQuery,
  useGetContactByIdQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
  useRestoreContactMutation,
  useGetContactsForInvoicesQuery,
  useGetContactsForBillsQuery
} = contactsApi;
