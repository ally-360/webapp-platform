import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// Interfaces
export interface SalesInvoice {
  id: string;
  pdv_id: string;
  customer_id: string;
  number: string;
  type: 'SALE';
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID';
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

export interface SalesInvoiceDetail extends SalesInvoice {
  customer: {
    id: string;
    name: string;
    email: string;
    id_type: string;
    id_number: string;
    dv: string;
    payment_terms_days: number;
    billing_address: Record<string, any>;
  };
  line_items: {
    id: string;
    product_id: string;
    name: string;
    sku: string;
    quantity: string;
    unit_price: string;
    line_subtotal: string;
    line_taxes: Record<string, any>[];
    line_total: string;
  }[];
  payments: any[];
}

export interface SalesInvoicesResponse {
  invoices: SalesInvoice[];
  total: number;
  limit: number;
  offset: number;
  applied_filters: {
    status: string | null;
    customer_id: string | null;
    pdv_id: string | null;
    date_from: string | null;
    date_to: string | null;
    search: string | null;
  };
  counts_by_status: {
    status: string;
    count: number;
  }[];
}

export interface CreateSalesInvoiceRequest {
  pdv_id: string;
  customer_id: string;
  type: 'sale';
  status?: 'DRAFT' | 'OPEN';
  issue_date: string;
  due_date: string;
  notes?: string;
  currency: string;
  items: {
    product_id: string;
    name: string;
    sku: string;
    quantity: string;
    unit_price: string;
  }[];
}

export interface UpdateSalesInvoiceRequest extends Partial<CreateSalesInvoiceRequest> {
  id: string;
}

export interface InvoicePayment {
  amount: string;
  method: string;
  reference?: string;
  payment_date: string;
  notes?: string;
}

export interface InvoicePaymentResponse {
  id: string;
  invoice_id: string;
  amount: string;
  method: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  reference?: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export interface InvoiceEmailRequest {
  to_email: string;
  subject?: string;
  message?: string;
}

// API
export const salesInvoicesApi = createApi({
  reducerPath: 'salesInvoicesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SalesInvoice', 'InvoicePayment'],
  endpoints: (builder) => ({
    // Get all sales invoices
    getSalesInvoices: builder.query<
      SalesInvoicesResponse,
      {
        page?: number;
        limit?: number;
        status?: string;
        customer_id?: string;
        pdv_id?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
      }
    >({
      query: (params = {}) => {
        console.log('🔍 getSalesInvoices called with params:', params);

        const queryParams = {
          type: 'sale',
          offset: params.page ? (params.page - 1) * (params.limit || 25) : 0,
          limit: params.limit || 25,
          ...params
        };

        console.log('🔍 Final query params:', queryParams);

        return {
          url: '',
          params: queryParams
        };
      },
      transformResponse: (response: SalesInvoicesResponse) => {
        console.log('✅ getSalesInvoices response:', response);
        return response;
      },
      transformErrorResponse: (response: any, meta, arg) => {
        console.warn('❌ getSalesInvoices error:', { response, meta, arg });
        return response;
      },
      providesTags: ['SalesInvoice']
    }),

    // Get single sales invoice
    getSalesInvoiceById: builder.query<SalesInvoiceDetail, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'SalesInvoice', id }]
    }),

    // Create sales invoice
    createSalesInvoice: builder.mutation<SalesInvoiceDetail, CreateSalesInvoiceRequest>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['SalesInvoice']
    }),

    // Update sales invoice
    updateSalesInvoice: builder.mutation<SalesInvoiceDetail, UpdateSalesInvoiceRequest>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => ['SalesInvoice', { type: 'SalesInvoice', id }]
    }),

    // Delete sales invoice
    deleteSalesInvoice: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['SalesInvoice']
    }),

    // Confirm invoice (draft -> open)
    confirmSalesInvoice: builder.mutation<SalesInvoiceDetail, string>({
      query: (id) => ({
        url: `/${id}/confirm`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => ['SalesInvoice', { type: 'SalesInvoice', id }]
    }),

    // Cancel invoice
    cancelSalesInvoice: builder.mutation<SalesInvoiceDetail, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/${id}/cancel`,
        method: 'POST',
        body: reason ? { reason } : undefined
      }),
      invalidatesTags: (result, error, { id }) => ['SalesInvoice', { type: 'SalesInvoice', id }]
    }),

    // Add payment to invoice
    addInvoicePayment: builder.mutation<InvoicePaymentResponse, { invoiceId: string; payment: InvoicePayment }>({
      query: ({ invoiceId, payment }) => ({
        url: `/${invoiceId}/payments`,
        method: 'POST',
        body: payment
      }),
      invalidatesTags: (result, error, { invoiceId }) => ['InvoicePayment', { type: 'SalesInvoice', id: invoiceId }]
    }),

    // Get invoice payments
    getInvoicePayments: builder.query<InvoicePaymentResponse[], string>({
      query: (invoiceId) => `/${invoiceId}/payments`,
      providesTags: (result, error, invoiceId) => [{ type: 'InvoicePayment', id: invoiceId }]
    }),

    // Download invoice PDF
    downloadInvoicePdf: builder.mutation<Blob, string>({
      query: (id) => ({
        url: `/${id}/pdf`,
        method: 'GET',
        responseHandler: (response) => response.blob()
      })
    }),

    // Send invoice email
    sendInvoiceEmail: builder.mutation<void, { invoiceId: string; emailData: InvoiceEmailRequest }>({
      query: ({ invoiceId, emailData }) => ({
        url: `/${invoiceId}/send-email`,
        method: 'POST',
        body: emailData
      })
    }),

    // Get invoices summary report
    getInvoicesSummary: builder.query<
      any,
      {
        start_date?: string;
        end_date?: string;
        pdv_id?: string;
      }
    >({
      query: (params) => ({
        url: '/reports/summary',
        params
      })
    }),

    // Get next invoice number
    getNextInvoiceNumber: builder.query<{ next_number: string }, string>({
      query: (pdvId) => `/next-number/${pdvId}`
    }),

    // Get monthly status report
    getMonthlyStatusReport: builder.query<
      {
        year: number;
        month: number;
        total: { count: number; recaudado: string };
        open: { count: number; recaudado: string };
        paid: { count: number; recaudado: string };
        void: { count: number; recaudado: string };
      },
      { year?: number; month?: number }
    >({
      query: (params = {}) => {
        const currentDate = new Date();
        const year = params.year || currentDate.getFullYear();
        const month = params.month || currentDate.getMonth() + 1;

        return {
          url: `/reports/monthly-status`,
          params: { year, month }
        };
      },
      providesTags: ['SalesInvoice']
    })
  })
});

export const {
  useGetSalesInvoicesQuery,
  useGetSalesInvoiceByIdQuery,
  useCreateSalesInvoiceMutation,
  useUpdateSalesInvoiceMutation,
  useDeleteSalesInvoiceMutation,
  useConfirmSalesInvoiceMutation,
  useCancelSalesInvoiceMutation,
  useAddInvoicePaymentMutation,
  useGetInvoicePaymentsQuery,
  useDownloadInvoicePdfMutation,
  useSendInvoiceEmailMutation,
  useGetInvoicesSummaryQuery,
  useGetNextInvoiceNumberQuery,
  useGetMonthlyStatusReportQuery
} = salesInvoicesApi;
