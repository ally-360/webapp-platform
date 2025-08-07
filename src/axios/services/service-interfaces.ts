// Re-exports de las interfaces existentes
import type {
  AuthCredentials,
  RegisterCompany,
  RegisterUser,
  GetUserResponse,
  UpdateProfile,
  changePassword
} from 'src/interfaces/auth/userInterfaces';

export type { AuthCredentials, RegisterCompany, RegisterUser, GetUserResponse, UpdateProfile, changePassword };

// ===== SERVICE SPECIFIC INTERFACES =====

export interface PaginationRequest {
  page?: number;
  pageSize?: number;
}

export interface EntityByIdRequest {
  id: string;
  includeRelations?: boolean;
}

export interface EntityUpdateRequest {
  id: string;
  databody: any;
}

export interface RelationsRequest {
  includeRelations?: boolean;
}

export interface UserUpdateRequest extends EntityUpdateRequest {
  databody: GetUserResponse;
}

export interface ProfileUpdateRequest extends EntityUpdateRequest {
  databody: UpdateProfile;
}

export interface CompanyUserAssignmentRequest {
  companyId: string;
  userId: string;
}

export interface CitiesRequest {
  department: string;
}
