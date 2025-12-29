import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

// ============================================================================
// PURCHASE ORDERS TYPES
// ============================================================================

export interface PurchaseOrderItem {
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

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  pdv_id: string;
  issue_date: string;
  status: 'draft' | 'sent' | 'approved' | 'closed' | 'void';
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  items: PurchaseOrderItem[];
  supplier?: {
    id: string;
    name: string;
    email?: string;
  };
  pdv?: {
    id: string;
    name: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  notes?: string;
}

export interface CreatePurchaseOrderRequest {
  supplier_id: string;
  pdv_id: string;
  issue_date: string;
  notes?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
}

export interface UpdatePurchaseOrderRequest {
  supplier_id?: string;
  pdv_id?: string;
  issue_date?: string;
  notes?: string;
  items?: {
    product_id: string;
    quantity: number;
    unit_price: number;
  }[];
  status?: 'draft' | 'sent' | 'approved';
}

export interface ConvertPOToBillRequest {
  bill_number: string;
  issue_date: string;
  due_date?: string;
  status?: 'draft' | 'open';
  notes?: string;
}

export interface PurchaseOrdersResponse {
  items: PurchaseOrder[];
  total: number;
  limit: number;
  offset: number;
}

// ============================================================================
// BILLS TYPES
// ============================================================================

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

export interface BillsFilters {
  supplier_id?: string;
  pdv_id?: string;
  status?: 'draft' | 'open' | 'partial' | 'paid' | 'void';
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// BILL PAYMENTS TYPES
// ============================================================================

export interface BillPayment {
  id: string;
  bill_id: string;
  amount: string;
  payment_date: string;
  method: 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';
  reference?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface BillPaymentResponse {
  payments: BillPayment[];
  total: number;
}

export interface CreateBillPaymentRequest {
  amount: number;
  payment_date: string;
  method: 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER';
  reference?: string;
  notes?: string;
}

// ============================================================================
// DEBIT NOTES TYPES
// ============================================================================

export interface DebitNoteItem {
  id?: string;
  product_id?: string;
  name: string;
  quantity?: number;
  unit_price: string;
  reason_type: 'price_adjustment' | 'quantity_adjustment' | 'service';
  line_total?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
  };
}

export interface DebitNote {
  id: string;
  bill_id?: string;
  supplier_id: string;
  issue_date: string;
  status: 'open' | 'void';
  total_amount: string;
  notes?: string;
  items: DebitNoteItem[];
  supplier?: {
    id: string;
    name: string;
  };
  bill?: {
    id: string;
    number: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDebitNoteRequest {
  bill_id?: string;
  supplier_id: string;
  issue_date: string;
  notes?: string;
  items: {
    product_id?: string;
    name: string;
    quantity?: number;
    unit_price: number;
    reason_type: 'price_adjustment' | 'quantity_adjustment' | 'service';
  }[];
}

export interface DebitNotesResponse {
  items: DebitNote[];
  total: number;
  limit: number;
  offset: number;
}

export interface DebitNotesFilters {
  bill_id?: string;
  supplier_id?: string;
  status?: 'open' | 'void';
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// MONTHLY SUMMARY TYPES
// ============================================================================

export interface BillStatusCount {
  status: string;
  count: number;
}

export interface BillStatusData {
  count: number;
  total: string;
  recaudado: string;
}

export interface BillsMonthlyStatusResponse {
  year: number;
  month: number;
  total: BillStatusData;
  open: BillStatusData;
  paid: BillStatusData;
  partial: BillStatusData;
  void: BillStatusData;
  draft: BillStatusData;
  counts_by_status: BillStatusCount[];
  applied_filters?: any;
}

export const billsApi = createApi({
  reducerPath: 'billsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Bill', 'BillPayment', 'PurchaseOrder', 'DebitNote', 'Product', 'ProductList'],
  endpoints: (builder) => ({
    // ========================================================================
    // PURCHASE ORDERS ENDPOINTS
    // ========================================================================

    // Get all purchase orders
    getPurchaseOrders: builder.query<PurchaseOrder[], { limit?: number; offset?: number; status?: string }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        if (params.status) queryParams.append('status', params.status);
        const queryString = queryParams.toString();
        return `/bills/purchase-orders/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: PurchaseOrdersResponse) => response.items || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'PurchaseOrder' as const, id })), { type: 'PurchaseOrder', id: 'LIST' }]
          : [{ type: 'PurchaseOrder', id: 'LIST' }]
    }),

    // Get single purchase order by ID
    getPurchaseOrderById: builder.query<PurchaseOrderDetail, string>({
      query: (id) => `/bills/purchase-orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'PurchaseOrder', id }]
    }),

    // Create new purchase order
    createPurchaseOrder: builder.mutation<PurchaseOrderDetail, CreatePurchaseOrderRequest>({
      query: (po) => ({
        url: '/bills/purchase-orders/',
        method: 'POST',
        body: po
      }),
      invalidatesTags: [{ type: 'PurchaseOrder', id: 'LIST' }]
    }),

    // Update purchase order (only draft status)
    updatePurchaseOrder: builder.mutation<PurchaseOrderDetail, { id: string; po: UpdatePurchaseOrderRequest }>({
      query: ({ id, po }) => ({
        url: `/bills/purchase-orders/${id}`,
        method: 'PATCH',
        body: po
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' }
      ]
    }),

    // Convert PO to Bill
    convertPOToBill: builder.mutation<BillDetail, { id: string; data: ConvertPOToBillRequest }>({
      query: ({ id, data }) => ({
        url: `/bills/purchase-orders/${id}/convert-to-bill`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' },
        { type: 'Bill', id: 'LIST' }
      ]
    }),

    // Void purchase order
    voidPurchaseOrder: builder.mutation<PurchaseOrderDetail, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/bills/purchase-orders/${id}/void`,
        method: 'POST',
        body: reason ? { reason } : undefined
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        { type: 'PurchaseOrder', id: 'LIST' }
      ]
    }),

    // ========================================================================
    // BILLS ENDPOINTS
    // ========================================================================

    // Get all bills with filters
    getBills: builder.query<Bill[], BillsFilters>({
      query: (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.supplier_id) queryParams.append('supplier_id', filters.supplier_id);
        if (filters.pdv_id) queryParams.append('pdv_id', filters.pdv_id);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.date_from) queryParams.append('date_from', filters.date_from);
        if (filters.date_to) queryParams.append('date_to', filters.date_to);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());
        const queryString = queryParams.toString();
        return `/bills/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: BillsResponse) => response.items || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Bill' as const, id })), { type: 'Bill', id: 'LIST' }]
          : [{ type: 'Bill', id: 'LIST' }]
    }),

