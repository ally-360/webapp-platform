import { AuthCredentials, RegisterUser, BackendUser, BackendCompany, BackendPDV } from './userInterfaces';

export interface AuthContextType {
  /**
   * Datos del usuario autenticado.
   */
  user: BackendUser | null;

  /**
   * Retorna true si la aplicación está cargando el estado de autenticación.
   */
  loading: boolean;

  /**
   * Retorna true si el usuario está autenticado.
   */
  authenticated: boolean;

  /**
   * Retorna true si el usuario no está autenticado.
   */
  unauthenticated: boolean;

  /**
   * Retorna true si el usuario es nuevo y es su primera vez iniciando sesión.
   */
  isFirstLogin: boolean;

  /**
   * Retorna true si se está cambiando de empresa actualmente.
   */
  changingCompany: boolean;

  /**
   * Retorna true si ya se seleccionó una empresa.
   */
  selectedCompany: boolean;

  /**
   * Datos de la empresa a la que pertenece el usuario.
   */
  company: BackendCompany | null;

  /**
   * Datos de los puntos de venta de la empresa a la que pertenece el usuario.
   */
  pdvCompany: BackendPDV | null;

  method: string;

  /**
   * Inicia sesión en la aplicación.
   * @param data datos del usuario para iniciar sesión.
   */
  login: (data: AuthCredentials) => Promise<void>;

  /**
   * Registra un nuevo usuario en la base de datos.
   * @param data datos del usuario a registrar.
   */
  register: (data: RegisterUser) => Promise<void>;

  /**
   * Cierra la sesión del usuario actual y limpia la sesión.
   */
  logout: () => void;

  /**
   * Selecciona una empresa y actualiza el token JWT.
   * @param companyId ID de la empresa a seleccionar.
   * @param showLoading Indica si se debe mostrar la pantalla de loading. Por defecto true.
   */
  selectCompany: (companyId: string, showLoading?: boolean) => Promise<any>;

  // TODO: agregar interfaz de todos los de aqui abajo

  /**
   * Actualiza los datos de la empresa a la que pertenece el usuario.
   */
  updateCompany: (id: string, data: object) => Promise<any>;

  // /**
  //  * Actualiza los datos de los puntos de venta de la empresa a la que pertenece el usuario.
  //  */
  // updatePdvCompany: (data: object) => Promise<void>;

  /**
   * Crea una nueva empresa.
   * @param data datos de la empresa a crear.
   */
  createCompany: (data: object) => Promise<void>;
  /**
   * Crea un nuevo punto de venta.
   */
  createPDV: (data: object) => Promise<void>;

  /**
   * Actualiza los datos de un punto de venta.
   */
  updatePDV: (id: string, data: object) => Promise<void>;

  /**
   * Actualiza los datos del usuario actual.
   */
  updateProfile: (id: string, data: object) => Promise<void>;

  /**
   * Actualiza los datos del perfil actual.
   */
  updateProfileInfo: (id: string, data: object) => Promise<void>;
}
