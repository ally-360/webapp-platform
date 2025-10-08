// ========================================
// 🔐 AUTH API - RTK Query Integration
// ========================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// ========================================
// 🏷️ AUTH INTERFACES (Backend Schema)
// ========================================

export interface LoginCredentials {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
}

export interface RegisterUserData {
  email: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    phone_number?: string | null;
    dni?: string | null;
  };
}

export interface ProfileOut {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  dni: string | null;
  avatar_url: string | null;
  full_name: string;
}

export interface UserOut {
  id: string;
  email: string;
  is_active: boolean;
  email_verified: boolean;
  first_login: boolean;
  profile: ProfileOut;
}

export interface UserCompanyOut {
  id: string;
  company_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  company_name: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserOut;
  companies: UserCompanyOut[];
  refresh_token?: string | null;
}

export interface CompanyCreate {
  name: string;
  description?: string | null;
  address?: string | null;
  phone_number: string;
  nit: string;
  economic_activity?: string | null;
  quantity_employees?: string | null;
  social_reason?: string | null;
  logo?: string | null;
}

export interface CompanyOut {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone_number: string | null;
  nit: string;
  economic_activity?: string | null;
  quantity_employees: string | null;
  social_reason?: string | null;
  logo?: string | null;
  uniquePDV?: boolean;
}

export interface PDVCreate {
  name: string;
  address: string;
  phone_number?: string | null;
  is_active?: boolean;
}

export interface PDVOutput {
  id: string;
  name: string;
  address: string;
  phone_number?: string | null;
  department_id?: string | null;
  city_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: any | null;
  city?: any | null;
}

export interface PDVsResponse {
  pdvs: PDVOutput[];
  total: number;
  limit: number;
  offset: number;
}

export interface SubscriptionOut {
  id: string;
  plan_name: string;
  plan_code: string;
  plan_type: string;
  status: string;
  billing_cycle: string;
  is_trial: boolean;
  days_remaining: number;
  next_billing_date?: string | null;
  max_users: number;
  max_pdvs: number;
  max_products: number;
  has_advanced_reports: boolean;
  has_api_access: boolean;
}

export interface RegisterResponse {
  message?: string;
  [key: string]: any;
}

// Nueva interfaz para verificación de email con auto-login
export interface EmailVerificationWithAutoLogin {
  token: string;
  auto_login?: boolean;
}

export interface EmailVerificationResponse {
  message: string;
  user_id: string;
  is_active: boolean;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  tenant_id?: string;
  user?: UserOut;
  companies?: UserCompanyOut[];
}

