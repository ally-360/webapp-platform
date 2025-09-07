# Ally360 — *ERP & POS Frontend*

> **Ally360** es una plataforma *Software‑as‑a‑Service* que pone **"tu empresa a la mano"**: integra facturación electrónica DIAN, inventarios multibodega, POS táctil y analítica en tiempo real para micro, pequeñas y medianas empresas colombianas. 

Ally360 está construida con **React 19**, **TypeScript** y **Material UI v5**, lo que permite una experiencia rápida, accesible y responsiva en múltiples dispositivos. Utiliza **Redux Toolkit** para el manejo eficiente del estado global, **React Router DOM** para la navegación fluida entre vistas, y **React Hook Form** junto con **Yup** para una gestión de formularios validada y optimizada.

**✨ Características principales:**
- 🧮 **POS Táctil Multitabbed**: Sistema de punto de venta con múltiples ventanas simultáneas
- 📊 **Dashboard de Analíticas**: Métricas en tiempo real con gráficos interactivos
- 📋 **Inventario Multibodega**: Gestión avanzada de productos y bodegas
- 🧾 **Facturación DIAN**: Integración completa con facturación electrónica colombiana
- 📱 **Responsive Design**: Optimizado para escritorio, tablet y móvil
- 🔐 **Autenticación JWT**: Sistema seguro de autenticación y autorización
- 🌐 **i18n**: Soporte multiidioma con localización completa

---

## 🛠️ Stack tecnológico

| Categoría         | Tecnologías                     | Versión    |
| ----------------- | ------------------------------- | ---------- |
| **Build & Dev**   | Vite                           | ^5.0.0     |
| **Runtime**       | React + TypeScript             | 19.x + 5.x |
| **UI Framework**  | Material-UI (MUI)              | ^5.15.0    |
| **State Mgmt**    | Redux Toolkit + RTK Query      | ^2.0.0     |
| **Routing**       | React Router DOM               | ^6.20.0    |
| **Forms**         | React Hook Form + Yup          | ^7.48.0    |
| **Charts**        | ApexCharts + Recharts          | Latest     |
| **Date/Time**     | date-fns                       | ^3.0.0     |
| **HTTP Client**   | Axios                          | ^1.6.0     |
| **Styling**       | Emotion + CSS-in-JS            | ^11.11.0   |
| **Icons**         | Iconify                        | ^3.1.0     |
| **Testing**       | Vitest + React Testing Library | Latest     |
| **Quality**       | ESLint + Prettier              | Latest     |

---

## 🚀 Inicio rápido

### Prerrequisitos
- **Node.js** ≥18.0.0
- **Yarn** ≥1.22.0 (recomendado) o npm ≥8.0.0

### Instalación y desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/ally360/pos-front.git
cd pos-front

# 2. Instalar dependencias
yarn install

# 3. Configurar variables de entorno (ver sección Variables de Entorno)
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo
yarn dev
# ➜ Local: http://localhost:5173 (con Hot Module Replacement)
```

### Build para producción

```bash
# Generar build optimizado
yarn build

# Vista previa del build (opcional)
yarn preview

# Análisis del bundle (opcional)
yarn analyze
```

### Scripts disponibles

```bash
yarn dev          # Servidor de desarrollo con HMR
yarn build        # Build optimizado para producción
yarn preview      # Vista previa del build
yarn test         # Ejecutar pruebas con Vitest
yarn test:watch   # Pruebas en modo watch
yarn lint         # Linter con ESLint
yarn lint:fix     # Fix automático de linting
yarn format       # Formatear código con Prettier
yarn type-check   # Verificación de tipos TypeScript
yarn analyze      # Análisis del bundle
```

---

## 🌐 Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
# API Configuration
VITE_HOST_API=https://api.ally360.com
VITE_API_URL=https://api.ally360.com/api
VITE_API_VERSION=v1

# Feature Flags
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_ENABLE_API_MOCKING=false

# Authentication
VITE_JWT_SECRET_KEY=your-jwt-secret-key
VITE_JWT_TIMEOUT=86400000

# External Services
VITE_MAPBOX_API_KEY=your-mapbox-key
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# Environment
VITE_NODE_ENV=development
```

