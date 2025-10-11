/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';

import {
  AuthCredentials,
  RegisterCompany,
  RegisterUser,
  BackendUser,
  BackendCompany,
  BackendPDV
} from 'src/interfaces/auth/userInterfaces';

// 🎯 RTK Query Integration
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
import { setCredentials, clearCredentials, setToken } from 'src/redux/slices/authSlice';
import { useNavigate } from 'react-router';
import { paths } from 'src/routes/paths';
import { authApi } from 'src/redux/services/authApi';
import { subscriptionsApi } from 'src/redux/services/subscriptionsApi';
import { posApi } from 'src/redux/services/posApi';
import { pdvsApi } from 'src/redux/services/pdvsApi';
import { productsApi } from 'src/redux/services/productsApi';
import { invoicesApi } from 'src/redux/services/invoicesApi';
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
}

const initialState: InitialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isFirstLogin: false,
  company: null,
  pdvCompany: null,
  changingCompany: false,
  selectedCompany: false
};

/**
 * Proveedor de contexto de autenticación integrado con RTK Query.
 * Gestiona el estado global del usuario, la empresa, los PDVs y el control de sesión.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }): JSX.Element {
  const [state, setState] = React.useState<InitialState>(initialState);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [createCompanyMutation] = useCreateCompanyMutation();
  const [updateCompanyMutation] = useUpdateCompanyMutation();
  const [createPDVMutation] = useCreatePDVMutation();
  const [selectCompanyMutation] = useSelectCompanyMutation();

  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError
  } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken')
  });

  const {
    data: userCompanies,
    isLoading: companiesLoading,
    error: companiesError
  } = useGetMyCompaniesQuery(undefined, {
    skip: !localStorage.getItem('accessToken') || userLoading || currentUser?.first_login === true,
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });

  const initialize = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
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

      setState((prev) => ({ ...prev, loading: userLoading || companiesLoading }));
    } catch (error) {
      console.warn('Auth initialization error:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        isAuthenticated: false,
        user: null
      }));
    }
  }, [userLoading, companiesLoading]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const decodeToken = (token: string) => {
    try {
      // Validar que el token existe y tiene el formato correcto
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        return null;
      }

      const payload = token.split('.')[1];

      // Validar que el payload existe
      if (!payload) {
        return null;
      }

      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    if (currentUser) {
      setState((prev) => ({
        ...prev,
        user: currentUser,
        isAuthenticated: true,
        isFirstLogin: currentUser.first_login,
        loading: false
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const decodedToken = token ? decodeToken(token) : null;

    if (decodedToken) {
      setState((prev) => ({
        ...prev,
        selectedCompany: !!decodedToken?.tenant_id
      }));
    }

    if (userCompanies && userCompanies.length > 0) {
      setState((prev) => ({
        ...prev,
        company: userCompanies[0] || null,
        isFirstLogin: currentUser ? currentUser.first_login : false,
        loading: false
      }));
    } else if (userCompanies && userCompanies.length === 0) {
      setState((prev) => ({
        ...prev,
        isFirstLogin: currentUser ? currentUser.first_login : false,
        loading: false
      }));
    }
  }, [userCompanies, currentUser, dispatch]);

  useEffect(() => {
    if (userError) {
      console.warn('User loading error:', userError);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [userError]);

  useEffect(() => {
    if (companiesError) {
      console.warn('Companies loading error:', companiesError);

      // 🔧 Si es un error 404 (no hay empresas), continuar normalmente
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((companiesError as any)?.status === 404) {
        console.log('📄 404: Usuario sin empresas (normal para usuarios nuevos)');
      }

      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [companiesError]);

  const login = useCallback(
    async ({ email, password }: AuthCredentials) => {
      try {
        const result = await loginMutation({ email, password }).unwrap();
        const { access_token, user, companies } = result;

        setSession(access_token);
        dispatch(setCredentials({ token: access_token, user, companies }));

        // Use backend data directly without adaptation
        setState({
          user,
          company: null, // Will be set when companies are loaded
          pdvCompany: null,
          isAuthenticated: true,
          isFirstLogin: user.first_login,
          loading: false,
          changingCompany: false,
          selectedCompany: !!(companies.length === 1)
        });

        if (companies.length === 1) {
          try {
            const companyResult = await selectCompanyMutation({ company_id: companies[0].company_id }).unwrap();

            if (companyResult.access_token) {
              setSession(companyResult.access_token);
              dispatch(
                setCredentials({
                  token: companyResult.access_token,
                  user,
                  companies
                })
              );
              console.log('✅ Auto-selected company and updated token');
            }
          } catch (selectError) {
            console.error('❌ Error auto-selecting company:', selectError);
          }
        }

        enqueueSnackbar('Bienvenido', { variant: 'success' });
      } catch (error: any) {
        console.error('❌ Login error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error en el login';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [loginMutation, dispatch, selectCompanyMutation, enqueueSnackbar]
  );

  const register = useCallback(
    async (data: RegisterUser) => {
      try {
        const backendData: RegisterUserData = {
          email: data.email,
          password: data.password,
          profile: {
            first_name: data.profile.name,
            last_name: data.profile.lastname,
            phone_number: data.profile.personalPhoneNumber || null,
            dni: data.profile.dni || null
          }
        };

        await registerMutation(backendData).unwrap();
        enqueueSnackbar(
          'Registro exitoso. Te hemos enviado un email de verificación que te permitirá ingresar automáticamente.',
          { variant: 'success' }
        );
      } catch (error: any) {
        console.error('❌ Register error:', error);
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
          // Actualizar token en Redux para que los baseQuery lean el nuevo Authorization inmediatamente
          dispatch(setToken(result.access_token));

          // Invalidar caches para evitar respuestas con token viejo
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
              enqueueSnackbar(`Empresa seleccionada: ${selectedCompany.name}`, { variant: 'success' });
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
        console.log('🏢 Create company attempt with RTK Query:', databody.name);

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
        const result = await createPDVMutation(pdvData).unwrap();
        enqueueSnackbar('PDV registrado exitosamente', { variant: 'success' });

        // Use backend PDV directly - no adaptation needed
        console.log('✅ PDV created:', result);

        // TODO: Adaptar estas acciones al nuevo stepByStep slice
        // dispatch(setPrevValuesPDV(result));
        // dispatch(setStep(2));
      } catch (error: any) {
        console.error('Error registering PDV:', error);
        enqueueSnackbar(error?.data?.detail || 'Error registrando PDV', { variant: 'error' });
        throw error;
      }
    },
    [createPDVMutation, enqueueSnackbar]
  );

  const navigate = useNavigate();

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

    // Limpiar completamente el localStorage para evitar tokens corruptos
    localStorage.removeItem('accessToken');
    localStorage.removeItem('companyId');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('ally360-step-by-step');

    setSession(null);
    dispatch(clearCredentials());

    // Restablecer estado inicial con loading en false para evitar splash screen
    setState({
      ...initialState,
      loading: false
    });

    enqueueSnackbar('Sesión cerrada', { variant: 'info' });

    // Navegar después de limpiar el estado
    navigate(paths.auth.jwt.login);
  }, [logoutMutation, dispatch, enqueueSnackbar, navigate]);

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

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
