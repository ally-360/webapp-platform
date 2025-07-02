import { createContext } from 'react';
import { AuthContextType } from 'src/interfaces/auth/authInterfaces';

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {}
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
