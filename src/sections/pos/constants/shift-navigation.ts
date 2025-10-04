export interface ShiftOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  action?: () => void;
}

export const createShiftOptions = (handleNavigate: (href: string) => void): ShiftOption[] => [
  {
    id: 'shift-status',
    title: 'Turno actual',
    description: 'Estado y resumen del turno',
    icon: 'mdi:clock-outline',
    route: '/pos/shift/status',
    action: () => handleNavigate('/pos/shift/status')
  },
  {
    id: 'shift-history',
    title: 'Historial de turnos',
    description: 'Listado de turnos anteriores',
    icon: 'mdi:history',
    route: '/pos/shift/history',
    action: () => handleNavigate('/pos/shift/history')
  },
  {
    id: 'shift-close',
    title: 'Cierre de turno (vista)',
    description: 'Ir a la pantalla de cierre',
    icon: 'mdi:lock-check-outline',
    route: '/pos/shift/close',
    action: () => handleNavigate('/pos/shift/close')
  }
];
