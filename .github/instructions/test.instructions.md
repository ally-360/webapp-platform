# Ally360 Frontend - Development Instructions

## 1. Project Context

**Type:** Single Page Application (SPA) - ERP & POS SaaS Platform

**Purpose:** Complete business operations management system for Colombian SMEs including:
- Multi-tab POS with real-time cash register management
- Sales invoicing with DIAN electronic invoicing compliance
- Payments received and allocation system
- Multi-warehouse inventory management
- Accounting and treasury modules
- Subscriptions and user management

**Code Quality Level:** Production-grade TypeScript application with defined patterns. This is not a demo - maintain compatibility with critical flows (POS, invoicing, cash register/shifts) and existing API integrations.

---

## 2. Tech Stack

### ✅ What IS Used

**Build & Runtime**
- Vite (build tool)
- React 18 with TypeScript
- React Router (lazy-loaded routes)

**UI Framework**
- Material-UI v5 (with Emotion)
- Theme system in `src/theme/*`
- `sx` prop for styling
- Custom components in `src/components/*`

**State Management**
- Redux Toolkit for global state
- RTK Query for server state (`src/redux/services/*`)
- Shared auth-aware base query in `src/redux/services/baseQuery.ts`

**Forms & Validation**
- React Hook Form
- Yup validation
- Form components in `src/components/hook-form/*`

**Internationalization**
- i18next + react-i18next
- Language files in `src/locales/langs/*`
- Browser language detection

**Date Handling**
- date-fns (with Spanish locale)
- MUI X Date Pickers with LocalizationProvider

**Icons**
- Iconify for icon components
- SVG system via `src/components/svg-color/*`

**Notifications**
- notistack (with wrapper in `src/components/snackbar`)

**Authentication**
- JWT context provider (`src/auth/context/jwt/*`)
- Auth guards (`src/auth/guard/*`)
- Token in localStorage with Bearer auth

**Legacy/Parallel Layers** (exists but avoid expanding)
- `src/api/*` (mock/real) - older API layer
- `src/utils/axios.ts` - Axios helper
- Direct `fetch()` in some components (email sending)

### ❌ What IS NOT Used (Do Not Introduce)

- Next.js, Nuxt, or any SSR framework
- Tailwind CSS
- styled-components or other CSS-in-JS besides Emotion
- Vue, Angular, Svelte
- MobX, Zustand, or other state managers
- GraphQL
- Any other form library besides React Hook Form

---

## 3. Architecture Rules

### Module Organization (Feature-Based)

**Primary Structure:**
```
src/sections/<module>/
  ├── components/     # Module-specific UI components
  ├── hooks/         # Custom hooks for business logic
  ├── view/          # Main view components
  └── types/         # TypeScript types (if needed)
```

**Page Structure:**
```
src/pages/<area>/<module>/
  └── index.tsx      # Renders corresponding view from sections/
```

### Routing Rules

- Routes are grouped in `src/routes/sections/*`
- Most routes use `lazy()` with `<Suspense>`
- Protected routes must maintain `AuthGuard` and `StepGuard`
- Path definitions live in `src/routes/paths.tsx`

### Data Layer (RTK Query)

**Primary Pattern:**
- All new API endpoints MUST go in `src/redux/services/*Api.ts`
- Use `baseQueryWithReauth` from `src/redux/services/baseQuery.ts` for auth-aware endpoints
- Define proper TypeScript interfaces for requests/responses
- Use tag-based cache invalidation

**Existing Variations (respect when modifying):**
- Some services use `fetchBaseQuery` directly with `HOST_API` (e.g., `salesInvoicesApi`, `subscriptionsApi`)
- When editing these modules, maintain their existing pattern

**Service Structure:**
```typescript
export const moduleApi = createApi({
  reducerPath: 'moduleApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Resource'],
  endpoints: (builder) => ({
    // endpoints here
  })
});
```

### Redux Slices

- Only for local/UI state, NEVER for HTTP requests
- POS has a large slice (`src/redux/pos/posSlice.ts`) with persistence
- Changes to POS slice require extreme care due to localStorage sync

### Critical Flows (DO NOT BREAK)