### Variables obligatorias
- `VITE_HOST_API`: URL base de la API
- `VITE_API_URL`: URL completa de la API con path
- `VITE_API_VERSION`: Versión de la API

---

## 🏗️ Arquitectura del proyecto

### Estructura de directorios

```
src/
├── api/                    # Configuración de APIs y servicios
│   ├── mock/              # Datos de prueba y mocking
│   └── services/          # Servicios de la API real
├── auth/                  # Autenticación y autorización
│   ├── context/           # Context API para auth
│   ├── guard/             # Guards de rutas protegidas
│   └── hooks/             # Hooks personalizados de auth
├── components/            # Componentes globales reutilizables
│   ├── animate/           # Componentes de animación
│   ├── chart/             # Componentes de gráficos
│   ├── custom-*/          # Componentes personalizados
│   ├── hook-form/         # Componentes para formularios
│   └── ...
├── hooks/                 # Hooks globales personalizados
├── layouts/               # Layouts principales de la aplicación
│   ├── dashboard/         # Layout del dashboard
│   └── auth/              # Layout de autenticación
├── pages/                 # Páginas principales
├── redux/                 # Estado global con Redux Toolkit
│   ├── slices/            # Slices de estado
│   └── store.ts           # Configuración del store
├── routes/                # Configuración de rutas
├── sections/              # Secciones específicas por módulo
│   ├── pos/               # Módulo de Punto de Venta
│   │   ├── components/    # Componentes específicos del POS
│   │   ├── hooks/         # Hooks específicos del POS
│   │   ├── constants/     # Constantes del POS
│   │   └── view/          # Vistas principales del POS
│   ├── overview/          # Dashboard de analíticas
│   ├── inventory/         # Gestión de inventario
│   └── ...
├── theme/                 # Configuración del tema MUI
├── utils/                 # Utilidades y helpers
└── main.tsx              # Punto de entrada de la aplicación
```

### Patrones arquitectónicos

#### 1. **Modular Architecture**
```typescript
// Cada módulo tiene su propia estructura interna
sections/pos/
├── components/           # UI components específicos
├── hooks/               # Business logic hooks
├── constants/           # Configuraciones estáticas
├── types/              # Tipos TypeScript
└── view/               # Vistas principales
```

#### 2. **Custom Hooks Pattern**
```typescript
// Separación de lógica de negocio y UI
const useProductHandlers = () => {
  const addProduct = useCallback(...);
  const removeProduct = useCallback(...);
  return { addProduct, removeProduct };
};

// En el componente
const ProductList = () => {
  const { addProduct, removeProduct } = useProductHandlers();
  return <div>...</div>;
};
```

#### 3. **Compound Components**
```typescript
// Componentes compuestos para máxima flexibilidad
<PosWindow>
  <PosWindow.Header />
  <PosWindow.ProductList />
  <PosWindow.Totals />
  <PosWindow.Actions />
</PosWindow>
```

---

## 🔄 Gestión de estado

### Redux Toolkit Architecture

```typescript
// Store configuration
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    pos: posSlice.reducer,
    inventory: inventorySlice.reducer,
    analytics: analyticsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});
```

### RTK Query para API calls

```typescript
// API slice example
export const posApi = createApi({
  reducerPath: 'posApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/pos',
    prepareHeaders: (headers, { getState }) => {
      const token = selectAuthToken(getState());
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Product', 'Sale', 'Customer'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], ProductFilters>({
      query: (filters) => ({ url: 'products', params: filters }),
      providesTags: ['Product'],
    }),
  }),
});
```

---

## 🎯 Módulos principales

### 1. **POS (Punto de Venta)**

Sistema completo de punto de venta con capacidades multitabbed:

```typescript
// Hooks principales
- usePosInitialization    // Inicialización del POS
- useTabManagement        // Gestión de múltiples ventanas
- useProductHandlers      // Manejo de productos
- usePaymentHandlers      // Procesamiento de pagos
- useCustomerSelection    // Selección de clientes

// Componentes clave
- PosContainerView        // Vista principal del POS
- PosWindowView           // Ventana individual de venta
- PosBottomTabBar         // Navegación entre ventanas
- ProductGrid             // Grid de productos
- SaleTotals              // Resumen de totales
- PaymentsList            // Lista de pagos
```

