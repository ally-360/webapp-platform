// routes
// utils
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

/**
 * Decode JWT token for get user information
 * @param token
 * @returns user information
 */
function jwtDecode(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export const getAccessToken = () => {
  const accessToken = window.localStorage.getItem('accessToken');
  return accessToken;
};

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);

  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

// ----------------------------------------------------------------------

/**
 * Set session in localStorage and axios headers for accessToken
 * @param accessToken
 */
export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');

    delete axios.defaults.headers.common.Authorization;
  }
};

/**
 * Set session for company id in localStorage and axios headers for company-id
 * @param companyId
 * @returns
 * @example
 * setSessionCompanyId('company-id');
 */
export const setSessionCompanyId = (companyId: string) => {
  if (companyId) {
    localStorage.setItem('companyId', companyId);

    axios.defaults.headers['company-id'] = companyId;
  } else {
    localStorage.removeItem('companyId');

    delete axios.defaults.headers['company-id'];
  }
};
