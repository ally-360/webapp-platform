// export interface LoginUser {
//   email: string;
//   password: string;
// }

import * as Yup from 'yup';
import { LoginSchema, RegisterCompanySchema, RegisterSchema } from './yupSchemas';

export type AuthCredentials = Yup.InferType<typeof LoginSchema>;

export type RegisterUser = Yup.InferType<typeof RegisterSchema>;

export type RegisterCompany = Yup.InferType<typeof RegisterCompanySchema>;

export interface responseCompany extends RegisterCompany {
  id: string;
}

export interface getUserResponse {
  id: string;
  verified: boolean;
  verifyToken: unknown;
  resetPasswordToken: unknown;
  firstLogin: boolean;
  profile: getProfileResponse;
}

export interface getProfileResponse {
  id: string;
  email: string;
  name: string;
  lastname: string;
  dni: string;
  personalPhoneNumber: string;
  photo: string;
  company: getCompanyResponse;
}

export interface getCompanyResponse {
  id: string;
  name: string;
  nit: string;
  address: string;
  phoneNumber: string;
  website: string;
  quantityEmployees: string;
  economicActivity: string;
}

export interface updateProfile {
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
export interface getPDVResponse {
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
