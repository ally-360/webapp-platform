const STORAGE_KEY = 'reset-password';

interface ResetPasswordSession {
  step: number;
  email: string;
  timestamp: number;
}

export function saveResetPasswordSession(data: ResetPasswordSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadResetPasswordSession(): ResetPasswordSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    if (!data.email || !data.timestamp) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export function clearResetPasswordSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isResetCodeExpired(timestamp: number, expirationMinutes = 15) {
  const now = Date.now();
  return now - timestamp > expirationMinutes * 60 * 1000;
}
