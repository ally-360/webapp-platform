// ========================================
// 🔐 AUTH API - RTK Query Integration
// ========================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// ========================================
// 🏷️ AUTH INTERFACES (Backend Schema)
// ========================================

export interface LoginCredentials {
  username: string; // backend usa 'username' en lugar de 'email'
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
    first_name: string; // backend usa 'first_name' en lugar de 'name'
    last_name: string; // backend usa 'last_name' en lugar de 'lastname'
    phone_number?: string | null; // backend usa 'phone_number' en lugar de 'personalPhoneNumber'
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
  quantity_employees?: number;
  social_reason?: string | null;
  logo?: string | null;
}

export interface CompanyOut {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone_number: string;
  nit: string;
  economic_activity?: string | null;
  quantity_employees: number;
  social_reason?: string | null;
  logo?: string | null;
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
  is_active: boolean;
}

export interface RegisterResponse {
  message?: string;
  [key: string]: any;
}

// ========================================
// 🔧 RTK Query API
// ========================================

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_HOST_API || 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      // Obtener token del estado global
      const token = (getState() as RootState).auth?.token || localStorage.getItem('accessToken');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    }
  }),
  tagTypes: ['Auth', 'User', 'Company', 'PDV'],
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
          username: credentials.email, // backend espera 'username'
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
    selectCompany: builder.mutation<{ message: string }, { company_id: string }>({
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
  useLogoutMutation,
  useSelectCompanyMutation,

  // Auth queries
  useGetCurrentUserQuery,

  // Company mutations & queries
  useCreateCompanyMutation,
  useGetMyCompaniesQuery,

  // PDV mutations & queries
  useCreatePDVMutation,
  useGetCurrentPDVQuery
} = authApi;
