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
  GetPDVResponse
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
import { setCredentials, clearCredentials } from 'src/redux/slices/authSlice';
// TODO: Actualizar al nuevo stepByStep slice
// import { setPrevValuesCompany, setPrevValuesPDV, setStep } from 'src/redux/inventory/stepByStepSlice';
import { AuthContext } from './auth-context';
import { setSession } from './utils';

interface InitialState {
  user: GetUserResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  company: GetCompanyResponse | null;
  pdvCompany: any;
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
    skip: !localStorage.getItem('accessToken')
  });

  const initialize = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      setSession(token);

      setState((prev) => ({ ...prev, loading: userLoading || companiesLoading }));
    } catch (error) {
      console.warn('Auth initialization error:', error);
      setState((prev) => ({ ...prev, loading: false }));
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
    const token = localStorage.getItem('accessToken');
    const decodedToken = token ? decodeToken(token) : null;

    if (decodedToken) {
      setState((prev) => ({
        ...prev,
        selectedCompany: !!decodedToken?.tenant_id
      }));
    }
    if (userCompanies && userCompanies.length > 0) {
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
          loading: false,
          changingCompany: false,
          selectedCompany: !!(companies.length === 1)
        });

        // Si solo hay una empresa, seleccionarla automáticamente
        if (companies.length === 1) {
          try {
            const companyResult = await selectCompanyMutation({ company_id: companies[0].company_id }).unwrap();

            // Actualizar token con el nuevo token de empresa
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
            // No lanzar error, el login fue exitoso
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
        console.log('📝 Register attempt:', data.email);

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

          const selectedCompany = userCompanies?.find((comp) => comp.id === companyId);
          if (selectedCompany) {
            const adaptedCompany = {
              id: selectedCompany.id,
              name: selectedCompany.name,
              nit: selectedCompany.nit,
              phoneNumber: selectedCompany.phone_number,
              address: selectedCompany.address || '',
              website: '',
              economicActivity: selectedCompany.economic_activity || '',
              quantityEmployees: selectedCompany.quantity_employees?.toString() || ''
            };

            setState((prev) => ({
              ...prev,
              company: adaptedCompany,
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

        // Transformar datos al formato esperado por el backend
        const backendData: CompanyCreate = {
          name: databody.name,
          nit: databody.nit,
          phone_number: databody.phone_number || '',
          address: databody.address || null,
          description: databody.description || null,
          economic_activity: databody.economic_activity || null,
          quantity_employees: databody.quantity_employees || null,
          social_reason: databody.social_reason || null,
          logo: databody.logo || null
        };

        const result = await createCompanyMutation(backendData).unwrap();

        // Adaptar respuesta del backend al formato frontend
        const adaptedCompany = {
          id: result.id,
          name: result.name,
          nit: result.nit,
          phoneNumber: result.phone_number || '',
          address: result.address || '',
          website: '',
          economicActivity: result.economic_activity || '',
          quantityEmployees: result.quantity_employees?.toString() || ''
        } as GetCompanyResponse;

        setState((prev) => ({ ...prev, company: adaptedCompany }));

        // TODO: Adaptar estas acciones al nuevo stepByStep slice
        // dispatch(setPrevValuesCompany(adaptedCompany));
        // dispatch(setStep(1));

        await selectCompany(adaptedCompany.id, false); // No mostrar loading durante registro

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

        // Mapear PDVOutput a GetPDVResponse para el step-by-step
        // TODO: Adaptar al nuevo slice - variable sin usar por ahora
        const _mappedPDV: GetPDVResponse = {
          id: result.id,
          name: result.name,
          description: '', // PDVOutput no tiene description
          address: result.address,
          phoneNumber: result.phone_number || '',
          main: false // Se puede configurar más tarde
        };

        // TODO: Adaptar estas acciones al nuevo stepByStep slice
        // dispatch(setPrevValuesPDV(mappedPDV));
        // dispatch(setStep(2));
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

    // Limpiar completamente el localStorage para evitar tokens corruptos
    localStorage.removeItem('accessToken');
    localStorage.removeItem('companyId');
    localStorage.removeItem('refreshToken');

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
