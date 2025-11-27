import { paths } from 'src/routes/paths';

// ========================================
// 🎨 CONFIGURACIONES DE ESTADOS VACÍOS
// ========================================

/**
 * Hook/utilidad para obtener configuraciones de estado vacío
 * según el tipo de entidad que se está mostrando
 */

export interface EmptyStateConfig {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: string;
  };
}

type EntityType =
  | 'products'
  | 'categories'
  | 'brands'
  | 'contacts'
  | 'clients'
  | 'providers'
  | 'invoices'
  | 'bills'
  | 'pdvs'
  | 'users'
  | 'sales'
  | 'orders';

/**
 * Obtiene la configuración de estado vacío según el tipo de entidad
 */
export function getEmptyStateConfig(entityType: EntityType, customContext?: string): EmptyStateConfig {
  const configs: Record<EntityType, EmptyStateConfig> = {
    products: {
      title: 'No tienes productos creados',
      description: 'Comienza agregando tu primer producto para gestionar tu inventario',
      action: {
        label: 'Crear Producto',
        href: paths.dashboard.product.new,
        icon: 'mingcute:add-line'
      }
    },

    categories: {
      title: 'No tienes categorías creadas',
      description: 'Organiza tus productos creando categorías',
      action: {
        label: 'Crear Categoría',
        href: paths.dashboard.product.root, // Se abre modal desde aquí
        icon: 'mingcute:add-line'
      }
    },

    brands: {
      title: 'No tienes marcas registradas',
      description: 'Agrega marcas para clasificar mejor tus productos',
      action: {
        label: 'Crear Marca',
        href: paths.dashboard.product.root, // Se abre modal desde aquí
        icon: 'mingcute:add-line'
      }
    },

    contacts: {
      title: 'No tienes contactos registrados',
      description: 'Agrega clientes y proveedores para gestionar tus relaciones comerciales',
      action: {
        label: 'Crear Contacto',
        href: paths.dashboard.user.new, // Ajustar según la ruta real
        icon: 'mingcute:add-line'
      }
    },

    clients: {
      title: 'No tienes clientes registrados',
      description: 'Comienza agregando tus primeros clientes',
      action: {
        label: 'Crear Cliente',
        href: paths.dashboard.user.new, // Ajustar según la ruta real
        icon: 'mingcute:add-line'
      }
    },

    providers: {
      title: 'No tienes proveedores registrados',
      description: 'Agrega proveedores para gestionar tus compras',
      action: {
        label: 'Crear Proveedor',
        href: paths.dashboard.user.new, // Ajustar según la ruta real
        icon: 'mingcute:add-line'
      }
    },

    invoices: {
      title: 'No tienes facturas registradas',
      description: 'Comienza a facturar tus ventas',
      action: {
        label: 'Nueva Factura',
        href: paths.dashboard.sales.newSale,
        icon: 'mingcute:add-line'
      }
    },

    bills: {
      title: 'No tienes compras registradas',
      description: 'Registra las compras a tus proveedores',
      action: {
        label: 'Nueva Compra',
        href: paths.dashboard.bill.newBill,
        icon: 'mingcute:add-line'
      }
    },

    pdvs: {
      title: 'No tienes puntos de venta configurados',
      description: 'Configura tus puntos de venta para comenzar a operar',
      action: {
        label: 'Crear Punto de Venta',
        href: paths.dashboard.inventory.pdvs,
        icon: 'mingcute:add-line'
      }
    },

    users: {
      title: 'No hay usuarios en tu empresa',
      description: 'Invita colaboradores para trabajar en equipo',
      action: {
        label: 'Invitar Usuario',
        href: paths.dashboard.user.invitations,
        icon: 'mingcute:user-add-line'
      }
    },

    sales: {
      title: 'No hay ventas registradas',
      description: 'Las ventas aparecerán aquí una vez que comiences a vender',
      action: {
        label: 'Ir al POS',
        href: paths.dashboard.pos,
        icon: 'solar:shop-bold'
      }
    },

    orders: {
      title: 'No hay pedidos registrados',
      description: 'Los pedidos de clientes aparecerán aquí',
      action: {
        label: 'Crear Pedido',
        href: paths.dashboard.order.root,
        icon: 'mingcute:add-line'
      }
    }
  };

  const config = configs[entityType];

  // Si hay contexto personalizado (ej: "en esta categoría"), modificar el título
  if (customContext && config) {
    return {
      ...config,
      title: `${config.title} ${customContext}`
    };
  }

  return config;
}

/**
 * Obtiene mensajes de "sin resultados" según filtros aplicados
 */
export function getNoResultsMessage(
  entityType: EntityType,
  filters?: { search?: string; category?: string; status?: string }
): string {
  let entity = 'elementos';

  if (entityType === 'products') {
    entity = 'productos';
  } else if (entityType === 'contacts') {
    entity = 'contactos';
  }

  if (filters?.search) {
    return `No se encontraron ${entity} con "${filters.search}"`;
  }

  if (filters?.category) {
    return `No se encontraron ${entity} en esta categoría`;
  }

  if (filters?.status) {
    return `No se encontraron ${entity} con este estado`;
  }

  return `No se encontraron ${entity}`;
}
