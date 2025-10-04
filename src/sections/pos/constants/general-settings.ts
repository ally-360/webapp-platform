export interface GeneralSetting {
  id: string;
  label: string;
  defaultValue: boolean;
  description?: string;
}

export const GENERAL_SETTINGS: GeneralSetting[] = [
  {
    id: 'auto-print-tickets',
    label: 'Impresión automática de tickets',
    defaultValue: true,
    description: 'Imprimir automáticamente el ticket después de cada venta'
  },
  {
    id: 'notification-sounds',
    label: 'Sonidos de notificación',
    defaultValue: false,
    description: 'Reproducir sonidos para notificaciones y eventos'
  },
  {
    id: 'confirm-delete',
    label: 'Confirmación antes de eliminar',
    defaultValue: true,
    description: 'Mostrar confirmación antes de eliminar elementos'
  }
];

export const APP_INFO = {
  name: 'Ally360 POS',
  version: '1.0.0',
  description: 'Sistema de Punto de Venta',
  copyright: `© ${new Date().getFullYear()}`
} as const;
