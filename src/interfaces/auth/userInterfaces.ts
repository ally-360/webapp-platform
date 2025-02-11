import { InferType } from 'yup';
import { LoginSchema, RegisterCompanySchema, RegisterSchema, ChangePassWordSchema } from './yupSchemas';

export type AuthCredentials = InferType<typeof LoginSchema>;

export type RegisterUser = InferType<typeof RegisterSchema>;

export type RegisterCompany = InferType<typeof RegisterCompanySchema>;

export type changePassword = InferType<typeof ChangePassWordSchema>;

export interface ResponseCompany extends RegisterCompany {
  id: string;
}

export interface GetUserResponse {
  id: string;
  verified: boolean;
  email: string;
  verifyToken: unknown;
  resetPasswordToken: unknown;
  firstLogin: boolean;
  profile: GetProfileResponse;
  company: GetCompanyResponse;
}

export interface GetProfileResponse {
  id: string;
  name: string;
  lastname: string;
  dni: string;
  personalPhoneNumber: string;
  photo: string;
}

export interface GetCompanyResponse {
  id: string;
  name: string;
  nit: string;
  address: string;
  phoneNumber: string;
  website: string;
  quantityEmployees: string;
  economicActivity: string;
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
  departamento?: string;
  municipio?: string;
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
