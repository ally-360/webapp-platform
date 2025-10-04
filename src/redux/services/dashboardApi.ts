import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';
import type { RootState } from '../store';

// ========================================
// 📊 DASHBOARD API - RTK QUERY
// ========================================

export interface DailySalesResponse {
  total_amount: string;
  total_invoices: number;
  date: string;
  pdv_id?: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  pdv_id: string;
  pdv_name: string;
}

export interface LowStockResponse {
  products: LowStockProduct[];
  total_count: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  sku: string;
  total_quantity: number;
  total_amount: string;
}

export interface TopProductsResponse {
  products: TopProduct[];
  period: string;
}

export interface SalesComparison {
  today: {
    amount: string;
    invoices: number;
    date: string;
  };
  yesterday: {
    amount: string;
    invoices: number;
    date: string;
  };
  percentage_change: number;
  amount_change: string;
}

export interface PDVSummary {
  pdv_id: string;
  pdv_name: string;
  today_sales: string;
  total_stock_items: number;
  active_employees: number;
  last_sale_time?: string;
}

export interface DashboardSummary {
  sales_today: DailySalesResponse;
  low_stock_count: number;
  top_products: TopProduct[];
  sales_comparison: SalesComparison;
  pdv_summary: PDVSummary;
}

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: HOST_API,
    prepareHeaders: (headers, { getState }) => {
      const { auth } = getState() as RootState;
      if (auth.token) {
        headers.set('Authorization', `Bearer ${auth.token}`);
      }
      const companyId = localStorage.getItem('companyId');
      if (companyId) {
        headers.set('X-Company-ID', companyId);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['DashboardData'],
  endpoints: (builder) => ({
    // ========================================
    // 📊 DASHBOARD ENDPOINTS
    // ========================================

    /**
     * Ventas del día actual
     */
    getDailySales: builder.query<DailySalesResponse, { pdv_id?: string; date?: string }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        // Si no se especifica fecha, usar hoy
        const today = params.date || new Date().toISOString().split('T')[0];
        searchParams.set('start_date', today);
        searchParams.set('end_date', today);

        if (params.pdv_id) {
          searchParams.set('pdv_id', params.pdv_id);
        }

        return `/invoices/reports/summary?${searchParams.toString()}`;
      },
      transformResponse: (response: any): DailySalesResponse => ({
        total_amount: response?.total_amount || '0',
        total_invoices: response?.total_invoices || 0,
        date: response?.date || new Date().toISOString().split('T')[0],
        pdv_id: response?.pdv_id
      }),
      providesTags: ['DashboardData']
    }),

    /**
     * Productos con stock bajo
     */
    getLowStockProducts: builder.query<LowStockResponse, { pdv_id?: string; limit?: number }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.set('low_stock', 'true');

        if (params.pdv_id) {
          searchParams.set('pdv_id', params.pdv_id);
        }
        if (params.limit) {
          searchParams.set('limit', params.limit.toString());
        }

        return `/products/stock?${searchParams.toString()}`;
      },
      transformResponse: (response: any): LowStockResponse => ({
        products: response?.data || [],
        total_count: response?.total || 0
      }),
      providesTags: ['DashboardData']
    }),

    /**
     * Productos más vendidos
     */
    getTopProducts: builder.query<
      TopProductsResponse,
      { period?: 'day' | 'week' | 'month'; pdv_id?: string; limit?: number }
    >({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();

        const period = params.period || 'week';
        const limit = params.limit || 5;

        // Calcular fechas según el período
        const endDate = new Date();
        const startDate = new Date();

        switch (period) {
          case 'day':
            startDate.setDate(endDate.getDate() - 1);
            break;
          case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        }

        searchParams.set('start_date', startDate.toISOString().split('T')[0]);
        searchParams.set('end_date', endDate.toISOString().split('T')[0]);
        searchParams.set('limit', limit.toString());

        if (params.pdv_id) {
          searchParams.set('pdv_id', params.pdv_id);
        }

        return `/invoices/reports/top-products?${searchParams.toString()}`;
      },
      transformResponse: (response: any, meta, arg): TopProductsResponse => ({
        products: response?.data || [],
        period: arg.period || 'week'
      }),
      providesTags: ['DashboardData']
    }),

    /**
     * Comparativo de ventas (hoy vs ayer)
     */
    getSalesComparison: builder.query<SalesComparison, { pdv_id?: string }>({
      query: (params = {}) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const searchParams = new URLSearchParams();
        searchParams.set('start_date', yesterday.toISOString().split('T')[0]);
        searchParams.set('end_date', today.toISOString().split('T')[0]);
        searchParams.set('compare', 'true');

        if (params.pdv_id) {
          searchParams.set('pdv_id', params.pdv_id);
        }

        return `/invoices/reports/comparison?${searchParams.toString()}`;
      },
      transformResponse: (response: any): SalesComparison => {
        const today = response?.today || { amount: '0', invoices: 0, date: new Date().toISOString().split('T')[0] };
        const yesterday = response?.yesterday || {
          amount: '0',
          invoices: 0,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        };

        const todayAmount = parseFloat(today.amount);
        const yesterdayAmount = parseFloat(yesterday.amount);
        const percentageChange = yesterdayAmount > 0 ? ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100 : 0;
        const amountChange = (todayAmount - yesterdayAmount).toString();

        return {
          today,
          yesterday,
          percentage_change: parseFloat(percentageChange.toFixed(2)),
          amount_change: amountChange
        };
      },
      providesTags: ['DashboardData']
    }),

    /**
     * Resumen del PDV actual
     */
    getPDVSummary: builder.query<PDVSummary, { pdv_id?: string }>({
      query: (params = {}) => {
        const pdvId = params.pdv_id || 'current';
        return `/pdvs/${pdvId}/summary`;
      },
      transformResponse: (response: any): PDVSummary => ({
        pdv_id: response?.pdv_id || '',
        pdv_name: response?.pdv_name || 'PDV Principal',
        today_sales: response?.today_sales || '0',
        total_stock_items: response?.total_stock_items || 0,
        active_employees: response?.active_employees || 0,
        last_sale_time: response?.last_sale_time
      }),
      providesTags: ['DashboardData']
    }),

    /**
     * Resumen completo del dashboard
     */
    getDashboardSummary: builder.query<DashboardSummary, { pdv_id?: string }>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.pdv_id) {
          searchParams.set('pdv_id', params.pdv_id);
        }
        return `/dashboard/summary?${searchParams.toString()}`;
      },
      providesTags: ['DashboardData']
    })
  })
});

export const {
  useGetDailySalesQuery,
  useGetLowStockProductsQuery,
  useGetTopProductsQuery,
  useGetSalesComparisonQuery,
  useGetPDVSummaryQuery,
  useGetDashboardSummaryQuery
} = dashboardApi;
