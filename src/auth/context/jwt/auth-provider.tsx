import PropTypes from 'prop-types';
import React, { useEffect, useReducer, useCallback, useMemo } from 'react';
import jwtDecode from 'jwt-decode';
import {
  AuthCredentials,
  RegisterCompany,
  RegisterUser,
  GetCompanyResponse,
  GetUserResponse,
  UpdateProfile
} from 'src/interfaces/auth/userInterfaces';
import { tokenSchema } from 'src/interfaces/auth/tokenInterface';
import { useSnackbar } from 'notistack';
import { AuthContext } from './auth-context';
import { setSession, setSessionCompanyId } from './utils';
import RequestService from '../../../axios/services/service';

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
    case 'UPDATE_PDV':
      return { ...state, ...action.payload };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }: { readonly children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { enqueueSnackbar } = useSnackbar();

  /**
   * Set user information in context and validate if user has company and set company in context and pdv
   * @param accessToken
   * @example
   * setUserInformation('accessToken');
   */
  const setUserInformation = useCallback(async (accessToken: string): Promise<GetUserResponse> => {
    const token: tokenSchema = jwtDecode(accessToken);
    const { data: user } = await RequestService.fetchGetUserById(token.id);

    setSessionCompanyId(user?.company[0]?.id);

    if (user?.company.length > 0) {
      const { data: pdvForCompany } = await RequestService.getCompanyById(user.company[0].id, true);
      dispatch({
        type: 'UPDATE_COMPANY',
        payload: { company: user.company[0] }
      });
      dispatch({
        type: 'UPDATE_PDV',
        payload: { pdvCompany: pdvForCompany?.pdvs || null }
      });
    }

    return user;
  }, []);
  /**
   * Initialize the context with the user information and validate if the user has a company
   */
  const initialize = useCallback(async () => {
    try {
      const accessToken = window.localStorage.getItem('accessToken');
      if (accessToken) {
        setSession(accessToken);
        const user = await setUserInformation(accessToken);
        dispatch({
          type: 'INITIAL',
          payload: { user, isAuthenticated: true, isFirstLogin: user.firstLogin }
        });
      } else {
        throw new Error('No hay token disponible');
      }
    } catch (error) {
      enqueueSnackbar('No hay token disponible', {
        variant: 'error'
      });
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
          isAuthenticated: false,
          isFirstLogin: false
        }
      });
    }
  }, [setUserInformation, enqueueSnackbar]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  /**
   * Login user and set session in local storage and axios headers
   * @param email
   * @param password
   * @example
   * login({ email: 'email', password: 'password' });
   */
  const login = useCallback(
    async ({ email, password }: AuthCredentials) => {
      const { data } = (await RequestService.fetchLoginUser({ email, password })).data;
      setSession(data.accessToken);
      const user = await setUserInformation(data.accessToken);
      enqueueSnackbar('Bienvenido', { variant: 'success' });
      dispatch({
        type: 'LOGIN',
        payload: { user, isFirstLogin: user.firstLogin }
      });
    },
    [setUserInformation, enqueueSnackbar]
  );

  /**
   * Register user and set session in local storage and axios headers
   */
  const register = useCallback(async (data: RegisterUser) => {
    await RequestService.fetchRegisterUser(data);
    dispatch({ type: 'REGISTER' });
  }, []);

  /**
   * Update company and set company in context state
   * @param databody
   * @example
   * updateCompany({ name: 'name' });
   */
  const updateCompany = useCallback(
    async (databody: UpdateProfile) => {
      const { data } = await RequestService.updateCompany({ databody, id: state.company?.id });
      dispatch({
        type: 'UPDATE_COMPANY',
        payload: { company: data }
      });
    },
    [state.company]
  );

  const updatePDV = useCallback(async (id: string, databody: any) => {
    await RequestService.editPDV({ id, databody });
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
      const { data } = await RequestService.createCompany(databody);
      await RequestService.updateCompanyToUser({ companyId: data.id, userId: token.id });

      await setUserInformation(accessToken);
      dispatch({ type: 'UPDATE_COMPANY', payload: { company: data } });
    },
    [setUserInformation]
  );

  const updateProfile = useCallback(async (id, databody) => {
    await RequestService.updateUser({ id, databody });
    const user = (await RequestService.fetchGetUserById(id)).data;
    dispatch({
      type: 'LOGIN',
      payload: {
        isFirstLogin: user.firstLogin,
        user
      }
    });
  }, []);

  const updateProfileInfo = useCallback(async (id, databody) => {
    await RequestService.updateProfile({ id, databody });
    const user = (await RequestService.fetchGetUserById(id)).data;
    dispatch({
      type: 'LOGIN',
      payload: {
        isFirstLogin: user.firstLogin,
        user
      }
    });
  }, []);

  const createPDV = useCallback(async (databody) => {
    const response = await RequestService.createPDV(databody);
    dispatch({
      type: 'UPDATE_PDV',
      payload: {
        pdvCompany: response.data
      }
    });
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
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
      updateProfile,
      updateProfileInfo,
      state.user,
      status,
      updateCompany,
      state.company,
      state.pdvCompany,
      state.isFirstLogin,
      updatePDV,
      createCompany,
      createPDV
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node
};
