// export interface LoginUser {
//   email: string;
//   password: string;
// }

import * as Yup from 'yup';
import { LoginSchema, RegisterSchema } from './yupSchemas';

export type AuthCredentials = Yup.InferType<typeof LoginSchema>;

export type RegisterUser = Yup.InferType<typeof RegisterSchema>;

export interface tokenSchema {
  id: string;
  verified: boolean;
  verifyToken: unknown;
  profile: ProfileToken;
  iat: number;
  exp: number;
}

export interface ProfileToken {
  email: string;
  company: {
    id?: string | null;
  };
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
