import { createContext } from 'react';
import { AuthContextType } from 'src/auth/hooks/authInterfaces';

// ----------------------------------------------------------------------

export const AuthContext = createContext<AuthContextType | null>(null);