    // Get single bill by ID
    getBillById: builder.query<BillDetail, string>({
      query: (id) => `/bills/${id}`,
      providesTags: (result, error, id) => [
        { type: 'Bill', id },
        { type: 'BillPayment', id }
      ]
    }),

    // Create new bill
    createBill: builder.mutation<BillDetail, CreateBillRequest>({
      query: (bill) => ({
        url: '/bills/',
        method: 'POST',
        body: bill
      }),
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }, 'Product', 'ProductList']
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
        { type: 'Bill', id: 'LIST' },
        'Product',
        'ProductList'
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

    // Get bills monthly summary
    getBillsMonthlyStatus: builder.query<BillsMonthlyStatusResponse, { year: number; month: number }>({
      query: ({ year, month }) => `/bills/monthly-summary/${year}/${month}`,
      providesTags: ['Bill']
    }),

    // ========================================================================
    // BILL PAYMENTS ENDPOINTS
    // ========================================================================

    // Add payment to bill
    addBillPayment: builder.mutation<BillPayment, { billId: string; payment: CreateBillPaymentRequest }>({
      query: ({ billId, payment }) => ({
        url: `/bills/${billId}/payments`,
        method: 'POST',
        body: payment
      }),
      invalidatesTags: (result, error, { billId }) => [
        { type: 'Bill', id: billId },
        { type: 'Bill', id: 'LIST' },
        { type: 'BillPayment', id: billId },
        { type: 'BillPayment', id: 'LIST' }
      ]
    }),

