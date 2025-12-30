import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  PaymentReceived,
  CreatePaymentReceivedRequest,
  UpdatePaymentReceivedRequest,
  PaymentReceivedFilters,
  PaymentReceivedStats,
  AllocatePaymentRequest
} from 'src/types/payment-received';
import { baseQueryWithReauth } from './baseQuery';

// ----------------------------------------------------------------------

export interface PaymentsReceivedResponse {
  payments: PaymentReceived[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface VoidPaymentRequest {
  reason: string;
}

export interface SendEmailRequest {
  email: string;
  subject?: string;
  message?: string;
}

// ----------------------------------------------------------------------

export const paymentsReceivedApi = createApi({
  reducerPath: 'paymentsReceivedApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['PaymentReceived', 'PaymentStats'],
  endpoints: (builder) => ({
    // 📋 GET /payments/ - Lista de pagos con filtros
    getPayments: builder.query<PaymentsReceivedResponse, PaymentReceivedFilters>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.customer_id) params.append('customer_id', filters.customer_id);
        if (filters.invoice_id) params.append('invoice_id', filters.invoice_id);
        if (filters.invoice_type) params.append('invoice_type', filters.invoice_type);
        if (filters.payment_method) params.append('payment_method', filters.payment_method);
        if (filters.start_date) params.append('start_date', filters.start_date.toISOString().split('T')[0]);
        if (filters.end_date) params.append('end_date', filters.end_date.toISOString().split('T')[0]);
        if (filters.min_amount !== undefined) params.append('min_amount', String(filters.min_amount));
        if (filters.max_amount !== undefined) params.append('max_amount', String(filters.max_amount));
        if (filters.include_voided !== undefined) params.append('include_voided', String(filters.include_voided));
        if (filters.page) params.append('page', String(filters.page));
        if (filters.size) params.append('size', String(filters.size));

        return `/payments/?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.payments.map(({ id }) => ({ type: 'PaymentReceived' as const, id })),
              { type: 'PaymentReceived', id: 'LIST' }
            ]
          : [{ type: 'PaymentReceived', id: 'LIST' }]
    }),

    // 🔍 GET /payments/{payment_id} - Detalle de un pago
    getPaymentById: builder.query<PaymentReceived, string>({
      query: (id) => `/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'PaymentReceived', id }]
    }),

    // ➕ POST /payments/ - Crear nuevo pago
    createPayment: builder.mutation<PaymentReceived, CreatePaymentReceivedRequest>({
      query: (body) => ({
        url: '/payments/',
        method: 'POST',
        body
      }),
      invalidatesTags: [
        { type: 'PaymentReceived', id: 'LIST' },
        { type: 'PaymentStats', id: 'SUMMARY' }
      ]
    }),

    // ✏️ PUT /payments/{payment_id} - Actualizar pago
    updatePayment: builder.mutation<PaymentReceived, { id: string; data: UpdatePaymentReceivedRequest }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentReceived', id },
        { type: 'PaymentReceived', id: 'LIST' }
      ]
    }),

    // ❌ POST /payments/{payment_id}/void - Anular pago
    voidPayment: builder.mutation<PaymentReceived, { id: string; data: VoidPaymentRequest }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}/void`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentReceived', id },
        { type: 'PaymentReceived', id: 'LIST' },
        { type: 'PaymentStats', id: 'SUMMARY' }
      ]
    }),

    // 🗑️ DELETE /payments/{payment_id} - Eliminar pago (hard delete)
    deletePayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'PaymentReceived', id: 'LIST' },
        { type: 'PaymentStats', id: 'SUMMARY' }
      ]
    }),

    // 📊 GET /payments/summary/stats - Estadísticas de pagos
    getPaymentStats: builder.query<
      PaymentReceivedStats,
      { start_date?: string; end_date?: string; customer_id?: string } | void
    >({
      query: (params) => {
        if (params) {
          const searchParams = new URLSearchParams();
          if (params.start_date) searchParams.append('start_date', params.start_date);
          if (params.end_date) searchParams.append('end_date', params.end_date);
          if (params.customer_id) searchParams.append('customer_id', params.customer_id);
          return `/payments/summary/stats?${searchParams.toString()}`;
        }
        return '/payments/summary/stats';
      },
      providesTags: [{ type: 'PaymentStats', id: 'SUMMARY' }]
    }),

    // 🔗 POST /payments/{payment_id}/allocate - Aplicar pago a múltiples facturas
    allocatePayment: builder.mutation<PaymentReceived, { id: string; data: AllocatePaymentRequest }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}/allocate`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentReceived', id },
        { type: 'PaymentReceived', id: 'LIST' },
        { type: 'PaymentStats', id: 'SUMMARY' }
      ]
    }),

    // 📧 POST /payments/{payment_id}/email - Enviar recibo por email
    // TODO: Backend aún no implementado
    sendPaymentEmail: builder.mutation<void, { id: string; data: SendEmailRequest }>({
      query: ({ id, data }) => ({
        url: `/payments/${id}/email`,
        method: 'POST',
        body: data
      })
    })
  })
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useVoidPaymentMutation,
  useDeletePaymentMutation,
  useGetPaymentStatsQuery,
  useAllocatePaymentMutation,
  useSendPaymentEmailMutation
} = paymentsReceivedApi;