1. **JWT Auth Flow**
   - Token injection in headers
   - 401 handling and redirect
   - Company/tenant context from token

2. **POS Multi-Window Flow**
   - Open cash register → manage drafts → complete sale → close shift
   - Draft persistence (localStorage + backend)
   - Multiple sale windows

3. **Existing Routes**
   - All paths in `src/routes/paths.tsx`
   - Lazy-loaded components
   - Guard composition

---

## 4. UI / Visual Identity Rules

### Component Standards

**Use Material-UI v5 exclusively:**
- `Container`, `Card`, `Stack`, `Grid`, `Box`, `Typography`, `Divider`
- `Button`, `TextField`, `Select`, `Dialog`, `Alert`, `Chip`
- MUI X Date Pickers for date inputs

**Styling Approach:**
- Use `sx` prop for styling
- Respect existing theme from `src/theme/*`
- DO NOT introduce inline styles or CSS files for new components

**Shared Components (use when applicable):**
- `CustomBreadcrumbs` for page headers
- `LoadingScreen` for loading states
- `Iconify` for icons
- `SvgColor` for SVG icons
- Form components from `src/components/hook-form/*`

### Layout Patterns

**Standard Page Layout:**
```tsx
<Container maxWidth={settings.themeStretch ? false : 'lg'}>
  <CustomBreadcrumbs
    heading="Page Title"
    links={[...]}
    sx={{ mb: { xs: 3, md: 5 } }}
  />
  
  <Card>
    <CardContent>
      {/* Page content */}
    </CardContent>
  </Card>
</Container>
```

### ⛔ Visual Identity Prohibitions

- DO NOT create new color palettes
- DO NOT modify global theme settings
- DO NOT introduce new spacing systems
- DO NOT redesign existing screens wholesale
- DO NOT add new CSS frameworks (Tailwind, Bootstrap, etc.)

Changes must be surgical and consistent with existing layouts.

---

## 5. i18n Rules

### Translation System

**Current Implementation:**
- react-i18next configured globally
- Language files: `src/locales/langs/es.json`, `src/locales/langs/en.json`
- `useTranslation()` hook available everywhere

### Rules for New Text

**REQUIRED for all new user-facing text:**

1. Add key to language files:
```json
// src/locales/langs/es.json
{
  "module": {
    "action": "Texto en español"
  }
}
```

