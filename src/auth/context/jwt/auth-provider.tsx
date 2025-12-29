/* eslint-disable no-nested-ternary */
import React, { useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';

// ------------------------ interfaces ------------------------

import {
  AuthCredentials,
  RegisterCompany,
  BackendUser,
  BackendCompany,
  BackendPDV
} from 'src/interfaces/auth/userInterfaces';

// ------------------------- RTK Query Integration ------------------------

import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetMyCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useCreatePDVMutation,
  useSelectCompanyMutation,
  type RegisterUserData,
  type CompanyCreate
} from 'src/redux/services/authApi';

// Redux
import { useAppDispatch } from 'src/hooks/store';
import { clearAllStateOnCompanySwitch } from 'src/redux/actions/companySwitch';
// import { setCredentials, setToken } from 'src/redux/slices/authSlice';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { authApi } from 'src/redux/services/authApi';
import { subscriptionsApi } from 'src/redux/services/subscriptionsApi';
import { posApi } from 'src/redux/services/posApi';
import { pdvsApi } from 'src/redux/services/pdvsApi';
import { productsApi } from 'src/redux/services/productsApi';
import { invoicesApi } from 'src/redux/services/invoicesApi';
import { decodeToken } from 'src/auth/utils/token-validation';
import { AuthContext } from './auth-context';
import { setSession } from './utils';

interface InitialState {
  user: BackendUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  company: BackendCompany | null;
  pdvCompany: BackendPDV | null;
  changingCompany: boolean;
  selectedCompany: boolean;
  allCompanies: BackendCompany[];
}

const initialState: InitialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isFirstLogin: false,
  company: null,
  pdvCompany: null,
  changingCompany: false,
  selectedCompany: false,
  allCompanies: []
};

