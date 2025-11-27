# 📊 Componente TableNoData - Guía de Uso

## 🎯 Descripción

Componente mejorado para mostrar estados vacíos en tablas con dos variantes:
1. **Sin datos creados**: Muestra botón CTA para crear el primer elemento
2. **Sin resultados por filtros**: Mensaje indicando ajustar filtros

---

## 🚀 Uso Básico

### Ejemplo 1: Tabla de Productos (sin filtros activos = sin productos creados)

```tsx
import { TableNoData } from 'src/components/table';
import { paths } from 'src/routes/paths';

<TableNoData
  notFound={notFound}
  hasFilters={canReset} // true si hay filtros activos
  emptyStateConfig={{
    title: 'No tienes productos creados',
    description: 'Comienza agregando tu primer producto para gestionar tu inventario',
    action: {
      label: 'Crear Producto',
      href: paths.dashboard.product.new,
      icon: 'mingcute:add-line'
    }
  }}
/>
```

### Ejemplo 2: Usando el helper de configuración

```tsx
import { TableNoData, getEmptyStateConfig } from 'src/components/table';

<TableNoData
  notFound={notFound}
  hasFilters={canReset}
  emptyStateConfig={getEmptyStateConfig('products')}
/>
```

---

## 📝 Props del Componente

```typescript
interface TableNoDataProps {
  notFound: boolean;           // true cuando no hay datos
  sx?: object;                 // Estilos personalizados
  text?: string;               // Texto legacy (fallback)
  
  // 🆕 Nuevas props
  hasFilters?: boolean;        // Indica si hay filtros activos
  emptyStateConfig?: {
    title?: string;
    description?: string;
    action?: {
      label: string;
      href: string;
      icon?: string;
    };
  };
}
```

---

## 🎨 Entidades Soportadas

El helper `getEmptyStateConfig` soporta las siguientes entidades:

```typescript
type EntityType =
  | 'products'      // Productos
  | 'categories'    // Categorías
  | 'brands'        // Marcas
  | 'contacts'      // Contactos
  | 'clients'       // Clientes
  | 'providers'     // Proveedores
  | 'invoices'      // Facturas
  | 'bills'         // Compras
  | 'pdvs'          // Puntos de venta
  | 'users'         // Usuarios
  | 'sales'         // Ventas
  | 'orders';       // Pedidos
```

---

## 💡 Ejemplos por Entidad

### Productos
```tsx
<TableNoData
  notFound={!products.length}
  hasFilters={hasActiveFilters}
  emptyStateConfig={getEmptyStateConfig('products')}
/>
```

### Facturas
```tsx
<TableNoData
  notFound={!invoices.length}
  hasFilters={hasActiveFilters}
  emptyStateConfig={getEmptyStateConfig('invoices')}
/>
```

### Usuarios
```tsx
<TableNoData
  notFound={!users.length}
  hasFilters={hasActiveFilters}
  emptyStateConfig={getEmptyStateConfig('users')}
/>
```

---

## 🔄 Lógica de Detección de Filtros

Para detectar si hay filtros activos, usa el patrón:

```tsx
const defaultFilters = {
  name: '',
  status: 'all',
  category: null,
  // ... otros filtros
};

const [filters, setFilters] = useState(defaultFilters);

// Detectar si hay filtros activos
const canReset = !isEqual(defaultFilters, filters);

// Usar en TableNoData
<TableNoData
  notFound={notFound}
  hasFilters={canReset}
  emptyStateConfig={...}
/>
```

---

## 🎨 Personalización

### Configuración Personalizada

```tsx
<TableNoData
  notFound={notFound}
  hasFilters={canReset}
  emptyStateConfig={{
    title: 'Título personalizado',
    description: 'Descripción personalizada',
    action: {
      label: 'Acción Personalizada',
      href: '/ruta/personalizada',
      icon: 'custom:icon' // Iconify icon
    }
  }}
/>
```

### Sin Botón de Acción

```tsx
<TableNoData
  notFound={notFound}
  hasFilters={canReset}
  emptyStateConfig={{
    title: 'No hay datos disponibles',
    description: 'Los datos aparecerán aquí automáticamente'
    // Sin action = sin botón
  }}
/>
```

---

## 🌟 Comportamiento

### Caso 1: Sin items + Sin filtros = Estado vacío con CTA
```
┌─────────────────────────────────────┐
│         [Imagen]                    │
│                                     │
│   No tienes productos creados       │
│   Comienza agregando tu primer...   │
│                                     │
│   [+ Crear Producto]                │
└─────────────────────────────────────┘
```

### Caso 2: Sin resultados + Con filtros = Sin coincidencias
```
┌─────────────────────────────────────┐
│         [Lupa]                      │
│                                     │
│   No se encontraron resultados      │
│   Intenta ajustar los filtros...    │
└─────────────────────────────────────┘
```

---

## 📦 Archivos del Sistema

```
src/components/table/
├── table-no-data.tsx              # Componente principal
├── use-empty-state-config.ts      # Helper con configs
├── index.tsx                       # Exports
└── README.md                       # Esta guía
```

---

## ✅ Checklist de Implementación

Al agregar `TableNoData` a una nueva tabla:

- [ ] Importar `TableNoData` desde `src/components/table`
- [ ] Detectar si hay filtros activos (`canReset`)
- [ ] Configurar `emptyStateConfig` con:
  - [ ] `title` descriptivo
  - [ ] `description` amigable
  - [ ] `action.label` claro
  - [ ] `action.href` correcto
  - [ ] `action.icon` (opcional)
- [ ] Pasar `hasFilters={canReset}`
- [ ] Pasar `notFound` con lógica correcta

---

## 🐛 Troubleshooting

**Problema**: El botón no aparece
- ✅ Verifica que `emptyStateConfig.action` esté definido
- ✅ Verifica que `hasFilters` sea `false`
- ✅ Verifica que `notFound` sea `true`

**Problema**: Siempre muestra "sin resultados"
- ✅ Verifica que `hasFilters` esté calculado correctamente
- ✅ Usa `!isEqual(defaultFilters, filters)` para detectar filtros

**Problema**: El botón va a la ruta incorrecta
- ✅ Verifica las rutas en `src/routes/paths.tsx`
- ✅ Usa el helper `getEmptyStateConfig` para rutas predefinidas

---

## 🎓 Mejores Prácticas

1. **Siempre proporciona descripción**: Ayuda al usuario a entender qué hacer
2. **Usa iconos consistentes**: `mingcute:add-line` para crear, `solar:shop-bold` para ir a otra vista
3. **Verbos de acción claros**: "Crear Producto" mejor que "Agregar"
4. **Detecta filtros correctamente**: Usa `isEqual` para comparar objetos
5. **Mantén mensajes cortos**: Máximo 2 líneas por campo

---

## 📚 Referencias

- [Iconify Icons](https://icon-sets.iconify.design/)
- [Material-UI Empty States](https://mui.com/material-ui/react-list/)
- [UX Patterns - Empty States](https://www.nngroup.com/articles/empty-state-design/)
