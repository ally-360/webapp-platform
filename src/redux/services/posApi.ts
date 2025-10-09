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
  POSInvoice,
  POSInvoiceCreate,
  POSSalesParams,
  ShiftCurrent,
  ShiftClose,
  ShiftHistory,
  ShiftHistoryParams,
  DailyReport,
  PaginatedResponse
} from 'src/types/pos';
import { baseQueryWithReauth } from './baseQuery';

export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CashRegister', 'CashMovement', 'Seller', 'POSSale', 'Shift'],
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
    getSellers: builder.query<PaginatedResponse<Seller>, { page?: number; size?: number; is_active?: boolean }>({
      query: ({ page = 1, size = 100, is_active = true } = {}) => ({
        url: '/sellers',
        params: { page, size, is_active }
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
    createPOSSale: builder.mutation<POSInvoice, POSInvoiceCreate>({
      query: (data) => ({
        url: '/pos/sales',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['POSSale', 'CashMovement', 'CashRegister']
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
      providesTags: ['POSSale']
    }),

    /**
     * Obtener detalle de venta POS
     * GET /pos/sales/{id}
     */
    getPOSSale: builder.query<POSInvoice, string>({
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
     * Obtener turno actual
     * GET /pos/shift/current
     */
    getCurrentShift: builder.query<ShiftCurrent, void>({
      query: () => '/pos/shift/current',
      providesTags: ['Shift']
    }),

    /**
     * Cerrar turno actual
     * POST /pos/shift/close
     */
    closeCurrentShift: builder.mutation<ShiftCurrent, ShiftClose>({
      query: (data) => ({
        url: '/pos/shift/close',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Shift', 'CashRegister']
    }),

    /**
     * Obtener historial de turnos
     * GET /pos/shift/history
     */
    getShiftHistory: builder.query<PaginatedResponse<ShiftHistory>, ShiftHistoryParams>({
      query: (params) => ({
        url: '/pos/shift/history',
        params
      }),
      providesTags: ['Shift']
    }),

    /**
     * Obtener detalle de turno específico
     * GET /pos/shift/{id}
     */
    getShift: builder.query<ShiftCurrent, string>({
      query: (id) => `/pos/shift/${id}`,
      providesTags: (result, error, id) => [{ type: 'Shift', id }]
    }),

    // ========================================
    // 📊 REPORTS ENDPOINTS
    // ========================================

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
        currentShift?: ShiftCurrent;
      },
      void
    >({
      query: () => '/pos/sales',
      providesTags: ['CashRegister', 'Shift']
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
  useGetCashRegisterQuery,

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
  useGetCurrentShiftQuery,
  useCloseCurrentShiftMutation,
  useGetShiftHistoryQuery,
  useGetShiftQuery,

  // Reports
  useGetDailyReportQuery,
  useLazyDownloadShiftReportQuery,

  // Status
  useGetRegisterStatusQuery
} = posApi;
