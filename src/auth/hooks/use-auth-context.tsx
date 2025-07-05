import { useContext } from 'react';
//
import { AuthContext as ImportedAuthContext } from '../context/jwt/auth-context';
import { AuthContextType } from '../../interfaces/auth/authInterfaces';

// Creación del contexto

// ----------------------------------------------------------------------

export const useAuthContext = (): AuthContextType => {
  const context = useContext(ImportedAuthContext);

  if (!context) throw new Error('useAuthContext context must be use inside AuthProvider');

  return context;
};
