import { createContext } from 'react';
import { AuthContextType } from 'src/interfaces/auth/authInterfaces';

export const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  authenticated: false,
  unauthenticated: true,
  isFirstLogin: false,
  changingCompany: false,
  company: null,
  pdvCompany: null as any,

  method: 'jwt',

  login: async () => {
    throw new Error('login method not implemented');
  },
  register: async () => {
    throw new Error('register method not implemented');
  },
  logout: () => {
    throw new Error('logout method not implemented');
  },
  selectCompany: async () => {
    throw new Error('selectCompany method not implemented');
  },
  updateCompany: async (_id: string, data: any) => {
    throw new Error('updateCompany method not implemented');
  },
  updatePDV: async () => {
    throw new Error('updatePDV method not implemented');
  },
  createCompany: async () => {
    throw new Error('createCompany method not implemented');
  },
  createPDV: async () => {
    throw new Error('createPDV method not implemented');
  },
  updateProfile: async () => {
    throw new Error('updateProfile method not implemented');
  },
  updateProfileInfo: async () => {
    throw new Error('updateProfileInfo method not implemented');
  }
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
