// ========================================
// 🔗 AUTH ADAPTERS - Frontend/Backend Mapping
// ========================================

import type {
  UserOut,
  ProfileOut,
  UserCompanyOut,
  TokenResponse,
  RegisterUserData,
  CompanyOut,
  PDVOutput
} from '../../redux/services/authApi';
import type {
  GetUserResponse,
  GetProfileResponse,
  GetCompanyResponse,
  GetPDVResponse,
  RegisterUser,
  RegisterCompany
} from '../auth/userInterfaces';

// ========================================
// 🔄 USER ADAPTERS
// ========================================

/**
 * Convierte ProfileOut (backend) a GetProfileResponse (frontend)
 */
export const adaptProfileOutToFrontend = (profile: ProfileOut): GetProfileResponse => ({
  id: profile.id,
  name: profile.first_name,
  lastname: profile.last_name,
  dni: profile.dni || '',
  personalPhoneNumber: profile.phone_number || '',
  photo: profile.avatar_url || ''
});

/**
 * Convierte UserOut (backend) a GetUserResponse (frontend)
 */
export const adaptUserOutToFrontend = (user: UserOut, companies: UserCompanyOut[]): GetUserResponse => ({
  id: user.id,
  verified: user.email_verified,
  email: user.email,
  authId: user.id, // En el backend, el ID del usuario es el authId
  verifyToken: null,
  resetPasswordToken: null,
  firstLogin: companies.length === 0, // Si no tiene empresas, es primer login
  profile: adaptProfileOutToFrontend(user.profile),
  company: companies.length > 0 ? adaptUserCompanyToCompany(companies[0]) : ({} as GetCompanyResponse)
});

/**
 * Convierte UserCompanyOut a GetCompanyResponse
 */
export const adaptUserCompanyToCompany = (userCompany: UserCompanyOut): GetCompanyResponse => ({
  id: userCompany.company_id,
  name: userCompany.company_name,
  nit: '', // TODO: Obtener del endpoint de empresa
  address: '',
  phoneNumber: '',
  website: '',
  quantityEmployees: '',
  economicActivity: ''
});

/**
 * Convierte CompanyOut (backend) a GetCompanyResponse (frontend)
 */
export const adaptCompanyOutToFrontend = (company: CompanyOut): GetCompanyResponse => ({
  id: company.id,
  name: company.name,
  nit: company.nit,
  address: company.address || '',
  phoneNumber: company.phone_number,
  website: '', // No existe en el backend actual
  quantityEmployees: company.quantity_employees?.toString() || '1',
  economicActivity: company.economic_activity || ''
});

/**
 * Convierte PDVOutput (backend) a GetPDVResponse (frontend)
 */
export const adaptPDVOutputToFrontend = (pdv: PDVOutput): GetPDVResponse => ({
  id: pdv.id,
  name: pdv.name,
  description: '', // No existe en el backend actual
  address: pdv.address,
  phoneNumber: pdv.phone_number || '',
  main: pdv.is_active,
  location: undefined,
  departamento: null,
  municipio: null
});

// ========================================
// 🔄 REGISTRATION ADAPTERS
// ========================================

/**
 * Convierte RegisterUser (frontend) a RegisterUserData (backend)
 */
export const adaptRegisterUserToBackend = (userData: RegisterUser): RegisterUserData => ({
  email: userData.email,
  password: userData.password,
  profile: {
    first_name: userData.profile.name,
    last_name: userData.profile.lastname,
    phone_number: userData.profile.personalPhoneNumber,
    dni: userData.profile.dni
  }
});

/**
 * Convierte RegisterCompany (frontend) a CompanyCreate (backend)
 */
export const adaptRegisterCompanyToBackend = (companyData: RegisterCompany) => ({
  name: companyData.name,
  description: null,
  address: companyData.address,
  phone_number: companyData.phoneNumber,
  nit: companyData.nit,
  economic_activity: companyData.economicActivity,
  quantity_employees: parseInt(companyData.quantityEmployees, 10) || 1,
  social_reason: null,
  logo: null
});

/**
 * Convierte datos del frontend de PDV a PDVCreate (backend)
 */
export const adaptPDVDataToBackend = (pdvData: any) => ({
  name: pdvData.name,
  address: pdvData.address,
  phone_number: pdvData.phoneNumber,
  is_active: pdvData.main || true
});

// ========================================
// 🔄 AUTH RESPONSE ADAPTER
// ========================================

/**
 * Convierte TokenResponse (backend) al formato esperado por el frontend
 */
export const adaptTokenResponseToFrontend = (tokenResponse: TokenResponse) => ({
  token: tokenResponse.access_token,
  user: adaptUserOutToFrontend(tokenResponse.user, tokenResponse.companies),
  profile: adaptProfileOutToFrontend(tokenResponse.user.profile),
  companies: tokenResponse.companies.map(adaptUserCompanyToCompany)
});

// ========================================
// 🔄 LOGIN ADAPTER
// ========================================

/**
 * Convierte credenciales de login del frontend al formato del backend
 */
export const adaptLoginCredentialsToBackend = (credentials: { email: string; password: string }) => ({
  username: credentials.email, // El backend espera 'username'
  password: credentials.password
});
