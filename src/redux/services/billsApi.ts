import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

// Types
export interface BillLineItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  line_taxes?: any;
  taxes_amount?: string;
  line_total?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export interface BillDetail {
  id: string;
  supplier_id: string;
  pdv_id: string;
  number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  notes?: string;
  status: 'draft' | 'open' | 'partial' | 'paid' | 'void';
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  line_items: BillLineItem[];
  supplier?: {
    id: string;
    name: string;
    email?: string;
    document_number?: string;
    phone?: string;
  };
  pdv?: {
    id: string;
    name: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  supplier_id: string;
  pdv_id: string;
  number: string;
  issue_date: string;
  due_date: string;
  currency: string;
  notes?: string;
  status: 'draft' | 'open' | 'partial' | 'paid' | 'void';
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BillsResponse {
  items: Bill[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateBillRequest {
  supplier_id: string;
  pdv_id: string;
  number?: string;
  issue_date: string;
  due_date: string;
  currency?: string;
  notes?: string;
  line_items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  status?: 'draft' | 'open';
}

export interface UpdateBillRequest {
  supplier_id?: string;
  pdv_id?: string;
  number?: string;
  issue_date?: string;
  due_date?: string;
  currency?: string;
  notes?: string;
  line_items?: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  status?: 'draft' | 'open';
}

export interface BillPayment {
  id: string;
  bill_id: string;
  amount: string;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface BillPaymentResponse {
  payments: BillPayment[];
  total: number;
}

export interface CreateBillPaymentRequest {
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'card' | 'check' | 'other';
  notes?: string;
}

export const billsApi = createApi({
  reducerPath: 'billsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Bill', 'BillPayment'],
  endpoints: (builder) => ({
    // Get all bills
    getBills: builder.query<Bill[], void>({
      query: () => '/bills/',
      transformResponse: (response: BillsResponse) => response.items || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Bill' as const, id })), { type: 'Bill', id: 'LIST' }]
          : [{ type: 'Bill', id: 'LIST' }]
    }),

    // Get single bill by ID
    getBillById: builder.query<BillDetail, string>({
      query: (id) => `/bills/${id}`,
      providesTags: (result, error, id) => [{ type: 'Bill', id }]
    }),

    // Create new bill
    createBill: builder.mutation<BillDetail, CreateBillRequest>({
      query: (bill) => ({
        url: '/bills/',
        method: 'POST',
        body: bill
      }),
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }]
    }),

    // Update bill (only draft status)
    updateBill: builder.mutation<BillDetail, { id: string; bill: UpdateBillRequest }>({
      query: ({ id, bill }) => ({
        url: `/bills/${id}`,
        method: 'PATCH',
        body: bill
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Bill', id },
        { type: 'Bill', id: 'LIST' }
      ]
    }),

    // Void bill
    voidBill: builder.mutation<BillDetail, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/bills/${id}/void`,
        method: 'POST',
        body: reason ? { reason } : undefined
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Bill', id },
        { type: 'Bill', id: 'LIST' }
      ]
    }),

    // Add payment to bill
    addBillPayment: builder.mutation<BillPayment, { billId: string; payment: CreateBillPaymentRequest }>({
      query: ({ billId, payment }) => ({
        url: `/bills/${billId}/payments`,
        method: 'POST',
        body: payment
      }),
      invalidatesTags: (result, error, { billId }) => [
        { type: 'Bill', id: billId },
        { type: 'BillPayment', id: billId },
        { type: 'Bill', id: 'LIST' }
      ]
    }),

    // Get bill payments
    getBillPayments: builder.query<BillPayment[], string>({
      query: (billId) => `/bills/${billId}/payments`,
      transformResponse: (response: BillPaymentResponse) => response.payments || [],
      providesTags: (result, error, billId) => [{ type: 'BillPayment', id: billId }]
    }),

    // Delete bill payment
    deleteBillPayment: builder.mutation<void, string>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, _paymentId) => [
        { type: 'BillPayment', id: 'LIST' },
        { type: 'Bill', id: 'LIST' }
      ]
    }),

    // Send bill email
    sendBillEmail: builder.mutation<
      void,
      { billId: string; to_email: string; subject: string; message: string; pdf_file?: Blob }
    >({
      query: ({ billId, ...emailData }) => {
        const formData = new FormData();
        formData.append('to_email', emailData.to_email);
        formData.append('subject', emailData.subject);
        formData.append('message', emailData.message);
        if (emailData.pdf_file) {
          formData.append('pdf_file', emailData.pdf_file);
        }

        return {
          url: `/bills/${billId}/send-email`,
          method: 'POST',
          body: formData
        };
      }
    })
  })
});

export const {
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useVoidBillMutation,
  useAddBillPaymentMutation,
  useGetBillPaymentsQuery,
  useDeleteBillPaymentMutation,
  useSendBillEmailMutation
} = billsApi;
