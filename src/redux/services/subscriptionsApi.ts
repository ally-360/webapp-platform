import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';
import type { RootState } from '../store';

// ========================================
// 📋 BASE QUERY WITH AUTH
// ========================================

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: HOST_API,
  prepareHeaders: (headers, { getState }) => {
    // Obtener token del estado global
    const token = (getState() as RootState).auth?.token || localStorage.getItem('accessToken');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }
});

// ========================================
// 📋 INTERFACES
// ========================================

export interface Plan {
  id: string;
  name: string;
  code: string;
  type: string;
  description: string;
  monthly_price: string;
  yearly_price: string;
  max_users: number | null;
  max_pdvs: number | null;
  max_products: number | null;
  max_storage_gb: number;
  max_invoices_month: number | null;
  has_advanced_reports: boolean;
  has_api_access: boolean;
  has_multi_currency: boolean;
  has_inventory_alerts: boolean;
  has_email_support: boolean;
  has_phone_support: boolean;
  has_priority_support: boolean;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type PlansResponse = Plan[];

export interface Subscription {
  id: string;
  plan_name: string;
  plan_code: string;
  plan_type: 'free' | 'basic' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'inactive';
  billing_cycle: 'monthly' | 'yearly';
  is_trial: boolean;
  days_remaining: number;
  next_billing_date: string;
  max_users: number;
  max_pdvs: number;
  max_products: number;
  max_storage_gb: number;
  max_invoices_month: number;
  has_advanced_reports: boolean;
  has_api_access: boolean;
  has_multi_currency: boolean;
  has_inventory_alerts: boolean;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  total: number;
}

export interface CreateSubscriptionPayload {
  plan_id: string;
  billing_cycle?: 'monthly' | 'yearly';
  auto_renew?: boolean;
  start_date?: string;
  end_date?: string;
  trial_end_date?: string;
  amount?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateSubscriptionPayload {
  plan_id?: string;
  status?: 'trial' | 'active' | 'cancelled' | 'expired' | 'inactive';
  billing_cycle?: 'monthly' | 'yearly';
  end_date?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  cancelled_subscriptions: number;
  revenue_current_month: number;
  revenue_last_month: number;
  growth_rate: number;
}

export interface UpdateFirstLoginPayload {
  first_login: boolean;
}

// ========================================
// 🔗 API SLICE
// ========================================

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Plan', 'Subscription', 'SubscriptionStats', 'User'],
  endpoints: (builder) => ({
    // ========================================
    // 📋 PLANS ENDPOINTS
    // ========================================

    getPlans: builder.query<
      PlansResponse,
      {
        is_active?: boolean;
        billing_cycle?: string;
        limit?: number;
      }
    >({
      query: ({ is_active, billing_cycle, limit = 100 }) => {
        const params = new URLSearchParams();

        if (is_active !== undefined) params.append('is_active', is_active.toString());
        if (billing_cycle) params.append('billing_cycle', billing_cycle);
        if (limit) params.append('limit', limit.toString());

        return `/subscriptions/plans?${params.toString()}`;
      },
      providesTags: ['Plan']
    }),

    getPlan: builder.query<Plan, string>({
      query: (planId) => `/subscriptions/plans/${planId}`,
      providesTags: (result, error, planId) => [{ type: 'Plan', id: planId }]
    }),

    // ========================================
    // 📋 SUBSCRIPTIONS ENDPOINTS
    // ========================================

    getCurrentSubscription: builder.query<Subscription, void>({
      query: () => '/subscriptions/current',
      providesTags: ['Subscription']
    }),

    getSubscriptions: builder.query<
      SubscriptionsResponse,
      {
        status?: string;
        limit?: number;
        offset?: number;
      }
    >({
      query: ({ status, limit = 50, offset = 0 }) => {
        const params = new URLSearchParams();

        if (status) params.append('status', status);
        if (limit) params.append('limit', limit.toString());
        if (offset) params.append('offset', offset.toString());

        return `/subscriptions/?${params.toString()}`;
      },
      providesTags: ['Subscription']
    }),

    createSubscription: builder.mutation<Subscription, CreateSubscriptionPayload>({
      query: (payload) => ({
        url: '/subscriptions/',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats']
    }),

    getSubscription: builder.query<Subscription, string>({
      query: (subscriptionId) => `/subscriptions/${subscriptionId}`,
      providesTags: (result, error, subscriptionId) => [{ type: 'Subscription', id: subscriptionId }]
    }),

    updateSubscription: builder.mutation<
      Subscription,
      {
        id: string;
        data: UpdateSubscriptionPayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `/subscriptions/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subscription', id }, 'Subscription', 'SubscriptionStats']
    }),

    cancelSubscription: builder.mutation<Subscription, string>({
      query: (subscriptionId) => ({
        url: `/subscriptions/${subscriptionId}/cancel`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, subscriptionId) => [
        { type: 'Subscription', id: subscriptionId },
        'Subscription',
        'SubscriptionStats'
      ]
    }),

    reactivateSubscription: builder.mutation<Subscription, string>({
      query: (subscriptionId) => ({
        url: `/subscriptions/${subscriptionId}/reactivate`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, subscriptionId) => [
        { type: 'Subscription', id: subscriptionId },
        'Subscription',
        'SubscriptionStats'
      ]
    }),

    getSubscriptionStats: builder.query<SubscriptionStats, void>({
      query: () => '/subscriptions/stats/current',
      providesTags: ['SubscriptionStats']
    }),

    // ========================================
    // 👤 USER ENDPOINTS
    // ========================================

    updateFirstLogin: builder.mutation<{ message: string }, UpdateFirstLoginPayload>({
      query: (payload) => ({
        url: '/auth/me/first-login',
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['User']
    })
  })
});

// ========================================
// 🎣 EXPORT HOOKS
// ========================================

export const {
  // Plans
  useGetPlansQuery,
  useGetPlanQuery,

  // Subscriptions
  useGetCurrentSubscriptionQuery,
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useReactivateSubscriptionMutation,
  useGetSubscriptionStatsQuery,

  // User
  useUpdateFirstLoginMutation
} = subscriptionsApi;
