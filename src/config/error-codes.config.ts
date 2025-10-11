import { ErrorConfig } from '../interfaces/api/api-response.interface';

// Mapa de códigos de error internos (acode) a configuraciones de error
export const ERROR_CODE_MAP: Record<number, ErrorConfig> = {
  // Errores de autenticación (100-199)
  100: {
    action: 'toast',
    message: 'Usuario no encontrado, por favor revisa tus credenciales',
    severity: 'error',
    duration: 5000
  },
  101: {
    action: 'toast',
    message: 'Contraseña incorrecta, inténtalo de nuevo',
    severity: 'error',
    duration: 5000
  },
  102: {
    action: 'redirect',
    message: 'Tu sesión ha expirado, serás redirigido al login',
    severity: 'warning',
    redirectUrl: '/auth/login',
    autoDismiss: true
  },
  103: {
    action: 'alert',
    message: 'Usuario no verificado. Por favor verifica tu cuenta antes de continuar',
    severity: 'warning'
  },
  104: {
    action: 'toast',
    message: 'Token de acceso inválido',
    severity: 'error'
  },

  // Errores de autorización (200-299)
  200: {
    action: 'alert',
    message: 'No tienes permisos para realizar esta acción',
    severity: 'error'
  },
  201: {
    action: 'toast',
    message: 'Acceso denegado a este recurso',
    severity: 'error'
  },

  // Errores de validación (300-399)
  300: {
    action: 'toast',
    message: 'Los datos enviados no son válidos',
    severity: 'error'
  },
  301: {
    action: 'alert',
    message: 'Faltan campos obligatorios en el formulario',
    severity: 'warning'
  },
  302: {
    action: 'toast',
    message: 'El formato del email no es válido',
    severity: 'error'
  },
  303: {
    action: 'toast',
    message: 'La contraseña debe tener al menos 8 caracteres',
    severity: 'error'
  },

  // Errores de recursos (400-499)
  400: {
    action: 'toast',
    message: 'El recurso solicitado no fue encontrado',
    severity: 'error'
  },
  401: {
    action: 'alert',
    message: 'El usuario ya existe en el sistema',
    severity: 'warning'
  },
  402: {
    action: 'toast',
    message: 'La empresa solicitada no existe',
    severity: 'error'
  },

  // Errores del servidor (500-599)
  500: {
    action: 'alert',
    message: 'Error interno del servidor. Por favor intenta más tarde',
    severity: 'error'
  },
  501: {
    action: 'toast',
    message: 'El servicio no está disponible temporalmente',
    severity: 'warning'
  },
  601: {
    action: 'toast',
    message: 'Tiempo de espera agotado. Intenta de nuevo',
    severity: 'warning'
  },

  // Errores de business logic (700-799)
  700: {
    action: 'toast',
    message: 'Stock insuficiente para completar la operación',
    severity: 'warning'
  },
  701: {
    action: 'alert',
    message: 'El producto no está disponible',
    severity: 'warning'
  },
  702: {
    action: 'toast',
    message: 'El precio del producto ha cambiado',
    severity: 'info'
  },
  703: {
    action: 'alert',
    message: 'No se puede eliminar el producto, está siendo usado en facturas',
    severity: 'warning'
  },
  704: {
    action: 'toast',
    message: 'El descuento aplicado excede el límite permitido',
    severity: 'error'
  },
  705: {
    action: 'alert',
    message: 'El cliente tiene facturas pendientes de pago',
    severity: 'warning'
  },

  // Errores de mantenimiento (800-899)
  800: {
    action: 'modal',
    message: 'El sistema está en mantenimiento. Intenta más tarde',
    severity: 'info'
  },
  801: {
    action: 'toast',
    message: 'Actualización de sistema requerida. Serás redirigido',
    severity: 'info',
    redirectUrl: '/maintenance'
  },

  // Errores de funcionalidades específicas (900-999)
  900: {
    action: 'toast',
    message: 'Error al procesar el pago',
    severity: 'error'
  },
  901: {
    action: 'alert',
    message: 'Error al generar la factura',
    severity: 'error'
  },
  902: {
    action: 'toast',
    message: 'Error al imprimir el recibo',
    severity: 'warning'
  },
  903: {
    action: 'alert',
    message: 'Error al enviar la factura por email',
    severity: 'warning'
  },
  904: {
    action: 'toast',
    message: 'Error al guardar la venta',
    severity: 'error'
  },
  905: {
    action: 'toast',
    message: 'Error al actualizar el inventario',
    severity: 'error'
  },

  // Errores generales (1000+)
  1000: {
    action: 'toast',
    message: 'Actualización de sistema requerida. Serás redirigido',
    severity: 'error',
    redirectUrl: '/maintenance'
  },
  1100: {
    action: 'alert',
    message: 'Error inesperado del servidor. Contacta al soporte técnico',
    severity: 'error'
  }
};

// Función para obtener la configuración de error
export const getErrorConfig = (acode: number): ErrorConfig =>
  ERROR_CODE_MAP[acode] || {
    action: 'toast',
    message: `Error desconocido (código: ${acode})`,
    severity: 'error',
    duration: 5000
  };
