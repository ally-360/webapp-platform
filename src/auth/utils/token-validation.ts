/**
 * Utilidades para validación y manejo de tokens JWT
 */

export interface DecodedToken {
  exp: number;
  iat: number;
  sub: string;
  tenant_id?: string;
  company_id?: string;
  [key: string]: any;
}

/**
 * Decodifica un token JWT sin verificar la firma
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Invalid token format');
      return null;
    }

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Verifica si un token está expirado
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Obtiene el tiempo restante antes de que expire el token (en segundos)
 */
export function getTokenTimeToExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, decoded.exp - currentTime);
}

/**
 * Verifica si el token expirará en los próximos minutos especificados
 */
export function willTokenExpireSoon(token: string, minutesThreshold = 5): boolean {
  const timeToExpiry = getTokenTimeToExpiry(token);
  if (timeToExpiry === null) {
    return true;
  }

  const thresholdSeconds = minutesThreshold * 60;
  return timeToExpiry <= thresholdSeconds;
}

/**
 * Extrae información del token de manera segura
 */
export function getTokenInfo(token: string): {
  isValid: boolean;
  isExpired: boolean;
  willExpireSoon: boolean;
  timeToExpiry: number | null;
  decoded: DecodedToken | null;
} {
  const decoded = decodeToken(token);
  const isValid = decoded !== null;
  const isExpired = isValid ? isTokenExpired(token) : true;
  const willExpireSoon = isValid ? willTokenExpireSoon(token) : true;
  const timeToExpiry = isValid ? getTokenTimeToExpiry(token) : null;

  return {
    isValid,
    isExpired,
    willExpireSoon,
    timeToExpiry,
    decoded
  };
}
