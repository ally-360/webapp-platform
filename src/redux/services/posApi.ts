// ========================================
// 🏪 POS API SERVICE - RTK Query
// ========================================

import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CashRegister,
  CashRegisterOpen,
  CashRegisterClose,
  CashMovement,
  CashMovementCreate,
  CashMovementsParams,
  Seller,
  SellerCreate,
  SellerUpdate,
  SellersResponse,
  POSInvoice,
  POSInvoiceCreate,
  POSSalesParams,
  ShiftHistory,
  ShiftHistoryParams,
  ShiftDetail,
  DailyReport,
  ShiftStatusResponse,
  DailyClosingReport,
  ShiftSalesParams,
  PaginatedResponse,
  SaleDraftCreate,
  SaleDraftUpdate,
  SaleDraftResponse,
  SaleDraftListResponse,
  SaleDraftsParams,
  SaleDraftCompleteRequest
} from 'src/types/pos';
import { baseQueryWithReauth } from './baseQuery';

export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CashRegister', 'CashMovement', 'Seller', 'POSSale', 'Shift', 'Product', 'ProductList', 'SaleDraft'],
  endpoints: (builder) => ({
    // ========================================
    // 🏦 CASH REGISTER ENDPOINTS
    // ========================================

    /**
     * Abrir caja registradora
     * POST /cash-registers/open?pdv_id={pdv_id}
     */
    openCashRegister: builder.mutation<CashRegister, { pdv_id: string; data: CashRegisterOpen }>({
      query: ({ pdv_id, data }) => ({
        url: '/cash-registers/open',
        method: 'POST',
        params: { pdv_id },
        body: data
      }),
      invalidatesTags: ['CashRegister', 'Shift']
    }),

    /**
     * Cerrar caja registradora
     * POST /cash-registers/{id}/close
     */
    closeCashRegister: builder.mutation<CashRegister, { id: string; data: CashRegisterClose }>({
      query: ({ id, data }) => ({
        url: `/cash-registers/${id}/close`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['CashRegister', 'Shift']
    }),

    /**
     * Listar cajas registradoras
     * GET /cash-registers
     */
    getCashRegisters: builder.query<PaginatedResponse<CashRegister>, { page?: number; size?: number }>({
      query: ({ page = 1, size = 20 } = {}) => ({
        url: '/cash-registers',
        params: { page, size }
      }),
      providesTags: ['CashRegister']
    }),

    /**
     * Obtener detalle de caja registradora
     * GET /cash-registers/{id}
     */
    getCashRegister: builder.query<CashRegister, string>({
      query: (id) => `/cash-registers/${id}`,
      providesTags: (result, error, id) => [{ type: 'CashRegister', id }]
    }),

    /**
     * ✅ Obtener caja abierta actual para un PDV
     * GET /cash-registers/current?pdv_id={pdv_id}
     * Devuelve 404 si no hay caja abierta
     */
    getCurrentCashRegister: builder.query<CashRegister, string>({
      query: (pdv_id) => ({
        url: '/cash-registers/current',
        params: { pdv_id }
      }),
      providesTags: ['CashRegister']
    }),

    /**
     * Obtener resumen de cierre de caja
     * GET /cash-registers/{register_id}/closing-summary
     */
    getClosingSummary: builder.query<
      {
        register_id: string;
        pdv_id: string;
        pdv_name: string;
        opened_at: string;
        opened_by_name: string;
        opening_balance: string;
        total_sales: string;
        total_deposits: string;
        total_withdrawals: string;
        total_expenses: string;
        total_adjustments: string;
        expected_balance: string;
        payment_methods_breakdown: Record<string, string>;
        total_transactions: number;
        total_invoices: number;
        movements_by_type: Record<string, any[]>;
      },
      string
    >({
      query: (register_id) => `/cash-registers/${register_id}/closing-summary`,
      providesTags: (result, error, id) => [{ type: 'CashRegister', id }]
    }),

    // ========================================
    // 💰 CASH MOVEMENTS ENDPOINTS
    // ========================================

    /**
     * Crear movimiento de caja
     * POST /cash-movements
     */
    createCashMovement: builder.mutation<CashMovement, CashMovementCreate>({
      query: (data) => ({
        url: '/cash-movements',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['CashMovement', 'CashRegister']
    }),

    /**
     * Listar movimientos de caja
     * GET /cash-movements
     */
    getCashMovements: builder.query<PaginatedResponse<CashMovement>, CashMovementsParams>({
      query: (params) => ({
        url: '/cash-movements',
        params
      }),
      providesTags: ['CashMovement']
    }),

    // ========================================
    // 👥 SELLERS ENDPOINTS
    // ========================================

    /**
     * Crear vendedor
     * POST /sellers
     */
    createSeller: builder.mutation<Seller, SellerCreate>({
      query: (data) => ({
        url: '/sellers',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Seller']
    }),

    /**
     * Listar vendedores
     * GET /sellers
     */
    getSellers: builder.query<SellersResponse, { page?: number; size?: number; active_only?: boolean }>({
      query: ({ page = 1, size = 100, active_only = true } = {}) => ({
        url: '/sellers',
        params: {
          limit: size,
          offset: (page - 1) * size,
          active_only
        }
      }),
      providesTags: ['Seller']
    }),

    /**
     * Actualizar vendedor
     * PATCH /sellers/{id}
     */
    updateSeller: builder.mutation<Seller, { id: string; data: SellerUpdate }>({
      query: ({ id, data }) => ({
        url: `/sellers/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Seller', id }, 'Seller']
    }),

    /**
     * Desactivar vendedor
     * DELETE /sellers/{id}
     */
    deactivateSeller: builder.mutation<void, string>({
      query: (id) => ({
        url: `/sellers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Seller', id }, 'Seller']
    }),

    // ========================================
    // 🛒 POS SALES ENDPOINTS
    // ========================================

    /**
     * Crear venta POS
     * POST /pos/sales
     */
    createPOSSale: builder.mutation<POSInvoice, POSInvoiceCreate & { pdv_id: string }>({
      query: ({ pdv_id, ...data }) => ({
        url: '/pos/sales',
        method: 'POST',
        params: { pdv_id },
        body: data
      }),
      invalidatesTags: ['POSSale', 'CashMovement', 'CashRegister', 'Product', 'ProductList']
    }),

    /**
     * Listar ventas POS
     * GET /pos/sales/
     */
    getPOSSales: builder.query<PaginatedResponse<POSInvoice>, POSSalesParams>({
      query: (params) => ({
        url: '/pos/sales/',
        params
      }),
      transformResponse: (response: POSInvoice[] | PaginatedResponse<POSInvoice>) => {
        // Backend returns array directly, not paginated response
        if (Array.isArray(response)) {
          return {
            items: response,
            total: response.length,
            page: 1,
            size: response.length,
            pages: 1
          };
        }
        return response;
      },
      providesTags: ['POSSale']
    }),

    /**
     * Obtener detalle de venta POS
     * GET /pos/sales/{id}
     */
    getPOSSale: builder.query<
      {
        id: string;
        invoice_number: string;
        number: string;
        issue_date: string;
        created_at: string;
        customer_id: string;
        customer_name: string;
        customer_dni?: string;
        items_count: number;
        line_items: Array<{
          product_name: string;
          sku: string;
          quantity: number;
          unit_price: number;
          subtotal: number;
          tax: number;
        }>;
        subtotal: number;
        tax: number;
        discount: number;
        total: number;
        payments: Array<{
          method: string;
          amount: number;
          reference?: string;
        }>;
        total_paid: number;
        payment_status: 'paid' | 'pending' | 'partial' | 'cancelled';
        seller_id: string;
        seller_name: string;
        pos_type: string;
        pdv_id: string;
        pdv_name: string;
        status: 'PAID' | 'CANCELLED' | 'REFUNDED' | 'PENDING';
        notes?: string;
      },
      string
    >({
      query: (id) => `/pos/sales/${id}`,
      providesTags: (result, error, id) => [{ type: 'POSSale', id }]
    }),

    /**
     * Cancelar venta POS
     * POST /pos/sales/{id}/cancel
     */
    cancelPOSSale: builder.mutation<POSInvoice, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/pos/sales/${id}/cancel`,
        method: 'POST',
        body: { reason }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'POSSale', id }, 'POSSale']
    }),

    /**
     * Crear nota de crédito
     * POST /pos/sales/{id}/credit-note
     */
    createCreditNote: builder.mutation<
      POSInvoice,
      {
        id: string;
        items: Array<{ product_id: string; quantity: number }>;
        reason: string;
      }
    >({
      query: ({ id, items, reason }) => ({
        url: `/pos/sales/${id}/credit-note`,
        method: 'POST',
        body: { items, reason }
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'POSSale', id }, 'POSSale']
    }),

    /**
     * Descargar PDF de venta
     * GET /pos/sales/{id}/receipt
     */
    downloadSaleReceipt: builder.query<Blob, string>({
      query: (id) => ({
        url: `/pos/sales/${id}/receipt`,
        responseHandler: (response) => response.blob()
      })
    }),

    // ========================================
    // 🕐 SHIFT ENDPOINTS
    // ========================================

    /**
     * Obtener historial de turnos con filtros y paginación
     * GET /cash-registers/shifts/history
     */
    getShiftHistory: builder.query<PaginatedResponse<ShiftHistory>, ShiftHistoryParams>({
      query: (params) => ({
        url: '/cash-registers/shifts/history',
        params
      }),
      providesTags: ['Shift']
    }),

    /**
     * Obtener detalle completo de un turno específico
     * GET /cash-registers/shifts/{register_id}/detail
     */
    getShiftDetail: builder.query<ShiftDetail, string>({
      query: (register_id) => `/cash-registers/shifts/${register_id}/detail`,
      providesTags: (result, error, id) => [{ type: 'Shift', id }]
    }),

    // ========================================
    // 📊 REPORTS ENDPOINTS
    // ========================================

    /**
     * ✅ Estado en tiempo real del turno actual abierto
     * GET /cash-registers/shift/status?pdv_id={pdv_id}
     */
    getShiftStatus: builder.query<ShiftStatusResponse, { pdv_id: string }>({
      query: (params) => ({
        url: '/cash-registers/shift/status',
        params
      }),
      providesTags: ['Shift', 'CashRegister', 'POSSale']
    }),

    /**
     * ✅ Reporte diario/cierre de caja completo
     * GET /cash-registers/shift/daily-report?register_id={register_id}
     */
    getDailyClosingReport: builder.query<DailyClosingReport, { register_id: string }>({
      query: (params) => ({
        url: '/cash-registers/shift/daily-report',
        params
      }),
      providesTags: ['Shift', 'CashRegister']
    }),

    /**
     * ✅ Ventas del turno actual abierto
     * GET /pos/sales/shift/sales
     */
    getShiftSales: builder.query<PaginatedResponse<POSInvoice>, ShiftSalesParams>({
      query: (params) => ({
        url: '/pos/sales/shift/sales',
        params
      }),
      providesTags: ['POSSale', 'Shift']
    }),

    /**
     * Obtener reporte diario
     * GET /pos/reports/daily
     */
    getDailyReport: builder.query<DailyReport, { date?: string }>({
      query: ({ date = new Date().toISOString().split('T')[0] } = {}) => ({
        url: '/pos/reports/daily',
        params: { date }
      }),
      providesTags: ['Shift', 'CashRegister']
    }),

    /**
     * Descargar reporte de turno
     * GET /pos/shift/{id}/report
     */
    downloadShiftReport: builder.query<Blob, string>({
      query: (id) => ({
        url: `/pos/shift/${id}/report`,
        responseHandler: (response) => response.blob()
      })
    }),

    // ========================================
    // 🔍 STATUS ENDPOINTS
    // ========================================

    /**
     * Obtener estado actual del registro POS
     * GET /pos/register/status
     */
    getRegisterStatus: builder.query<
      {
        hasOpenRegister: boolean;
        currentRegister?: CashRegister;
      },
      void
    >({
      query: () => '/pos/sales',
      providesTags: ['CashRegister', 'Shift']
    }),

    // ========================================
    // 📋 SALE DRAFTS ENDPOINTS
    // ========================================

    /**
     * Crear nuevo borrador de venta
     * POST /pos/drafts
     *
     * Auto-merge: Si ya existe un borrador activo con el mismo window_id,
     * se actualizará en lugar de crear uno nuevo.
     */
    createSaleDraft: builder.mutation<SaleDraftResponse, SaleDraftCreate>({
      query: (data) => ({
        url: '/pos/drafts',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['SaleDraft']
    }),

    /**
     * Listar borradores de venta
     * GET /pos/drafts
     */
    getSaleDrafts: builder.query<SaleDraftListResponse, SaleDraftsParams>({
      query: (params) => ({
        url: '/pos/drafts',
        params
      }),
      providesTags: (result) =>
        result
          ? [...result.items.map(({ id }) => ({ type: 'SaleDraft' as const, id })), { type: 'SaleDraft', id: 'LIST' }]
          : [{ type: 'SaleDraft', id: 'LIST' }]
    }),

    /**
     * Obtener borrador específico
     * GET /pos/drafts/{draft_id}
     */
    getSaleDraft: builder.query<SaleDraftResponse, string>({
      query: (draft_id) => `/pos/drafts/${draft_id}`,
      providesTags: (result, error, id) => [{ type: 'SaleDraft', id }]
    }),

    /**
     * Actualizar borrador de venta
     * PATCH /pos/drafts/{draft_id}
     */
    updateSaleDraft: builder.mutation<SaleDraftResponse, { draft_id: string; data: SaleDraftUpdate }>({
      query: ({ draft_id, data }) => ({
        url: `/pos/drafts/${draft_id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { draft_id }) => [
        { type: 'SaleDraft', id: draft_id },
        { type: 'SaleDraft', id: 'LIST' }
      ]
    }),

    /**
     * Eliminar borrador
     * DELETE /pos/drafts/{draft_id}
     */
    deleteSaleDraft: builder.mutation<void, string>({
      query: (draft_id) => ({
        url: `/pos/drafts/${draft_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'SaleDraft', id },
        { type: 'SaleDraft', id: 'LIST' }
      ]
    }),

    /**
     * Completar venta desde borrador
     * POST /pos/drafts/{draft_id}/complete
     *
     * Convierte el borrador en una venta finalizada.
     * El borrador se elimina automáticamente después.
     */
    completeSaleDraft: builder.mutation<POSInvoice, { draft_id: string; data?: SaleDraftCompleteRequest }>({
      query: ({ draft_id, data = {} }) => ({
        url: `/pos/drafts/${draft_id}/complete`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { draft_id }) => [
        { type: 'SaleDraft', id: draft_id },
        { type: 'SaleDraft', id: 'LIST' },
        'POSSale',
        'CashMovement',
        'CashRegister',
        'Product',
        'ProductList'
      ]
    }),

    /**
     * Limpiar borradores antiguos
     * POST /pos/drafts/cleanup
     *
     * Elimina borradores abandonados (sin actividad por X días)
     */
    cleanupOldDrafts: builder.mutation<{ deleted_count: number }, { days_old?: number }>({
      query: (params = {}) => ({
        url: '/pos/drafts/cleanup',
        method: 'POST',
        params
      }),
      invalidatesTags: [{ type: 'SaleDraft', id: 'LIST' }]
    })
  })
});

// ========================================
// 🎣 EXPORT HOOKS
// ========================================

export const {
  // Cash Register
  useOpenCashRegisterMutation,
  useCloseCashRegisterMutation,
  useGetCashRegistersQuery,
  useLazyGetCashRegistersQuery,
  useGetCashRegisterQuery,
  useGetCurrentCashRegisterQuery,
  useLazyGetCurrentCashRegisterQuery,
  useGetClosingSummaryQuery,
  useLazyGetClosingSummaryQuery,

  // Cash Movements
  useCreateCashMovementMutation,
  useGetCashMovementsQuery,

  // Sellers
  useCreateSellerMutation,
  useGetSellersQuery,
  useUpdateSellerMutation,
  useDeactivateSellerMutation,

  // POS Sales
  useCreatePOSSaleMutation,
  useGetPOSSalesQuery,
  useGetPOSSaleQuery,
  useCancelPOSSaleMutation,
  useCreateCreditNoteMutation,
  useLazyDownloadSaleReceiptQuery,

  // Shifts
  useGetShiftHistoryQuery,
  useGetShiftDetailQuery,
  useLazyGetShiftDetailQuery,

  // Reports
  useGetShiftStatusQuery,
  useLazyGetShiftStatusQuery,
  useGetDailyClosingReportQuery,
  useLazyGetDailyClosingReportQuery,
  useGetShiftSalesQuery,
  useLazyGetShiftSalesQuery,
  useGetDailyReportQuery,
  useLazyDownloadShiftReportQuery,

  // Status
  useGetRegisterStatusQuery,

  // Sale Drafts
  useCreateSaleDraftMutation,
  useGetSaleDraftsQuery,
  useLazyGetSaleDraftsQuery,
  useGetSaleDraftQuery,
  useLazyGetSaleDraftQuery,
  useUpdateSaleDraftMutation,
  useDeleteSaleDraftMutation,
  useCompleteSaleDraftMutation,
  useCleanupOldDraftsMutation
} = posApi;