**Características del POS:**
- 🔄 **Multitabbed Interface**: Múltiples ventanas de venta simultáneas
- 📱 **Touch Optimized**: Optimizado para pantallas táctiles
- 💰 **Multi-Payment**: Soporte para múltiples métodos de pago
- 🧾 **Receipt Printing**: Impresión de recibos y facturas
- 📊 **Real-time Updates**: Actualizaciones en tiempo real
- 💾 **State Persistence**: Persistencia automática del estado

### 2. **Analytics Dashboard**

Dashboard completo de analíticas empresariales:

```typescript
// Métricas principales
- Ventas por período (día/mes/año)
- Top productos más vendidos
- Análisis de clientes frecuentes
- Comparativas de períodos
- Proyecciones y tendencias

// Gráficos interactivos
- Chart de barras para ventas
- Gráficos de línea para tendencias
- Pie charts para distribución
- Heatmaps para análisis temporal
```

### 3. **Inventory Management**

Sistema avanzado de gestión de inventario:

- **Multi-warehouse**: Soporte para múltiples bodegas
- **Stock tracking**: Seguimiento de inventario en tiempo real
- **Low stock alerts**: Alertas de stock bajo
- **Product variants**: Variantes de productos (talla, color, etc.)
- **Batch operations**: Operaciones en lote

### 4. **DIAN Integration**

Integración completa con facturación electrónica DIAN:

- **Electronic invoicing**: Facturación electrónica oficial
- **Tax calculations**: Cálculo automático de impuestos
- **DIAN compliance**: Cumplimiento normativo colombiano
- **Document management**: Gestión de documentos electrónicos

---

## 📱 Responsive Design

### Breakpoints personalizados (Material-UI)

```typescript
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,      // Mobile portrait
      sm: 600,    // Mobile landscape / Small tablet
      md: 900,    // Tablet
      lg: 1200,   // Desktop
      xl: 1536,   // Large desktop
    },
  },
});
```

### Layout responsivo

- **Mobile First**: Diseño optimizado para móvil primero
- **Progressive Enhancement**: Mejoras progresivas para pantallas grandes
- **Touch Friendly**: Interfaces optimizadas para touch
- **Flexible Grids**: Grids que se adaptan al contenido
- **Responsive Typography**: Tipografía que escala automáticamente

---

## 🔐 Seguridad y autenticación

### JWT Authentication Flow

```typescript
// 1. Login request
const { data } = await loginUser({ email, password });

// 2. Token storage (secure)
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);

// 3. Automatic token refresh
const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  const { data } = await refreshToken({ token: refreshToken });
  updateTokens(data);
};

// 4. Protected route guard
const AuthGuard = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### Características de seguridad

- **JWT Tokens**: Autenticación basada en tokens JWT
- **Route Guards**: Protección de rutas sensibles
- **Role-based Access**: Control de acceso basado en roles
- **Token Refresh**: Renovación automática de tokens
- **Secure Storage**: Almacenamiento seguro de datos sensibles
- **HTTPS Only**: Forzar conexiones HTTPS en producción
- **CSP Headers**: Content Security Policy headers

---

## 🧪 Testing

### Configuración de pruebas

```typescript
// vite.config.js
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/'],
    },
  },
});
```

### Estrategia de testing

- **Unit Tests**: Pruebas unitarias de hooks y utilidades
- **Component Tests**: Pruebas de componentes individuales
- **Integration Tests**: Pruebas de integración de módulos
- **E2E Tests**: Pruebas end-to-end críticas
- **Visual Regression**: Pruebas de regresión visual

### Ejecutar pruebas

```bash
# Todas las pruebas
yarn test

# Pruebas en modo watch
yarn test:watch

# Pruebas con coverage
yarn test:coverage