// ========================================
// 🔧 RTK Query API
// ========================================

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta as any).env?.VITE_HOST_API || 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      // Obtener token del estado global
      const token = (getState() as RootState).auth?.token || localStorage.getItem('accessToken');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    }
  }),
  tagTypes: ['Auth', 'User', 'Company', 'PDV', 'Subscription'],
  endpoints: (builder) => ({
    // ========================================
    // 🔐 AUTHENTICATION ENDPOINTS
    // ========================================

    /**
     * Login - POST /auth/login
     */
    login: builder.mutation<TokenResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          username: credentials.email,
          password: credentials.password,
          grant_type: 'password'
        })
      }),
      invalidatesTags: ['Auth', 'User']
    }),

    /**
     * Register - POST /auth/register
     */
    register: builder.mutation<RegisterResponse, RegisterUserData>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      }),
      invalidatesTags: ['Auth']
    }),

    /**
     * Verify Email - POST /auth/verify-email
     */
    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: { token }
      }),
      invalidatesTags: ['Auth']
    }),

    /**
     * Verify Email with Auto-Login - POST /auth/verify-email (with auto_login)
     */
    verifyEmailWithAutoLogin: builder.mutation<EmailVerificationResponse, EmailVerificationWithAutoLogin>({
      query: ({ token, auto_login = false }) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: { token, auto_login }
      }),
      invalidatesTags: ['Auth', 'User']
    }),

    /**
     * Verify Email via GET - GET /auth/verify-email?token=...&auto_login=true
     */
    verifyEmailViaGet: builder.query<EmailVerificationResponse, { token: string; auto_login?: boolean }>({
      query: ({ token, auto_login = false }) => ({
        url: `/auth/verify-email?token=${encodeURIComponent(token)}&auto_login=${auto_login}`,
        method: 'GET'
      }),
      providesTags: ['Auth', 'User']
    }),

    /**
     * Logout - POST /auth/logout
     */
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST'
      }),
      invalidatesTags: ['Auth', 'User']
    }),

    /**
     * Get current user - GET /auth/me
     */
    getCurrentUser: builder.query<UserOut, void>({
      query: () => '/auth/me',
      providesTags: ['User']
    }),

    /**
     * Select company context - POST /auth/select-company
     */
    selectCompany: builder.mutation<{ access_token: string; token_type: string }, { company_id: string }>({
      query: (data) => ({
        url: '/auth/select-company',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Auth', 'User']
    }),

    // ========================================
    // 🏢 COMPANY ENDPOINTS
    // ========================================

    /**
     * Create company - POST /company/
     */
    createCompany: builder.mutation<CompanyOut, CompanyCreate>({
      query: (companyData) => ({
        url: '/company/',
        method: 'POST',
        body: companyData
      }),
      invalidatesTags: ['Company']
    }),

    /**
     * Get user companies - GET /company/my_companies
     */
    getMyCompanies: builder.query<CompanyOut[], void>({
      query: () => '/company/my_companies',
      providesTags: ['Company']
    }),

    /**
     * Update company - PATCH /company/{id}
     */
    updateCompany: builder.mutation<CompanyOut, { id: string; data: Partial<CompanyCreate> }>({
      query: ({ id, data }) => ({
        url: `/company/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['Company']
    }),

    // ========================================
    // 🏪 PDV ENDPOINTS
    // ========================================

    /**
     * Create PDV - POST /pdvs/
     */
    createPDV: builder.mutation<PDVOutput, PDVCreate>({
      query: (pdvData) => ({
        url: '/pdvs/',
        method: 'POST',
        body: pdvData
      }),
      invalidatesTags: ['PDV']
    }),

    /**
     * Get current PDV - GET /pdvs/current
     */
    getCurrentPDV: builder.query<PDVOutput, void>({
      query: () => '/pdvs/current',
      providesTags: ['PDV']
    }),

    /**
     * Get all PDVs - GET /pdvs/
     */
    getAllPDVs: builder.query<PDVsResponse, void>({
      query: () => '/pdvs/',
      providesTags: ['PDV']
    }),

    /**
     * Update PDV - PATCH /pdvs/{id}
     */
    updatePDV: builder.mutation<PDVOutput, { id: string; data: Partial<PDVCreate> }>({
      query: ({ id, data }) => ({
        url: `/pdvs/${id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: ['PDV']
    }),

    // ========================================
    // 💳 SUBSCRIPTION ENDPOINTS
    // ========================================

    /**
     * Get current subscription - GET /subscriptions/current
     */
    getCurrentSubscription: builder.query<SubscriptionOut, void>({
      query: () => '/subscriptions/current',
      providesTags: ['Subscription']
    })
  })
});

// ========================================
// 📤 EXPORT HOOKS
// ========================================

export const {
  // Auth mutations
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useVerifyEmailWithAutoLoginMutation,
  useLogoutMutation,
  useSelectCompanyMutation,

  // Auth queries
  useGetCurrentUserQuery,
  useVerifyEmailViaGetQuery,

  // Company mutations & queries
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useGetMyCompaniesQuery,

  // PDV mutations & queries
  useCreatePDVMutation,
  useUpdatePDVMutation,
  useGetCurrentPDVQuery,
  useGetAllPDVsQuery,

  // Subscription queries
  useGetCurrentSubscriptionQuery
} = authApi;
