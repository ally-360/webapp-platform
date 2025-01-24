import { InferType } from 'yup';
import { LoginSchema, RegisterCompanySchema, RegisterSchema } from './yupSchemas';

export type AuthCredentials = InferType<typeof LoginSchema>;

export type RegisterUser = InferType<typeof RegisterSchema>;

export type RegisterCompany = InferType<typeof RegisterCompanySchema>;

export interface ResponseCompany extends RegisterCompany {
  id: string;
}

export interface GetUserResponse {
  id: string;
  verified: boolean;
  verifyToken: unknown;
  resetPasswordToken: unknown;
  firstLogin: boolean;
  profile: GetProfileResponse;
}

export interface GetProfileResponse {
  id: string;
  email: string;
  name: string;
  lastname: string;
  dni: string;
  personalPhoneNumber: string;
  photo: string;
  company: GetCompanyResponse;
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
