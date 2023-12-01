import { createContext } from 'react';
import { AuthContextType } from 'src/interfaces/auth/authInterfaces';

// ----------------------------------------------------------------------

export const AuthContext = createContext<AuthContextType | null>(null);