/**
 * Proveedor de contexto de autenticación integrado con RTK Query.
 * Gestiona el estado global del usuario, la empresa, los PDVs y el control de sesión.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }): JSX.Element {
  const [state, setState] = React.useState<InitialState>(initialState);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ------------- Redux Api hooks -------------
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [createCompanyMutation] = useCreateCompanyMutation();
  const [updateCompanyMutation] = useUpdateCompanyMutation();
  const [createPDVMutation] = useCreatePDVMutation();
  const [selectCompanyMutation] = useSelectCompanyMutation();
  const token = localStorage.getItem('accessToken') || null;

  // ------------- RTK Query data fetching -------------
  const {
    data: currentUser,
    isLoading: userLoading,
    error: _userError
  } = useGetCurrentUserQuery(undefined, {
    skip: !token
  });

  const {
    data: userCompanies,
    isLoading: companiesLoading,
    error: _companiesError
  } = useGetMyCompaniesQuery(undefined, {
    skip: !token || userLoading || !currentUser || currentUser?.first_login === true
  });

  // ------------- Auth logic -------------

  /**
   * Inicializa el estado de autenticación al cargar el componente.
   * 1. Verifica si hay un token en localStorage.
   * 2. Si hay token, lo establece en la sesión.
   * 3. Si el usuario ya está cargado, actualiza el estado con los datos del usuario (compañías, PDVs, etc.)
   * 4. Decodifica el token para verificar si hay una empresa seleccionada.
   * 5. Si las empresas del usuario ya están cargadas, establece la primera empresa como la empresa actual.
   * 6. Maneja errores y actualiza el estado de carga.
   */
  const initialize = useCallback(async () => {
    try {
      if (!token) {
        setState((prev) => ({
          ...prev,
          loading: false,
          isAuthenticated: false,
          user: null
        }));
        return;
      }

      setSession(token);
      if (currentUser) {
        setState((prev) => ({
          ...prev,
          user: currentUser,
          isAuthenticated: true,
          isFirstLogin: currentUser.first_login,
          loading: false
        }));
      }
      setState((prev) => ({ ...prev, loading: userLoading || companiesLoading }));

      const decodedToken = decodeToken(token);

      if (decodedToken) {
        setState((prev) => ({ ...prev, selectedCompany: !!decodedToken?.tenant_id }));
      }

      if (userCompanies && userCompanies.length > 0) {
        setState((prev) => ({
          ...prev,
          company: userCompanies[0] || null,
          allCompanies: userCompanies,
          isFirstLogin: currentUser ? currentUser.first_login : false,
          loading: false
        }));
      } else if (userCompanies && userCompanies.length === 0) {
        setState((prev) => ({
          ...prev,
          allCompanies: [],
          company: null,
          isFirstLogin: currentUser ? currentUser.first_login : false,
          loading: false
        }));
      }
    } catch (error) {
      console.warn('Auth initialization error:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        isAuthenticated: false,
        user: null
      }));
    }
  }, [userLoading, companiesLoading, token, currentUser, userCompanies]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  /**
   * Inicia sesión en la aplicación.
   * 1. Llama a la mutación de inicio de sesión con las credenciales proporcionadas.
   * 2. Si la autenticación es exitosa, guarda el token y los datos del usuario en el estado.
   * 3. Si hay una sola empresa, la selecciona automáticamente.
   * 4. Si hay múltiples empresas, redirige al usuario a la selección de empresa.
   */
  const login = useCallback(
    async ({ email, password }: AuthCredentials) => {
      try {
        const result = await loginMutation({ email, password }).unwrap();
        const { access_token, user, companies } = result;

        setSession(access_token);

        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
          isFirstLogin: user.first_login,
          loading: false
        }));

        if (companies.length === 1) {
          const companyResult = await selectCompanyMutation({
            company_id: companies[0].company_id
          }).unwrap();

          if (companyResult.access_token) {
            setSession(companyResult.access_token);
          }
        } else {
          navigate(paths.select_business);
        }

        enqueueSnackbar('Bienvenido', { variant: 'success' });
      } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error en el login';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [loginMutation, selectCompanyMutation, enqueueSnackbar, navigate]
  );

  /** Registra un nuevo usuario en la aplicación.
   * 1. Llama a la mutación de registro con los datos del usuario.
   * 2. Si el registro es exitoso, muestra una notificación al usuario.
   * 3. Maneja errores y muestra mensajes apropiados.
   */
  const register = useCallback(
    async (data: RegisterUserData) => {
      try {
        await registerMutation(data).unwrap();
        enqueueSnackbar('Registro exitoso. Te hemos enviado un email de verificación al correo electrónico.', {
          variant: 'success'
        });
      } catch (error: any) {
        console.error('Register error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error en el registro';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [registerMutation, enqueueSnackbar]
  );

  const selectCompany = useCallback(
    async (companyId: string, showLoading = true) => {
      try {
        if (showLoading) {
          setState((prev) => ({ ...prev, changingCompany: true }));
        }

        await dispatch(clearAllStateOnCompanySwitch());

        const result = await selectCompanyMutation({ company_id: companyId }).unwrap();

        if (result.access_token) {
          setSession(result.access_token);

          dispatch(authApi.util.invalidateTags(['User', 'Company', 'PDV', 'Subscription']));
          dispatch(subscriptionsApi.util.invalidateTags(['Subscription', 'Plan', 'User']));
          dispatch(posApi.util.invalidateTags(['POS'] as any));
          dispatch(pdvsApi.util.invalidateTags(['PDV'] as any));
          dispatch(productsApi.util.invalidateTags(['Product'] as any));
          dispatch(invoicesApi.util.invalidateTags(['Invoice'] as any));

          const selectedCompany = userCompanies?.find((comp) => comp.id === companyId);
          if (selectedCompany) {
            // Use backend company directly without adaptation
            setState((prev) => ({
              ...prev,
              company: selectedCompany,
              changingCompany: false,
              selectedCompany: true
            }));

            if (showLoading) {
              enqueueSnackbar(`Empresa seleccionada: ${selectedCompany.name}`, {
                variant: 'success'
              });
            }
          }
        }

        return result;
      } catch (error: any) {
        console.error('❌ Error selecting company:', error);
        // Desactivar loading en caso de error
        setState((prev) => ({ ...prev, changingCompany: false }));
        enqueueSnackbar(error?.data?.detail || 'Error seleccionando empresa', { variant: 'error' });
        throw error;
      }
    },
    [selectCompanyMutation, userCompanies, enqueueSnackbar, dispatch]
  );

  const createCompany = useCallback(
    async (databody: RegisterCompany): Promise<void> => {
      try {
        // Transform data to backend format
        const backendData: CompanyCreate = {
          name: databody.name,
          nit: databody.nit,
          phone_number: databody.phone_number || '',
          address: databody.address || null,
          description: databody.description || null,
          economic_activity: databody.economic_activity || null,
          quantity_employees: databody.quantity_employees || null,
          social_reason: databody.social_reason || null,
          logo: databody.logo || null,
          uniquePDV: databody.uniquePDV || false
        };

        const result = await createCompanyMutation(backendData).unwrap();

        // Use backend company directly without adaptation
        setState((prev) => ({ ...prev, company: result }));

        // Seleccionar la empresa creada para establecer el tenant en el token
        await selectCompany(result.id, false); // No mostrar loading durante registro

        enqueueSnackbar('Empresa creada exitosamente', { variant: 'success' });
      } catch (error: any) {
        console.error('❌ Create company error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error al crear la empresa';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [createCompanyMutation, enqueueSnackbar, selectCompany]
  );

  const createPDV = useCallback(
    async (pdvData: any) => {
      try {
        await createPDVMutation(pdvData).unwrap();
        enqueueSnackbar('PDV registrado exitosamente', { variant: 'success' });
      } catch (error: any) {
        console.error('Error registering PDV:', error);
        enqueueSnackbar(error?.data?.detail || 'Error registrando PDV', { variant: 'error' });
        throw error;
      }
    },
    [createPDVMutation, enqueueSnackbar]
  );

  const updateCompany = useCallback(
    async (id: string, data: Partial<CompanyCreate>) => {
      try {
        const result = await updateCompanyMutation({ id, data }).unwrap();
        return result;
      } catch (error) {
        console.error('Error updating company:', error);
        throw error;
      }
    },
    [updateCompanyMutation]
  );

  const updatePDV = useCallback(async (_id: string, _databody: any) => {
    console.warn('updatePDV not implemented yet');
  }, []);

  const updateProfile = useCallback(async (_id: string, _databody: any) => {
    console.warn('updateProfile not implemented yet');
  }, []);

  const updateProfileInfo = useCallback(async (_id: string, _databody: any) => {
    console.warn('updateProfileInfo not implemented yet');
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.warn('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('companyId');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('ally360-step-by-step');
    setSession(null);
    setState({
      ...initialState,
      loading: false
    });

    enqueueSnackbar('Sesión cerrada', { variant: 'info' });

    navigate(paths.auth.jwt.login);
  }, [logoutMutation, enqueueSnackbar, navigate]);

  const status = state.loading ? 'loading' : state.user ? 'authenticated' : 'unauthenticated';

  const value = useMemo(
    () => ({
      user: state.user,
      company: state.company,
      pdvCompany: state.pdvCompany,

      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      selectedCompany: state.selectedCompany,
      isFirstLogin: state.isFirstLogin,
      changingCompany: state.changingCompany,

      login,
      register,
      logout,
      selectCompany,
      updateCompany,
      updatePDV,
      createCompany,
      createPDV,
      updateProfile,
      updateProfileInfo
    }),
    [
      login,
      logout,
      register,
      selectCompany,
      updateCompany,
      updatePDV,
      createCompany,
      createPDV,
      updateProfile,
      updateProfileInfo,
      state.user,
      state.company,
      state.selectedCompany,
      state.pdvCompany,
      state.isFirstLogin,
      state.changingCompany,
      status
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
