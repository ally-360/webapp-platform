import { AuthCredentials, RegisterUser } from '../interfaces/userInterfaces';

export interface AuthContextType {
  login: (data: AuthCredentials) => Promise<void>;
  register: (data: RegisterUser) => Promise<void>;
  // ... otras propiedades y métodos que tu contexto pueda tener
}
