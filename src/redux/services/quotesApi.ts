import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  QuoteDetail,
  QuotesResponse,
  QuotesFilters,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  ConvertQuoteToInvoiceRequest
} from 'src/types/quotes';
import { baseQueryWithAuth } from './baseQuery';

// ============================================================================
// QUOTES API
// ============================================================================

export const quotesApi = createApi({
  reducerPath: 'quotesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Quote', 'QuoteList'],
  endpoints: (builder) => ({
    // Get all quotes with filters and pagination
    getQuotes: builder.query<QuotesResponse, QuotesFilters>({
      query: (filters = {}) => {
        const queryParams = new URLSearchParams();

        if (filters.customer_id) queryParams.append('customer_id', filters.customer_id);
        if (filters.status_filter) queryParams.append('status_filter', filters.status_filter);
        if (filters.date_from) queryParams.append('date_from', filters.date_from);
        if (filters.date_to) queryParams.append('date_to', filters.date_to);
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.page_size) queryParams.append('page_size', filters.page_size.toString());

        const queryString = queryParams.toString();
        return `/quotes/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: (result) =>
        result
          ? [...result.items.map(({ id }) => ({ type: 'Quote' as const, id })), { type: 'QuoteList', id: 'LIST' }]
          : [{ type: 'QuoteList', id: 'LIST' }]
    }),

    // Get single quote by ID
    getQuoteById: builder.query<QuoteDetail, string>({
      query: (id) => `/quotes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quote', id }]
    }),

    // Create new quote
    createQuote: builder.mutation<QuoteDetail, CreateQuoteRequest>({
      query: (quote) => ({
        url: '/quotes/',
        method: 'POST',
        body: quote
      }),
      invalidatesTags: [{ type: 'QuoteList', id: 'LIST' }]
    }),

    // Update quote (only draft status)
    updateQuote: builder.mutation<QuoteDetail, { id: string; quote: UpdateQuoteRequest }>({
      query: ({ id, quote }) => ({
        url: `/quotes/${id}`,
        method: 'PATCH',
        body: quote
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quote', id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    }),

    // Delete quote
    deleteQuote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quotes/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quote', id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    }),

    // ========================================================================
    // QUOTE ACTIONS
    // ========================================================================

    // Send quote
    sendQuote: builder.mutation<QuoteDetail, string>({
      query: (id) => ({
        url: `/quotes/${id}/send`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quote', id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    }),

    // Accept quote
    acceptQuote: builder.mutation<QuoteDetail, string>({
      query: (id) => ({
        url: `/quotes/${id}/accept`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quote', id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    }),

    // Reject quote
    rejectQuote: builder.mutation<QuoteDetail, string>({
      query: (id) => ({
        url: `/quotes/${id}/reject`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quote', id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    }),

    // Expire quote
    expireQuote: builder.mutation<QuoteDetail, string>({
      query: (id) => ({
        url: `/quotes/${id}/expire`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Quote', id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    }),

    // Clone quote
    cloneQuote: builder.mutation<QuoteDetail, string>({
      query: (id) => ({
        url: `/quotes/${id}/clone`,
        method: 'POST'
      }),
      invalidatesTags: [{ type: 'QuoteList', id: 'LIST' }]
    }),

    // Convert quote to invoice
    convertToInvoice: builder.mutation<any, { id: string; body: ConvertQuoteToInvoiceRequest }>({
      query: ({ id, body }) => ({
        url: `/quotes/${id}/convert-to-invoice`,
        method: 'POST',
        body
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Quote', id: arg.id },
        { type: 'QuoteList', id: 'LIST' }
      ]
    })
  })
});

export const {
  useGetQuotesQuery,
  useGetQuoteByIdQuery,
  useCreateQuoteMutation,
  useUpdateQuoteMutation,
  useDeleteQuoteMutation,
  useSendQuoteMutation,
  useAcceptQuoteMutation,
  useRejectQuoteMutation,
  useExpireQuoteMutation,
  useCloneQuoteMutation,
  useConvertToInvoiceMutation
} = quotesApi;
