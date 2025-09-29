/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React, { useEffect, useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';

import {
  AuthCredentials,
  RegisterCompany,
  RegisterUser,
  GetCompanyResponse,
  GetUserResponse,
  GetPDVResponse,
  UpdateProfile
} from 'src/interfaces/auth/userInterfaces';

// 🎯 RTK Query Integration
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetMyCompaniesQuery,
  useCreateCompanyMutation,
  useCreatePDVMutation,
  useSelectCompanyMutation,
  type RegisterUserData,
  type CompanyCreate
} from 'src/redux/services/authApi';

// Redux
import { useAppDispatch } from 'src/hooks/store';
import { setCredentials, clearCredentials } from 'src/redux/slices/authSlice';
import { setPrevValuesCompany, setPrevValuesPDV, setStep } from 'src/redux/inventory/stepByStepSlice';
import { AuthContext } from './auth-context';
import { setSession } from './utils';

interface InitialState {
  user: GetUserResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  company: GetCompanyResponse | null;
  pdvCompany: any;
}

const initialState: InitialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isFirstLogin: false,
  company: null,
  pdvCompany: null
};

/**
 * Proveedor de contexto de autenticación integrado con RTK Query.
 * Gestiona el estado global del usuario, la empresa, los PDVs y el control de sesión.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }): JSX.Element {
  const [state, setState] = React.useState<InitialState>(initialState);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  // RTK Query hooks
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [createCompanyMutation] = useCreateCompanyMutation();
  const [createPDVMutation] = useCreatePDVMutation();
  const [selectCompanyMutation] = useSelectCompanyMutation();

  // Query para obtener usuario actual (se ejecuta solo si hay token)
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError
  } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem('accessToken')
  });

  // Query para obtener empresas del usuario (se ejecuta solo si hay token)
  const {
    data: userCompanies,
    isLoading: companiesLoading,
    error: companiesError
  } = useGetMyCompaniesQuery(undefined, {
    skip: !localStorage.getItem('accessToken')
  });

  // Inicialización desde localStorage
  const initialize = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      setSession(token);

      // El usuario y empresas se cargarán automáticamente via RTK Query
      setState((prev) => ({ ...prev, loading: userLoading || companiesLoading }));
    } catch (error) {
      console.warn('Auth initialization error:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [userLoading, companiesLoading]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Actualizar estado cuando se obtiene el usuario
  useEffect(() => {
    if (currentUser) {
      const adaptedUser = {
        id: currentUser.id,
        email: currentUser.email,
        verified: currentUser.email_verified,
        authId: currentUser.id,
        firstLogin: false, // El backend no maneja firstLogin aún
        profile: {
          name: currentUser.profile.first_name,
          lastname: currentUser.profile.last_name,
          personalPhoneNumber: currentUser.profile.phone_number,
          dni: currentUser.profile.dni,
          photo: currentUser.profile.avatar_url
        }
      } as GetUserResponse;

      setState((prev) => ({
        ...prev,
        user: adaptedUser,
        isAuthenticated: true,
        loading: false
      }));
    }
  }, [currentUser]);

  // Actualizar estado cuando se obtienen las empresas
  useEffect(() => {
    if (userCompanies && userCompanies.length > 0) {
      console.log('✅ Companies data loaded:', userCompanies);
      
      // Adaptar datos del backend al formato frontend
      const adaptedCompanies = userCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        nit: company.nit,
        phoneNumber: company.phone_number,
        address: company.address || '',
        website: '',
        economicActivity: company.economic_activity || '',
        quantityEmployees: company.quantity_employees?.toString() || ''
      })) as GetCompanyResponse[];

      setState((prev) => ({
        ...prev,
        company: adaptedCompanies[0] || null,
        isFirstLogin: adaptedCompanies.length === 0,
        loading: false
      }));

      // Guardar empresas en Redux para el step-by-step
      if (adaptedCompanies.length > 0 && currentUser) {
        dispatch(
          setCredentials({
            token: localStorage.getItem('accessToken') || '',
            user: currentUser,
            companies: adaptedCompanies as any // Temporal casting para evitar problemas de tipos
          })
        );
      }
    } else if (userCompanies && userCompanies.length === 0) {
      // Usuario no tiene empresas - es su primer login
      setState((prev) => ({
        ...prev,
        isFirstLogin: true,
        loading: false
      }));
    }
  }, [userCompanies, currentUser, dispatch]);

  // Manejar errores de carga del usuario
  useEffect(() => {
    if (userError) {
      console.warn('User loading error:', userError);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [userError]);

  // Manejar errores de carga de empresas
  useEffect(() => {
    if (companiesError) {
      console.warn('Companies loading error:', companiesError);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [companiesError]);

  const login = useCallback(
    async ({ email, password }: AuthCredentials) => {
      try {
        console.log('🔑 Login attempt with RTK Query:', { email });

        const result = await loginMutation({ email, password }).unwrap();
        const { access_token, user, companies } = result;

        console.log('✅ Login successful:', { user: user?.email, companies: companies?.length });

        // Guardar token y configurar sesión
        setSession(access_token);
        dispatch(setCredentials({ token: access_token, user, companies }));

        // Adaptar datos del backend al formato frontend
        const adaptedUser = {
          id: user.id,
          email: user.email,
          verified: user.email_verified,
          authId: user.id,
          firstLogin: companies.length === 0,
          profile: {
            name: user.profile.first_name,
            lastname: user.profile.last_name,
            personalPhoneNumber: user.profile.phone_number,
            dni: user.profile.dni,
            photo: user.profile.avatar_url
          }
        } as GetUserResponse;

        // Adaptar companies si existen
        const adaptedCompanies = companies.map((uc) => ({
          id: uc.company_id,
          name: uc.company_name,
          // Otros campos se cargarán después
          website: '',
          phoneNumber: '',
          address: '',
          nit: ''
        })) as GetCompanyResponse[];

        setState({
          user: adaptedUser,
          company: adaptedCompanies[0] || null,
          pdvCompany: null,
          isAuthenticated: true,
          isFirstLogin: companies.length === 0,
          loading: false
        });

        // Si solo hay una empresa, seleccionarla automáticamente
        if (companies.length === 1) {
          await selectCompanyMutation({ company_id: companies[0].company_id });
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
        console.log('📝 Register attempt with RTK Query:', data.email);

        // Transformar datos al formato esperado por el backend
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
        console.log('✅ Register successful');
        enqueueSnackbar('Registro exitoso. Continúa con la configuración de tu empresa.', { variant: 'success' });
      } catch (error: any) {
        console.error('❌ Register error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error en el registro';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [registerMutation, enqueueSnackbar]
  );

  const createCompany = useCallback(
    async (databody: RegisterCompany): Promise<void> => {
      try {
        console.log('🏢 Create company attempt with RTK Query:', databody.name);

        // Transformar datos al formato esperado por el backend
        const backendData: CompanyCreate = {
          name: databody.name,
          nit: databody.nit,
          phone_number: databody.phoneNumber,
          address: databody.address || null,
          description: null,
          economic_activity: databody.economicActivity || null,
          quantity_employees: databody.quantityEmployees ? parseInt(databody.quantityEmployees, 10) : undefined,
          social_reason: null,
          logo: null
        };

        const result = await createCompanyMutation(backendData).unwrap();
        console.log('✅ Company created successfully:', result);

        // Adaptar respuesta del backend al formato frontend
        const adaptedCompany = {
          id: result.id,
          name: result.name,
          nit: result.nit,
          phoneNumber: result.phone_number,
          address: result.address || '',
          website: '',
          economicActivity: result.economic_activity || '',
          quantityEmployees: result.quantity_employees?.toString() || ''
        } as GetCompanyResponse;

        setState((prev) => ({ ...prev, company: adaptedCompany }));
        
        // Guardar datos de la empresa en el step-by-step para navegación
        dispatch(setPrevValuesCompany(adaptedCompany));
        dispatch(setStep(1)); // Avanzar al siguiente paso (PDV)
        
        enqueueSnackbar('Empresa creada exitosamente', { variant: 'success' });
      } catch (error: any) {
        console.error('❌ Create company error:', error);
        const errorMessage = error?.data?.detail || error?.message || 'Error al crear la empresa';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        throw error;
      }
    },
    [createCompanyMutation, dispatch, enqueueSnackbar]
  );

  const createPDV = useCallback(
    async (pdvData: any) => {
      try {
        const result = await createPDVMutation(pdvData).unwrap();
        enqueueSnackbar('PDV registrado exitosamente', { variant: 'success' });
        
        // Mapear PDVOutput a GetPDVResponse para el step-by-step
        const mappedPDV: GetPDVResponse = {
          id: result.id,
          name: result.name,
          description: '', // PDVOutput no tiene description
          address: result.address,
          phoneNumber: result.phone_number || '',
          main: false // Se puede configurar más tarde
        };
        
        dispatch(setPrevValuesPDV(mappedPDV));
        dispatch(setStep(2));
        
      } catch (error: any) {
        console.error('Error registering PDV:', error);
        enqueueSnackbar(error?.data?.detail || 'Error registrando PDV', { variant: 'error' });
        throw error;
      }
    },
    [createPDVMutation, enqueueSnackbar, dispatch]
  );

  const updateCompany = useCallback(async (_databody: UpdateProfile) => {
    console.warn('updateCompany not implemented yet');
  }, []);

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

    setSession(null);
    dispatch(clearCredentials());
    setState(initialState);
    enqueueSnackbar('Sesión cerrada', { variant: 'info' });
  }, [logoutMutation, dispatch, enqueueSnackbar]);

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
      isFirstLogin: state.isFirstLogin,

      login,
      register,
      logout,
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
      updateCompany,
      updatePDV,
      createCompany,
      createPDV,
      updateProfile,
      updateProfileInfo,
      state.user,
      state.company,
      state.pdvCompany,
      state.isFirstLogin,
      status
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
