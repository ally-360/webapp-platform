import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
// eslint-disable-next-line import/no-extraneous-dependencies
import jwtDecode from 'jwt-decode';
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';
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
      isFirstLogin: user.firstLogin,
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
      pdvCompany: null
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = window.localStorage.getItem('accessToken');

      if (accessToken) {
        setSession(accessToken);
        const token = jwtDecode(accessToken);
        const userId = token.id;
        const user = (await RequestService.fetchGetUserById({ id: userId })).data;
        state.user = user;
        console.log(user);
        console.log(token);

        if (user.profile?.company?.id) {
          const company = (await RequestService.getCompanyById(user.profile?.company?.id, true)).data;
          console.log(company);
          const Setcompany = company;

          dispatch({
            type: 'UPDATE_COMPANY',
            payload: {
              company: Setcompany
            }
          });

          if (company.pdvs?.length > 0) {
            const SetpdvCompany = company.pdvs;
            dispatch({
              type: 'UPDATE_PDV',
              payload: {
                pdvCompany: SetpdvCompany
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

        console.log(state);

        dispatch({
          type: 'INITIAL',
          payload: {
            isAuthenticated: true,
            isFirstLogin: user.firstLogin,
            user
          }
        });
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

  // LOGIN
  const login = useCallback(async (email, password) => {
    const response = await RequestService.fetchLoginUser({
      databody: {
        email,
        password
      }
    });
    setSession(response.data);
    // Set user to redux
    const token = jwtDecode(response.data);
    console.log(token);
    const user = (await RequestService.fetchGetUserById({ id: token.id })).data;

    if (user.profile?.company?.id) {
      const company = (await RequestService.getCompanyById(user.profile?.company?.id, true)).data;
      const Setcompany = company;

      dispatch({
        type: 'UPDATE_COMPANY',
        payload: {
          company: Setcompany
        }
      });

      if (company.pdvs?.length > 0) {
        const SetpdvCompany = company.pdvs;
        dispatch({
          type: 'UPDATE_PDV',
          payload: {
            pdvCompany: SetpdvCompany
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
      type: 'LOGIN',
      payload: {
        isFirstLogin: user.firstLogin,
        user
      }
    });
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName, tel, dni) => {
    const dniString = dni.toString();
    const response = await RequestService.fetchRegisterUser({
      databody: {
        password,
        profile: {
          name: firstName,
          lastname: lastName,
          email,
          personalPhoneNumber: tel,
          dni: dniString,
          company: { id: null },
          photo:
            'https://img.freepik.com/foto-gratis/hombre-pelo-corto-traje-negocios-que-lleva-dos-registros_549566-318.jpg'
        }
      }
    });

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
      const user = (await RequestService.fetchGetUserById({ id: token.id })).data;
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
      createPDV
    }),
    [
      login,
      logout,
      register,
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