2. Use in component:
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <Typography>{t('module.action')}</Typography>;
}
```

### ⛔ What NOT to Do

- DO NOT add hardcoded strings in new components
- DO NOT mix `t()` calls with hardcoded strings in the same view
- DO NOT skip i18n "because it's a small text"

**Note:** Some legacy hardcoded strings exist in the project. Do not expand this pattern.

---

## 6. Code Modification Rules

### File Management

1. **Prefer modifying existing files** over creating new ones
2. Only create new files if the module follows that pattern
3. Delete unused code when refactoring
4. Keep file structure consistent with module conventions

### Code Quality

- Maintain TypeScript strictness
- Use existing utility functions (`src/utils/*`)
- Follow naming conventions already in the codebase
- Avoid introducing new abstractions unnecessarily

### Console Logging

- Minimize new `console.log` statements
- Use console logs only for critical debugging
- Many existing logs are present; do not increase noise

### Environment Variables

- `HOST_API` from `VITE_HOST_API` (primary API base)
- `JWTconfig.apiUrl` from `VITE_API_URL` (legacy API layer)
- Check `src/config-global.ts` for available vars

---

## 7. Copilot Behavior Rules

### Implementation Directives

✅ **DO:**
- Apply changes directly when asked to implement
- Complete tasks end-to-end (routing + store + UI + types)
- Use existing patterns from the codebase
- Read relevant files before making changes
- Maintain consistency with surrounding code

❌ **DO NOT:**
- Stop after analysis phase
- Create TODO lists or plans unless explicitly requested
- Ask for permission before using tools
- Create markdown summaries of changes
- "Optimize" by introducing new patterns not in the repo
- Suggest refactoring unless specifically asked

### Work Style

**When asked to implement a feature:**

1. Search for similar implementations in the codebase
2. Use the same patterns (RTK Query service + types + views + routing)
3. Wire everything together (store, routes, navigation)
4. Apply changes directly
5. Verify integration points

**When asked to fix a bug:**

1. Read the relevant files completely
2. Understand the data flow
3. Apply the fix
4. Check related areas that might be affected

**When asked to add an endpoint:**

1. Add to appropriate RTK Query service
2. Define TypeScript interfaces
3. Export hooks
4. Update store configuration if needed

### Response Guidelines

- Be concise
- Provide 1-3 sentence explanations for complex changes
- Show code blocks only when instructive
- Avoid verbose descriptions of what you're about to do

### Multi-Tenant Context

**JWT Payload Contains:**
- `company_id` - Current company (tenant)
- `pdv_id` - Current point of sale location
- `user.role` - User role for RBAC

**Context Usage:**
- Backend validates tenant from token
- Frontend only sends `Authorization: Bearer ${token}`
- DO NOT manually add `company_id` headers or params (backend extracts from token)

### Error Handling

**Global Context:**
- `ErrorHandlerProvider` in `src/contexts/ErrorHandlerContext.tsx`

**RTK Query:**
- Errors automatically shown via notistack
- 401 triggers redirect to login (baseQueryWithReauth)

**API Response Format:**
```typescript
interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    detail?: string;
  };
}
```

### Environment Variables

**Required:**
- `VITE_HOST_API` - Primary API base URL (default: https://api.ally360.co)
- `VITE_API_URL` - Legacy API URL (used by src/api/*)

**Access:**
```typescript
import { HOST_API } from 'src/config-global';
```

---

## 10. Development Workflow Guidelines

### Adding a New Module

1. Create structure in `src/sections/<module>/`
2. Define types in `src/types/<module>.ts` or within module
3. Create RTK Query service in `src/redux/services/<module>Api.ts`
4. Register service in `src/redux/store.ts`
5. Create views in `src/sections/<module>/view/`
6. Create page in `src/pages/dashboard/<module>/`
7. Add routes in `src/routes/sections/dashboard.tsx`
8. Add paths in `src/routes/paths.tsx`
9. Add navigation entry in `src/layouts/dashboard/config-navigation.tsx`
10. Add i18n keys in `src/locales/langs/*.json`

### Modifying an Existing Module

1. Read entire relevant section before changing
2. Understand data flow (Redux → RTK Query → API)
3. Check for usage with file search/semantic search
4. Apply changes maintaining existing patterns
5. Verify integration points (store, routes, navigation)
6. Test related flows (if applicable)

### Debugging API Issues

1. Check Redux DevTools for state
2. Verify endpoint URL and params in Network tab
3. Confirm token in request headers
4. Check API response structure matches TypeScript interface
5. Verify tag-based cache invalidation is correct

### Performance Considerations

- Routes are lazy-loaded; maintain this pattern
- RTK Query provides automatic caching
- Use `useMemo` and `useCallback` judiciously in complex components
- Avoid unnecessary re-renders in POS (critical path)

---

## Appendix: Quick Reference

### Common Hooks

```typescript
// Redux
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

// i18n
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// Routing
import { useRouter } from 'src/routes/hook/use-router';

// Notifications
import { enqueueSnackbar } from 'notistack';
```

### Common Utilities

```typescript
// Currency formatting (Colombian Peso)
import { fCurrency } from 'src/utils/format-number';

// Date formatting
import { fDateTime, fDate } from 'src/utils/format-time';
```

### Standard Page Template

```tsx
import { Container, Card, CardContent } from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { useTranslation } from 'react-i18next';
import { useSettingsContext } from 'src/components/settings';

export default function ModuleView() {
  const settings = useSettingsContext();
  const { t } = useTranslation();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={t('module.title')}
        links={[
          { name: t('dashboard'), href: paths.dashboard.root },
          { name: t('module.name'), href: paths.dashboard.module.root },
          { name: t('current') }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <CardContent>
          {/* Content here */}
        </CardContent>
      </Card>
    </Container>
  );
}
```

---

**Last Updated:** Generated from codebase analysis - January 2026
