// Interfaces para las respuestas del servidor
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  details: {
    message: string;
    acode: number;
    statusCode?: number;
    error?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Tipos para el manejo de errores
export type ErrorAction = 'toast' | 'alert' | 'redirect' | 'silent' | 'modal';

export interface ErrorConfig {
  action: ErrorAction;
  message: string;
  severity?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  redirectUrl?: string;
  autoDismiss?: boolean;
}

// Interface para el contexto de manejo de errores
export interface ErrorHandlerContextProps {
  showError: (config: ErrorConfig) => void;
  showToast: (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;
  showAlert: (message: string, severity?: 'error' | 'warning' | 'info' | 'success') => void;
  clearError: () => void;
}

// Estado del error handler
export interface ErrorHandlerState {
  isVisible: boolean;
  config: ErrorConfig | null;
}
