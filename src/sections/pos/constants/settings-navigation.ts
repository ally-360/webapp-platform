import { paths } from 'src/routes/paths';

export interface NavigationOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
  action?: () => void;
}

export const createSettingsOptions = (handlers: {
  handleOpenCloseDialog: () => void;
  handleNavigate: (href: string) => void;
}): NavigationOption[] => [
  {
    id: 'close-register',
    title: 'Cerrar Caja',
    description: 'Finalizar jornada',
    icon: 'mdi:cash-register',
    action: handlers.handleOpenCloseDialog
  },
  {
    id: 'sales-history',
    title: 'Historial de Ventas',
    description: 'Ver ventas realizadas',
    icon: 'mdi:receipt',
    route: '/pos/history',
    action: () => handlers.handleNavigate('/pos/history')
  },
  {
    id: 'returns',
    title: 'Devoluciones',
    description: 'Registrar devoluciones',
    icon: 'mdi:swap-horizontal',
    route: '/pos/return',
    action: () => handlers.handleNavigate('/pos/return')
  },
  {
    id: 'daily-report',
    title: 'Reporte Diario',
    description: 'Generar reporte del día',
    icon: 'mdi:chart-line',
    route: '/pos/daily-report',
    action: () => handlers.handleNavigate('/pos/daily-report')
  },
  {
    id: 'inventory',
    title: 'Inventario',
    description: 'Gestionar productos',
    icon: 'mdi:package-variant',
    route: paths.dashboard.inventory.list,
    action: () => handlers.handleNavigate(paths.dashboard.inventory.list)
  },
  {
    id: 'customers',
    title: 'Clientes',
    description: 'Administrar clientes',
    icon: 'mdi:account-group',
    route: paths.dashboard.user.list,
    action: () => handlers.handleNavigate(paths.dashboard.user.list)
  },
  {
    id: 'users',
    title: 'Usuarios',
    description: 'Gestionar usuarios',
    icon: 'mdi:account-multiple',
    route: paths.dashboard.user.list,
    action: () => handlers.handleNavigate(paths.dashboard.user.list)
  },
  {
    id: 'printer-config',
    title: 'Configurar Impresora',
    description: 'Ajustes de impresión',
    icon: 'mdi:printer',
    route: paths.dashboard.pos,
    action: () => handlers.handleNavigate(paths.dashboard.pos)
  }
];
