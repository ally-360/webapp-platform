import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';

// ========================================
// 👤 USER PROFILE API - RTK QUERY
// ========================================

export interface UserProfile {
  first_name: string;
  last_name: string;
  phone_number: string;
  dni?: string;
  photo?: string;
}

export interface UpdateProfileRequest {
  profile: {
    first_name: string;
    last_name: string;
    phone_number: string;
  };
}

export interface UserInvitation {
  id: string;
  invitee_email: string;
  role: string;
  expires_at: string;
  is_accepted: boolean;
  invited_by_name: string;
  company_name: string;
}

export interface InviteUserRequest {
  email: string;
  role: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  profile: {
    first_name: string;
    last_name: string;
    phone_number: string;
    dni: string;
  };
}

export interface AcceptExistingInvitationRequest {
  token: string;
}

export interface InvitationInfo {
  token: string;
  user_exists: boolean;
  company_name: string;
  invitee_email: string;
  role: string;
  expires_at: string;
  invited_by_name: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone_number?: string;
  economic_activity?: string;
  quantity_employees?: number;
  social_reason?: string;
  nit: string;
  logo_url?: string;
}

export interface UpdateCompanyRequest {
  name: string;
  description?: string;
  address?: string;
  phone_number?: string;
  economic_activity?: string;
  quantity_employees?: number;
  social_reason?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  profile: UserProfile;
  role: string;
  is_active: boolean;
}

export const userProfileApi = createApi({
  reducerPath: 'userProfileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${HOST_API}`,
    prepareHeaders: (headers, { endpoint }) => {
      const token = localStorage.getItem('accessToken');
      const companyId = localStorage.getItem('companyId');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (companyId) {
        headers.set('X-Company-ID', companyId);
      }

      // Solo agregar Content-Type para endpoints que no son FormData
      if (endpoint !== 'uploadUserAvatar' && endpoint !== 'uploadCompanyLogo') {
        headers.set('Content-Type', 'application/json');
      }

      return headers;
    }
  }),
  tagTypes: ['UserProfile', 'UserInvitations', 'CompanyUsers', 'CompanyProfile'],
  endpoints: (builder) => ({
    // ========================================
    // 👤 PROFILE ENDPOINTS
    // ========================================

    /**
     * Actualizar perfil del usuario
     */
    updateUserProfile: builder.mutation<UserResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['UserProfile']
    }),

    /**
     * Subir avatar del usuario
     */
    uploadUserAvatar: builder.mutation<{ avatar_url: string }, FormData>({
      query: (formData) => ({
        url: '/auth/me/avatar',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['UserProfile'],
      extraOptions: {
        maxRetries: 1
      }
    }),

    /**
     * Obtener URL temporal del avatar del usuario
     */
    getUserAvatar: builder.query<{ avatar_url: string }, void>({
      query: () => '/auth/me/avatar',
      providesTags: ['UserProfile']
    }),

    // ========================================
    // 📨 INVITATIONS ENDPOINTS
    // ========================================

    /**
     * Obtener invitaciones pendientes
     */
    getPendingInvitations: builder.query<UserInvitation[], void>({
      query: () => '/auth/invitations',
      providesTags: ['UserInvitations']
    }),

    /**
     * Invitar usuario a la empresa
     */
    inviteUser: builder.mutation<{ message: string; invitation_id: string }, InviteUserRequest>({
      query: (body) => ({
        url: '/auth/invite-user',
        method: 'POST',
        body
      }),
      invalidatesTags: ['UserInvitations', 'CompanyUsers']
    }),

    /**
     * Aceptar invitación
     */
    acceptInvitation: builder.mutation<{ message: string; user: UserResponse }, AcceptInvitationRequest>({
      query: (body) => ({
        url: '/auth/accept-invitation',
        method: 'POST',
        body
      }),
      invalidatesTags: ['UserInvitations', 'CompanyUsers']
    }),

    /**
     * Verificar información de invitación
     */
    getInvitationInfo: builder.query<InvitationInfo, string>({
      query: (token) => `/auth/invitation/${token}`,
      providesTags: ['UserInvitations']
    }),

    /**
     * Aceptar invitación para usuario existente
     */
    acceptExistingInvitation: builder.mutation<
      { message: string; user: UserResponse },
      AcceptExistingInvitationRequest
    >({
      query: (body) => ({
        url: '/auth/accept-invitation/existing',
        method: 'POST',
        body
      }),
      invalidatesTags: ['UserInvitations', 'CompanyUsers']
    }),

    /**
     * Obtener usuarios de la empresa (endpoint corregido)
     */
    getCompanyUsers: builder.query<{ users: UserResponse[]; total: number }, { page?: number; limit?: number }>({
      query: (params = {}) => ({
        url: '/auth/company/users',
        params: {
          page: params.page || 1,
          limit: params.limit || 25
        }
      }),
      providesTags: ['CompanyUsers']
    }),

    // ========================================
    // 🏢 COMPANY ENDPOINTS
    // ========================================

    /**
     * Actualizar información de la empresa
     */
    updateCompany: builder.mutation<CompanyProfile, UpdateCompanyRequest>({
      query: (body) => ({
        url: '/company/me',
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['CompanyProfile']
    }),

    /**
     * Subir logo de la empresa
     */
    uploadCompanyLogo: builder.mutation<{ logo_url: string }, FormData>({
      query: (formData) => ({
        url: '/company/me/logo',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['CompanyProfile'],
      extraOptions: {
        maxRetries: 1
      }
    }),

    /**
     * Obtener URL temporal del logo de la empresa
     */
    getCompanyLogo: builder.query<{ logo_url: string }, void>({
      query: () => '/company/me/logo',
      providesTags: ['CompanyProfile']
    }),

    /**
     * Obtener información de la empresa actual
     */
    getCompanyProfile: builder.query<CompanyProfile, void>({
      query: () => '/company/me',
      providesTags: ['CompanyProfile']
    })
  })
});

export const {
  // User Profile hooks
  useUpdateUserProfileMutation,
  useUploadUserAvatarMutation,
  useGetUserAvatarQuery,
  // Invitations hooks
  useGetPendingInvitationsQuery,
  useInviteUserMutation,
  useAcceptInvitationMutation,
  useGetInvitationInfoQuery,
  useAcceptExistingInvitationMutation,
  useGetCompanyUsersQuery,
  // Company hooks
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
  useGetCompanyLogoQuery,
  useGetCompanyProfileQuery
} = userProfileApi;