    // Get bill payments (payments for a specific bill)
    getBillPayments: builder.query<BillPayment[], string>({
      query: (billId) => `/bills/${billId}/payments`,
      transformResponse: (response: any) => {
        // Backend returns array directly
        if (Array.isArray(response)) return response;
        // Or it might return an object with data/payments property
        return response.data || response.payments || [];
      },
      providesTags: (result, error, billId) => [{ type: 'BillPayment', id: billId }]
    }),

    // List all bill payments (all payments across all bills)
    listAllBillPayments: builder.query<BillPayment[], { bill_id?: string; limit?: number; offset?: number }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.bill_id) queryParams.append('bill_id', params.bill_id);
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return `/bills/bill-payments/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        return response.data || response.payments || response.items || [];
      },
      providesTags: [{ type: 'BillPayment', id: 'LIST' }]
    }),

    // Delete bill payment
    deleteBillPayment: builder.mutation<void, string>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'BillPayment', id: 'LIST' },
        { type: 'Bill', id: 'LIST' }
      ]
    }),

    // ========================================================================
    // DEBIT NOTES ENDPOINTS
    // ========================================================================

    // Get all debit notes with filters
    getDebitNotes: builder.query<DebitNote[], DebitNotesFilters>({
      query: (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.bill_id) queryParams.append('bill_id', filters.bill_id);
        if (filters.supplier_id) queryParams.append('supplier_id', filters.supplier_id);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.date_from) queryParams.append('date_from', filters.date_from);
        if (filters.date_to) queryParams.append('date_to', filters.date_to);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.offset) queryParams.append('offset', filters.offset.toString());
        const queryString = queryParams.toString();
        return `/bills/debit-notes/${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: DebitNotesResponse) => response.items || [],
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'DebitNote' as const, id })), { type: 'DebitNote', id: 'LIST' }]
          : [{ type: 'DebitNote', id: 'LIST' }]
    }),

    // Get single debit note by ID
    getDebitNoteById: builder.query<DebitNote, string>({
      query: (id) => `/bills/debit-notes/${id}`,
      providesTags: (result, error, id) => [{ type: 'DebitNote', id }]
    }),

    // Create new debit note
    createDebitNote: builder.mutation<DebitNote, CreateDebitNoteRequest>({
      query: (debitNote) => ({
        url: '/bills/debit-notes/',
        method: 'POST',
        body: debitNote
      }),
      invalidatesTags: (result) => {
        const tags: any[] = [{ type: 'DebitNote', id: 'LIST' }];
        // Si está asociada a una bill, invalidar también la bill
        if (result?.bill_id) {
          tags.push({ type: 'Bill', id: result.bill_id });
        }
        return tags;
      }
    }),

    // Void debit note
    voidDebitNote: builder.mutation<DebitNote, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/bills/debit-notes/${id}/void`,
        method: 'POST',
        body: reason ? { reason } : undefined
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DebitNote', id },
        { type: 'DebitNote', id: 'LIST' }
      ]
    }),

    // ========================================================================
    // OTHER ENDPOINTS
    // ========================================================================

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
  // Purchase Orders hooks
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useConvertPOToBillMutation,
  useVoidPurchaseOrderMutation,
  // Bills hooks
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useVoidBillMutation,
  useGetBillsMonthlyStatusQuery,
  // Bill Payments hooks
  useAddBillPaymentMutation,
  useGetBillPaymentsQuery,
  useListAllBillPaymentsQuery,
  useDeleteBillPaymentMutation,
  // Debit Notes hooks
  useGetDebitNotesQuery,
  useGetDebitNoteByIdQuery,
  useCreateDebitNoteMutation,
  useVoidDebitNoteMutation,
  // Other hooks
  useSendBillEmailMutation
} = billsApi;
