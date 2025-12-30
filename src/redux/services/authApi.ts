// ========================================
// 🔐 AUTH API - RTK Query Integration
// ========================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';

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
  uniquePDV?: boolean;
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
  unique_pdv?: boolean;
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
    baseUrl: HOST_API,
    prepareHeaders: (headers) => {
      // Obtener token del localStorage directamente
      const token = localStorage.getItem('accessToken');

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
    }),

    /**
     * Change password - POST /auth/change-password
     */
    changePassword: builder.mutation<
      { message: string },
      { current_password: string; new_password: string; confirm_password: string }
    >({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data
      })
    })
  })
});

// ========================================
// 📤 EXPORT HOOKS WITH DETAILED DOCUMENTATION
// ========================================

/**
 * 🔐 **Auth API Hooks** - RTK Query hooks with endpoint documentation
 *
 * Hover over any hook to see:
 * - HTTP method and endpoint
 * - Request/response types
 * - Usage examples
 */

// ========================================
// 🔐 AUTHENTICATION HOOKS
// ========================================

/**
 * **Login User**
 *
 * `POST /auth/login`
 *
 * Authenticates user with email/password and returns JWT token + user data
 *
 * @example
 * ```ts
 * const [login, { data, isLoading, error }] = useLoginMutation();
 * await login({ email: 'user@example.com', password: 'password123' });
 * ```
 */
export const useLoginMutation = authApi.endpoints.login.useMutation;

/**
 * **Register New User**
 *
 * `POST /auth/register`
 *
 * Creates new user account with email, password and profile data
 *
 * @example
 * ```ts
 * const [register] = useRegisterMutation();
 * await register({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   profile: { first_name: 'John', last_name: 'Doe' }
 * });
 * ```
 */
export const useRegisterMutation = authApi.endpoints.register.useMutation;

/**
 * **Verify Email Address**
 *
 * `POST /auth/verify-email`
 *
 * Verifies user email using token from verification email
 *
 * @example
 * ```ts
 * const [verifyEmail] = useVerifyEmailMutation();
 * await verifyEmail({ token: 'verification_token_here' });
 * ```
 */
export const useVerifyEmailMutation = authApi.endpoints.verifyEmail.useMutation;

/**
 * **Verify Email with Auto-Login**
 *
 * `POST /auth/verify-email`
 *
 * Verifies email and automatically logs in user, returning auth tokens
 *
 * @example
 * ```ts
 * const [verifyEmailWithAutoLogin] = useVerifyEmailWithAutoLoginMutation();
 * await verifyEmailWithAutoLogin({ token: 'token', auto_login: true });
 * ```
 */
export const useVerifyEmailWithAutoLoginMutation = authApi.endpoints.verifyEmailWithAutoLogin.useMutation;

/**
 * **Verify Email via GET**
 *
 * `GET /auth/verify-email?token=...&auto_login=true`
 *
 * Alternative email verification method using GET request
 *
 * @example
 * ```ts
 * const { data } = useVerifyEmailViaGetQuery({ token: 'token', auto_login: true });
 * ```
 */
export const useVerifyEmailViaGetQuery = authApi.endpoints.verifyEmailViaGet.useQuery;

/**
 * **Logout User**
 *
 * `POST /auth/logout`
 *
 * Invalidates current session and logs out user
 *
 * @example
 * ```ts
 * const [logout] = useLogoutMutation();
 * await logout();
 * ```
 */
export const useLogoutMutation = authApi.endpoints.logout.useMutation;

/**
 * **Get Current User**
 *
 * `GET /auth/me`
 *
 * Retrieves current authenticated user's profile and details
 *
 * @example
 * ```ts
 * const { data: user, isLoading } = useGetCurrentUserQuery();
 * console.log(user?.profile.first_name);
 * ```
 */
export const useGetCurrentUserQuery = authApi.endpoints.getCurrentUser.useQuery;

/**
 * **Select Company Context**
 *
 * `POST /auth/select-company`
 *
 * Switches user's active company context and updates JWT token
 *
 * @example
 * ```ts
 * const [selectCompany] = useSelectCompanyMutation();
 * await selectCompany({ company_id: 'company-uuid-here' });
 * ```
 */
export const useSelectCompanyMutation = authApi.endpoints.selectCompany.useMutation;

