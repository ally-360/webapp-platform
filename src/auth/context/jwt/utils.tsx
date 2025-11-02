// routes
// utils

// ----------------------------------------------------------------------

/**
 * Decode JWT token for get user information
 * @param token
 * @returns user information
 */
function jwtDecode(token: string) {
  try {
    // Validar que el token existe y tiene el formato correcto
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      throw new Error('Invalid token format');
    }

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
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Get access token from local storage
 * @returns access token
 */

export const getAccessToken = () => {
  const accessToken = window.localStorage.getItem('accessToken');
  return accessToken;
};

// ----------------------------------------------------------------------

export const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    // Si jwtDecode retorna null, el token es inválido
    if (!decoded) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

// ----------------------------------------------------------------------

/**
 * Set session in localStorage and axios headers for accessToken
 * @param accessToken
 */
export const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('companyId');
    localStorage.removeItem('refreshToken');
  }
};
