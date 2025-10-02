import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

// Types
export interface InvoiceItem {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CreateInvoiceRequest {
  pdv_id: string;
  customer_id: string;
  issue_date: string;
  due_date: string;
  notes: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
}

export interface Invoice {
  id: string;
  pdv_id: string;
  customer_id: string;
  number: string;
  type: 'sale' | 'purchase';
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  notes: string;
  currency: string;
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  created_at: string;
  updated_at: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
  limit: number;
  offset: number;
}

export interface InvoicePayment {
  id: string;
  invoice_id: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export interface CreatePaymentRequest {
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
}

export interface InvoicesSummary {
  total_invoices: number;
  total_amount: string;
  paid_amount: string;
  pending_amount: string;
  overdue_amount: string;
}

export interface GetInvoicesRequest {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  customer_id?: string;
  pdv_id?: string;
}

export const invoicesApi = createApi({
  reducerPath: 'invoicesApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Invoice', 'InvoicePayment', 'InvoiceSummary'],
  endpoints: (builder) => ({
    // Get all invoices with optional filters
    getInvoices: builder.query<Invoice[], GetInvoicesRequest>({
      query: (params = {}) => ({
        url: '/invoices',
        params: {
          page: params.page || 1,
          limit: params.limit || 25,
          ...params
        }
      }),
      transformResponse: (response: any) => {
        if (response?.invoices) return response.invoices;
        if (response?.data) return response.data;
        return response;
      },
      providesTags: ['Invoice']
    }),

    // Get single invoice by ID
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }]
    }),

    // Create new invoice
    createInvoice: builder.mutation<Invoice, CreateInvoiceRequest>({
      query: (invoice) => ({
        url: '/invoices',
        method: 'POST',
        body: invoice
      }),
      invalidatesTags: ['Invoice', 'InvoiceSummary']
    }),

    // Update existing invoice
    updateInvoice: builder.mutation<Invoice, { id: string; invoice: Partial<CreateInvoiceRequest> }>({
      query: ({ id, invoice }) => ({
        url: `/invoices/${id}`,
        method: 'PUT',
        body: invoice
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Invoice', id }, 'Invoice', 'InvoiceSummary']
    }),

    // Delete invoice
    deleteInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Invoice', 'InvoiceSummary']
    }),

    // Confirm invoice
    confirmInvoice: builder.mutation<Invoice, string>({
      query: (id) => ({
        url: `/invoices/${id}/confirm`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Invoice', id }, 'Invoice', 'InvoiceSummary']
    }),

    // Cancel invoice
    cancelInvoice: builder.mutation<Invoice, string>({
      query: (id) => ({
        url: `/invoices/${id}/cancel`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Invoice', id }, 'Invoice', 'InvoiceSummary']
    }),

    // Add payment to invoice
    addInvoicePayment: builder.mutation<InvoicePayment, { invoiceId: string; payment: CreatePaymentRequest }>({
      query: ({ invoiceId, payment }) => ({
        url: `/invoices/${invoiceId}/payments`,
        method: 'POST',
        body: payment
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'Invoice', id: invoiceId },
        'InvoicePayment',
        'InvoiceSummary'
      ]
    }),

    // Get invoice payments
    getInvoicePayments: builder.query<InvoicePayment[], string>({
      query: (invoiceId) => `/invoices/${invoiceId}/payments`,
      providesTags: (result, error, invoiceId) => [{ type: 'InvoicePayment', id: invoiceId }]
    }),

    // Download invoice PDF
    downloadInvoicePdf: builder.mutation<Blob, string>({
      query: (invoiceId) => ({
        url: `/invoices/${invoiceId}/pdf`,
        method: 'GET',
        responseHandler: (response) => response.blob()
      })
    }),

    // Send invoice email
    sendInvoiceEmail: builder.mutation<void, { invoiceId: string; email: string; subject?: string; message?: string }>({
      query: ({ invoiceId, ...emailData }) => ({
        url: `/invoices/${invoiceId}/send-email`,
        method: 'POST',
        body: emailData
      })
    }),

    // Get invoices summary
    getInvoicesSummary: builder.query<InvoicesSummary, { pdv_id?: string; date_from?: string; date_to?: string }>({
      query: (params = {}) => ({
        url: '/invoices/reports/summary',
        params
      }),
      providesTags: ['InvoiceSummary']
    }),

    // Get next invoice number for PDV
    getNextInvoiceNumber: builder.query<{ number: string }, string>({
      query: (pdvId) => `/invoices/next-number/${pdvId}`
    })
  })
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useConfirmInvoiceMutation,
  useCancelInvoiceMutation,
  useAddInvoicePaymentMutation,
  useGetInvoicePaymentsQuery,
  useDownloadInvoicePdfMutation,
  useSendInvoiceEmailMutation,
  useGetInvoicesSummaryQuery,
  useGetNextInvoiceNumberQuery
} = invoicesApi;