/**
 * **Change Password**
 *
 * `POST /auth/change-password`
 *
 * Updates user's password with current password validation
 *
 * @example
 * ```ts
 * const [changePassword] = useChangePasswordMutation();
 * await changePassword({
 *   current_password: 'old_pass',
 *   new_password: 'new_pass',
 *   confirm_password: 'new_pass'
 * });
 * ```
 */
export const useChangePasswordMutation = authApi.endpoints.changePassword.useMutation;

// ========================================
// 🏢 COMPANY MANAGEMENT HOOKS
// ========================================

/**
 * **Create Company**
 *
 * `POST /company/`
 *
 * Creates new company with business information and NIT
 *
 * @example
 * ```ts
 * const [createCompany] = useCreateCompanyMutation();
 * await createCompany({
 *   name: 'My Business',
 *   nit: '123456789-0',
 *   phone_number: '+57123456789',
 *   uniquePDV: true
 * });
 * ```
 */
export const useCreateCompanyMutation = authApi.endpoints.createCompany.useMutation;

/**
 * **Update Company**
 *
 * `PATCH /company/{id}`
 *
 * Updates existing company information
 *
 * @example
 * ```ts
 * const [updateCompany] = useUpdateCompanyMutation();
 * await updateCompany({
 *   id: 'company-id',
 *   data: { name: 'Updated Business Name' }
 * });
 * ```
 */
export const useUpdateCompanyMutation = authApi.endpoints.updateCompany.useMutation;

/**
 * **Get My Companies**
 *
 * `GET /company/my_companies`
 *
 * Retrieves all companies where current user is a member
 *
 * @example
 * ```ts
 * const { data: companies } = useGetMyCompaniesQuery();
 * companies?.forEach(company => console.log(company.name));
 * ```
 */
export const useGetMyCompaniesQuery = authApi.endpoints.getMyCompanies.useQuery;

// ========================================
// 🏪 POINT OF SALE (PDV) HOOKS
// ========================================

/**
 * **Create PDV**
 *
 * `POST /pdvs/`
 *
 * Creates new Point of Sale location for company
 *
 * @example
 * ```ts
 * const [createPDV] = useCreatePDVMutation();
 * await createPDV({
 *   name: 'Main Store',
 *   address: 'Calle 123 #45-67',
 *   phone_number: '+57123456789'
 * });
 * ```
 */
export const useCreatePDVMutation = authApi.endpoints.createPDV.useMutation;

/**
 * **Update PDV**
 *
 * `PATCH /pdvs/{id}`
 *
 * Updates existing PDV information
 *
 * @example
 * ```ts
 * const [updatePDV] = useUpdatePDVMutation();
 * await updatePDV({
 *   id: 'pdv-id',
 *   data: { name: 'Updated Store Name' }
 * });
 * ```
 */
export const useUpdatePDVMutation = authApi.endpoints.updatePDV.useMutation;

/**
 * **Get Current PDV**
 *
 * `GET /pdvs/current`
 *
 * Retrieves current active PDV based on user context
 *
 * @example
 * ```ts
 * const { data: currentPDV } = useGetCurrentPDVQuery();
 * console.log(`Active PDV: ${currentPDV?.name}`);
 * ```
 */
export const useGetCurrentPDVQuery = authApi.endpoints.getCurrentPDV.useQuery;

/**
 * **Get All PDVs**
 *
 * `GET /pdvs/`
 *
 * Retrieves all PDVs for current company with pagination
 *
 * @example
 * ```ts
 * const { data: pdvsResponse } = useGetAllPDVsQuery();
 * console.log(`Total PDVs: ${pdvsResponse?.total}`);
 * pdvsResponse?.pdvs.forEach(pdv => console.log(pdv.name));
 * ```
 */
export const useGetAllPDVsQuery = authApi.endpoints.getAllPDVs.useQuery;

// ========================================
// 💳 SUBSCRIPTION HOOKS
// ========================================

/**
 * **Get Current Subscription**
 *
 * `GET /subscriptions/current`
 *
 * Retrieves current subscription plan and billing information
 *
 * @example
 * ```ts
 * const { data: subscription } = useGetCurrentSubscriptionQuery();
 * console.log(`Plan: ${subscription?.plan_name}`);
 * console.log(`Days remaining: ${subscription?.days_remaining}`);
 * ```
 */
export const useGetCurrentSubscriptionQuery = authApi.endpoints.getCurrentSubscription.useQuery;
