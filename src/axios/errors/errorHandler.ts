export interface CustomError {
  action: 'popup' | 'toast' | 'redirect' | 'silent';
  message: string;
  url?: string;
}

export const errorCodes: Record<string, CustomError> = {
  ERR001: { action: 'popup', message: 'User not found.' },
  ERR002: { action: 'toast', message: 'Invalid input. Please try again.' },
  ERR003: { action: 'redirect', message: 'Session expired. Redirecting to login...', url: '/login' },
  ERR004: { action: 'silent', message: 'Resource not available.' }
};

export const handleErrorCode = (code: string): CustomError =>
  errorCodes[code] || { action: 'toast', message: 'An unknown error occurred.' };