# Pruebas específicas
yarn test pos
```

---

## ⚡ Optimización y rendimiento

### Code Splitting

```typescript
// Lazy loading de rutas
const PosView = lazy(() => import('../sections/pos/view/pos-container-view'));
const AnalyticsView = lazy(() => import('../sections/overview/overview-analytics-view'));

// Suspense wrapper
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/pos" element={<PosView />} />
    <Route path="/analytics" element={<AnalyticsView />} />
  </Routes>
</Suspense>
```

### Bundle optimization

- **Tree Shaking**: Eliminación de código no usado
- **Code Splitting**: División del código en chunks
- **Dynamic Imports**: Importaciones dinámicas
- **Asset Optimization**: Optimización de imágenes y assets
- **Gzip Compression**: Compresión automática
- **CDN Ready**: Preparado para CDN

### Performance best practices

- **React.memo**: Memorización de componentes
- **useMemo/useCallback**: Memorización de valores y funciones
- **Virtual Scrolling**: Para listas grandes
- **Debouncing**: En campos de búsqueda
- **Image Lazy Loading**: Carga perezosa de imágenes
- **Service Workers**: Para cacheo offline

---

## 🌍 Internacionalización (i18n)

### Soporte multiidioma

```typescript
// Configuración de i18n
import { useLocales } from '../hooks/use-locales';

const Component = () => {
  const { t } = useLocales();
  return <Button>{t('pos.add_product')}</Button>;
};
```

### Idiomas soportados

- **Español (es)**: Idioma principal (Colombia)
- **Inglés (en)**: Idioma secundario
- **Extensible**: Fácil agregar nuevos idiomas

---

## 🚀 Deployment

### Build para producción

```bash
# 1. Build optimizado
yarn build

# 2. Verificar build
yarn preview

# 3. Deploy (ejemplo Vercel)
vercel --prod
```

### Variables de producción

```env
# Production environment
VITE_NODE_ENV=production
VITE_HOST_API=https://api.ally360.com
VITE_ENABLE_REDUX_DEVTOOLS=false
VITE_ENABLE_API_MOCKING=false
```

### Plataformas soportadas

- **Vercel**: Deployment automático (recomendado)
- **Netlify**: Alternativa de deployment
- **AWS S3 + CloudFront**: Para mayor control
- **Docker**: Containerización disponible

---

## 🧪 Pruebas y desarrollo

```bash
# Desarrollo
yarn dev                 # Servidor de desarrollo
yarn test                # Ejecutar pruebas
yarn lint                # Linting del código
yarn type-check         # Verificación de tipos

# Testing
yarn test:watch         # Pruebas en modo watch
yarn test:coverage      # Coverage de pruebas
yarn test:e2e          # Pruebas end-to-end

# Build y deploy
yarn build              # Build de producción
yarn preview           # Preview del build
yarn analyze           # Análisis del bundle
```

---

## 📚 Documentación adicional

### Recursos útiles

- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Guide](https://redux-toolkit.js.org/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Vite Configuration](https://vitejs.dev/config/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Convenciones del proyecto

- **Naming**: camelCase para variables, PascalCase para componentes
- **File Structure**: Estructura modular por características
- **Import Order**: externos → internos → relativos
- **Component Props**: Interfaces explícitas para props
- **State Management**: Redux para estado global, useState para local

---

## 🤝 Contribución

### Flujo de trabajo

1. **Fork** el repositorio
2. **Crear** una rama feature: `git checkout -b feature/amazing-feature`
3. **Commit** cambios: `git commit -m 'feat: add amazing feature'`
4. **Push** a la rama: `git push origin feature/amazing-feature`
5. **Abrir** un Pull Request

### Conventional Commits

```bash
feat: nueva característica
fix: corrección de bug
docs: documentación
style: formateo, missing semicolons, etc
refactor: refactoring de código
test: agregar pruebas
chore: mantenimiento
```

---

## 📜 Licencia

MIT © 2023‑2025 **Ally360**

---

## 📞 Soporte

- **Email**: support@ally360.com
- **Website**: [ally360.com](https://ally360.com)
- **Documentation**: [docs.ally360.com](https://docs.ally360.com)

---

*Desarrollado con ❤️ para la transformación digital de las PYMES colombianas*
