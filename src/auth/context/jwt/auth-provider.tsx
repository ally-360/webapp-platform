/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React, { useEffect, useReducer, useCallback, useMemo } from 'react';
import jwtDecode from 'jwt-decode';
import { useSnackbar } from 'notistack';

import {
  AuthCredentials,
  RegisterCompany,
  RegisterUser,
  GetCompanyResponse,
  GetUserResponse,
  UpdateProfile
} from 'src/interfaces/auth/userInterfaces';
import { tokenSchema } from 'src/interfaces/auth/tokenInterface';
import ApiService from 'src/axios/services/api-service';
import { AuthContext } from './auth-context';
import { setSession, setSessionCompanyId } from './utils';

interface InitialState {
  user: GetUserResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  company: GetCompanyResponse | null;
  pdvCompany: any;
}

interface ReducerAction {
  type: 'INITIAL' | 'LOGIN' | 'REGISTER' | 'UPDATE_COMPANY' | 'UPDATE_PDV' | 'LOGOUT';
  payload?: Partial<InitialState>;
}

const initialState: InitialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isFirstLogin: false,
  company: null,
  pdvCompany: null
};

const reducer = (state: InitialState, action: ReducerAction): InitialState => {
  switch (action.type) {
    case 'INITIAL':
      return { ...state, ...action.payload, loading: false };
    case 'LOGIN':
      return { ...state, ...action.payload, isAuthenticated: true };
    case 'REGISTER':
      return { ...state, isAuthenticated: false };
    case 'UPDATE_COMPANY':
      console.log('Updating company in reducer:', action.payload?.company);
      return { ...state, company: action.payload?.company || state.company };
    case 'UPDATE_PDV':
      return { ...state, ...action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

const STORAGE_KEY = 'accessToken';

/**
 * Proveedor de contexto de autenticación.
 * Gestiona el estado global del usuario, la empresa, los PDVs y el control de sesión.
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { enqueueSnackbar } = useSnackbar();

  const setUserInformation = useCallback(async (accessToken: string): Promise<GetUserResponse> => {
    const token: tokenSchema = jwtDecode(accessToken);
    const { data: user } = await ApiService.getUserById(token.authId);

    // TODO: Se necesita obtener el companyId del usuario y las companys que tiene
    setSessionCompanyId(user?.company?.[0]?.id || null);

    if (user?.company?.length > 0) {
      const { data: pdvForCompany } = await ApiService.getCompanyById(user.company[0].id, true);
      dispatch({ type: 'UPDATE_COMPANY', payload: { company: user.company[0] } });
      dispatch({ type: 'UPDATE_PDV', payload: { pdvCompany: pdvForCompany?.pdvs || null } });
    }

    return user;
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = window.localStorage.getItem(STORAGE_KEY);
      if (!accessToken) throw new Error('No hay token disponible');
      setSession(accessToken);
      const user = await setUserInformation(accessToken);
      console.log('User information set:', user);
      dispatch({ type: 'INITIAL', payload: { user, isAuthenticated: true, isFirstLogin: user.firstLogin || false } });
    } catch (error) {
      enqueueSnackbar('No hay token disponible', { variant: 'error' });
      dispatch({
        type: 'INITIAL',
        payload: { user: null, isAuthenticated: false, isFirstLogin: false }
      });
    }
  }, [setUserInformation, enqueueSnackbar]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(
    async ({ email, password }: AuthCredentials) => {
      const { accessToken } = (await ApiService.authenticateUser({ email, password })).data;
      setSession(accessToken);
      const user = await setUserInformation(accessToken);
      enqueueSnackbar('Bienvenido', { variant: 'success' });
      dispatch({ type: 'LOGIN', payload: { user, isFirstLogin: user.firstLogin || false } });
    },
    [setUserInformation, enqueueSnackbar]
  );

  const register = useCallback(async (data: RegisterUser) => {
    await ApiService.registerUser(data);
    dispatch({ type: 'REGISTER' });
  }, []);

  const updateCompany = useCallback(
    async (databody: UpdateProfile) => {
      if (!state.company) {
        throw new Error('No company information available');
      }
      const { data } = await ApiService.updateCompany({ id: state.company.id, databody });
      dispatch({ type: 'UPDATE_COMPANY', payload: { company: data } });
    },
    [state.company]
  );

  const updatePDV = useCallback(async (id: string, databody: any) => {
    await ApiService.updatePointOfSale({ id, databody });
    dispatch({ type: 'UPDATE_PDV', payload: { pdvCompany: databody } });
  }, []);

  /**
   * Crea un nuevo punto de venta y lo asocia a la empresa en el estado del contexto.
   * @param databody
   */
  const createCompany = useCallback(
    async (databody: RegisterCompany) => {
      const accessToken = window.localStorage.getItem(STORAGE_KEY);
      if (!accessToken) return;

      const token: tokenSchema = jwtDecode(accessToken);
      const { data } = await ApiService.createCompany(databody);
      await ApiService.assignCompanyToUser({ companyId: data.id, userId: token.authId });
      await setUserInformation(accessToken);
      console.log('Company created:', data);
      dispatch({ type: 'UPDATE_COMPANY', payload: { company: data } });
    },
    [setUserInformation]
  );

  const updateProfile = useCallback(async (id: string, databody: any) => {
    await ApiService.updateUser({ id, databody });
    const user = (await ApiService.getUserById(id)).data;
    dispatch({ type: 'LOGIN', payload: { isFirstLogin: user.firstLogin, user } });
  }, []);

  const updateProfileInfo = useCallback(async (id: string, databody: any) => {
    await ApiService.updateUserProfile({ id, databody });
    const user = (await ApiService.getUserById(id)).data;
    dispatch({ type: 'LOGIN', payload: { isFirstLogin: user.firstLogin, user } });
  }, []);

  const createPDV = useCallback(async (databody: any) => {
    const response = await ApiService.createPointOfSale(databody);
    dispatch({ type: 'UPDATE_PDV', payload: { pdvCompany: response.data } });
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  }, []);

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
