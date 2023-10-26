import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
//
// eslint-disable-next-line import/no-extraneous-dependencies
import jwtDecode from 'jwt-decode';
import { AuthCredentials, RegisterUser, getUserResponse, tokenSchema } from 'src/auth/interfaces/userInterfaces';
import { AuthContext } from './auth-context';
import { setSession } from './utils';
import RequestService from '../../../axios/services/service';

// ----------------------------------------------------------------------

// NOTE:
// We only build demo at basic level.
// Customer will need to do some extra handling yourself if you want to extend the logic and other features...

// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
  isFirstLogin: false,
  company: null,
  pdvCompany: null
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    const { isAuthenticated, user, isFirstLogin } = action.payload;
    return {
      ...state,
      loading: false,
      isAuthenticated,
      isFirstLogin,
      user
    };
  }
  if (action.type === 'LOGIN') {
    const { user } = action.payload;
    console.log(user);

    return {
      ...state,
      isAuthenticated: true,
      isFirstLogin: user?.firstLogin || false,
      user
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      isAuthenticated: false
    };
  }
  if (action.type === 'UPDATE_COMPANY') {
    const { company } = action.payload;
    console.log(company);
    return {
      ...state,
      company
    };
  }
  if (action.type === 'UPDATE_PDV') {
    const { pdvCompany } = action.payload;
    return {
      ...state,
      pdvCompany
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      isAuthenticated: false,
      user: null,
      company: null,
      pdvCompany: null,
      isFirstLogin: false,
      loading: false
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = window.localStorage.getItem('accessToken');

      if (accessToken) {
        setSession(accessToken);
        await setUserInformation(accessToken);
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: false,
            user: null,
            isFirstLogin: false
          }
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
          isAuthenticated: false,
          isFirstLogin: false
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const setUserInformation = useCallback(async (accessToken: string): Promise<getUserResponse> => {
    // Desencripta el token y obtiene el usuario por el id
    const token: tokenSchema = jwtDecode(accessToken);
    const user = (await RequestService.fetchGetUserById(token.id)).data;

    if (user.profile?.company?.id) {
      const Setcompany = (await RequestService.getCompanyById(user.profile?.company?.id, true)).data;

      dispatch({
        type: 'UPDATE_COMPANY',
        payload: {
          company: Setcompany
        }
      });

      if (Setcompany.pdvs?.length > 0) {
        const { pdvs } = Setcompany;
        dispatch({
          type: 'UPDATE_PDV',
          payload: {
            pdvCompany: pdvs
          }
        });
      } else {
        dispatch({
          type: 'UPDATE_PDV',
          payload: {
            pdvCompany: null
          }
        });
      }
    }

    dispatch({
      type: 'INITIAL',
      payload: {
        isAuthenticated: true,
        isFirstLogin: user.firstLogin,
        user
      }
    });

    return user;
  }, []);

  // LOGIN
  const login = useCallback(
    async ({ email, password }: AuthCredentials): Promise<void> => {
      const response = await RequestService.fetchLoginUser({
        email,
        password
      });
      setSession(response.data);
      // Set user to redux
      const user = await setUserInformation(response.data);
      dispatch({
        type: 'LOGIN',
        payload: {
          isFirstLogin: user.firstLogin,
          user
        }
      });
    },
    [setUserInformation]
  );

  // REGISTER
  const register = useCallback(async (data: RegisterUser) => {
    const response = await RequestService.fetchRegisterUser(data);

    dispatch({
      type: 'REGISTER'
    });
    return response;
  }, []);

  const updateCompany = useCallback(
    async (databody) => {
      const response = await RequestService.updateCompany({ databody, id: state.company.id });
      dispatch({
        type: 'UPDATE_COMPANY',
        payload: {
          company: response.data
        }
      });
    },
    [state.company]
  );

  const updatePDV = useCallback(async (pdvCompany) => {
    dispatch({
      type: 'UPDATE_PDV',
      payload: {
        pdvCompany
      }
    });
  }, []);

  const createCompany = useCallback(
    async ({ databody }) => {
      const accessToken = window.localStorage.getItem('accessToken');
      const token = jwtDecode(accessToken);
      const response = await RequestService.createCompany({ databody });
      await RequestService.updateProfile({
        id: state.user.profile?.id,
        databody: { company: { id: response.data.id } }
      });
      const user = (await RequestService.fetchGetUserById(token.id)).data;
      state.user = user;

      dispatch({
        type: 'UPDATE_PDV',
        payload: {
          pdvCompany: null
        }
      });

      dispatch({
        type: 'UPDATE_COMPANY',
        payload: {
          company: response.data
        }
      });
    },
    [state]
  );

  // Hace el update del usuario y actualiza el estado del usuario. no del perfil
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
  const logout = useCallback(async () => {
    setSession(null);
    dispatch({
      type: 'LOGOUT'
    });
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

      //
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
