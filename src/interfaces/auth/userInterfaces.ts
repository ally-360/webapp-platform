import { InferType } from 'yup';
import { LoginSchema, RegisterCompanySchema, RegisterSchema, ChangePassWordSchema } from './yupSchemas';

export type AuthCredentials = InferType<typeof LoginSchema>;

export type RegisterUser = InferType<typeof RegisterSchema>;

export type RegisterCompany = InferType<typeof RegisterCompanySchema>;

export type changePassword = InferType<typeof ChangePassWordSchema>;

// ========================================
// 🏷️ BACKEND RESPONSE INTERFACES (EXACT MATCH)
// ========================================

// /auth/me response
export interface BackendProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  dni: string | null;
  avatar_url: string | null;
  full_name: string;
}

export interface BackendUser {
  id: string;
  email: string;
  is_active: boolean;
  email_verified: boolean;
  first_login: boolean;
  profile: BackendProfile;
}

// /company/my_companies response
export interface BackendCompany {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone_number?: string | null;
  nit: string;
  economic_activity?: string | null;
  quantity_employees?: string | null;
  social_reason?: string | null;
  logo?: string | null;
  uniquePDV?: boolean;
}

// /company/me response (full company with PDVs)
export interface BackendDepartment {
  id: number;
  name: string;
  code: string;
}

export interface BackendCity {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department?: BackendDepartment;
}

export interface BackendPDV {
  id: string;
  name: string;
  address: string;
  phone_number: string | null;
  is_main: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department_id: number | null;
  city_id: number | null;
  department: BackendDepartment | null;
  city: BackendCity | null;
}

export interface BackendCompanyFull {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone_number: string | null;
  nit: string;
  economic_activity: string | null;
  quantity_employees: string | null;
  social_reason: string | null;
  logo: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  user_role: string;
  pdvs: BackendPDV[];
}

// /auth/me/avatar response
export interface BackendAvatar {
  avatar_url: string;
  expires_in: string;
}

// /pdvs/ response
export interface BackendPDVsResponse {
  pdvs: BackendPDV[];
  total: number;
  limit: number;
  offset: number;
}

// ========================================
// 🔄 LEGACY INTERFACES (For backward compatibility - TO BE REMOVED)
// ========================================

export interface ResponseCompany extends RegisterCompany {
  id: string;
}

export interface GetUserResponse {
  id: string;
  is_active: boolean;
  email: string;
  verifyToken: unknown;
  resetPasswordToken: unknown;
  first_login: boolean;
  profile: GetProfileResponse;
}

export interface GetProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone_number: string;
  avatar_url: string;
  full_name: string;
}

export interface GetCompanyResponse {
  id: string;
  name: string;
  nit: string;
  address: string;
  social_reason: string;
  description?: string;
  phone_number: string;
  quantity_employees: string;
  economic_activity: string;
  uniquePDV?: boolean;
}

export interface UpdateProfile {
  id?: string;
  email?: string;
  name?: string;
  lastname?: string;
  dni?: string;
  personalPhoneNumber?: string;
  photo?: string;
  company?: {
    id: string;
  };
}

// TODO: retornar en location el departamento y la ciudad
export interface GetPDVResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  phoneNumber: string;
  main: boolean;
  location?: Location;
  departamento?: string | null;
  municipio?: string | null;
}

export interface Location {
  id: number;
  name?: string;
}

export interface Identity {
  id: number;
  typeDocument: number;
  typePerson: number;
  number: number;
  dv: number;
}

export interface Town {
  id: number;
  name: string;
}

export interface ContactInterface {
  id: number;
  name: string;
  lastname: string;
  email: string;
  address: string;
  phoneNumber: string;
  phoneNumber2: string;
  type: number;
  identityId: number;
  companyId: string;
  townId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  identity: Identity;
  town: Town;
}
