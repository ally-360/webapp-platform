# modules.md

## 0) Alcance y regla de oro
Este documento describe los módulos funcionales del frontend **exclusivamente** a partir del código existente en este repositorio.

- Fuentes de verdad (frontend):
  - Rutas: `src/routes/sections/dashboard.tsx`, `src/routes/sections/pos.tsx`
  - Paths canónicos: `src/routes/paths.tsx`
  - Navegación lateral: `src/layouts/dashboard/config-navigation.tsx`
  - Servicios HTTP (RTK Query): `src/redux/services/*`
  - Vistas/páginas: `src/pages/**`, `src/sections/**`

## 1) Mapa del frontend (Routing + Navegación)

### 1.1 Rutas raíz registradas
- POS (fuera de dashboard):
  - Base: `/pos/*` en `src/routes/sections/pos.tsx`
- Dashboard:
  - Base: `/dashboard/*` en `src/routes/sections/dashboard.tsx`
  - Onboarding/selección: `/select-business` en `src/routes/sections/dashboard.tsx`

### 1.2 Navegación (sidebar)
Definida en `src/layouts/dashboard/config-navigation.tsx`.

- **Inventario** → `paths.dashboard.inventory.*`
- **POS** → `paths.dashboard.pos.*` (nota: `paths.dashboard.pos.root` apunta a `/pos`)
- **Ventas** → `paths.dashboard.sales.root`, `paths.dashboard.paymentsReceived.root`, `paths.dashboard.debitNotes.root`
- **Gastos** → `paths.dashboard.bill.root`, `paths.dashboard.expenses.purchaseOrders.root`, `paths.dashboard.expenses.debitNotes.root`
- **Contabilidad** → `paths.dashboard.accounting.*`
- **Bancos** → `paths.dashboard.treasury.root`
- **Contactos** → `paths.dashboard.user.list` (el label del menú es “Contactos”, pero la ruta vive bajo `/dashboard/user/*`)

### 1.3 Paths canónicos (helpers)
En `src/routes/paths.tsx` se definen URLs canónicas usadas por el UI.

Ejemplos relevantes:
- POS: `paths.dashboard.pos.root` = `/pos`
- Ventas: `paths.dashboard.sales.details(id)` = `/dashboard/sales/${id}`
- Pagos recibidos: `paths.dashboard.paymentsReceived.details(id)` = `/dashboard/payments-received/${id}`
- Bancos: `paths.dashboard.treasury.root` = `/dashboard/treasury`

Nota importante (Bancos): `paths.dashboard.treasury.accounts/movements/transfers/accountDetails(id)` existen como constantes, pero en el árbol de rutas actual (`src/routes/sections/dashboard.tsx`) solo está registrado `path: 'treasury'` → `src/pages/dashboard/treasury`.

## 2) Infraestructura transversal (cómo “se conecta” todo)

### 2.1 Guards / Layouts
- `AuthGuard` + `StepGuard` envuelven:
  - `/pos/*` (`src/routes/sections/pos.tsx`)
  - `/dashboard/*` y `/select-business` (`src/routes/sections/dashboard.tsx`)
- Layouts:
  - POS: `src/layouts/auth/pos/poslayout`
  - Dashboard: `src/layouts/dashboard`

### 2.2 RTK Query (baseQuery + auth)
- `src/redux/services/baseQuery.ts` define:
  - `baseQueryWithAuth`: agrega `Authorization: Bearer <token>` desde Redux o `localStorage`.
  - `baseQueryWithReauth`: ante `401`, borra token y redirige a `/auth/jwt/login` (con snackbar).

### 2.3 Convención de servicios
- RTK Query services viven en `src/redux/services/*`.
- Hay mezcla de baseQuery:
  - `baseQueryWithReauth` (p.ej. `posApi.ts`, `paymentsReceivedApi.ts`, `treasuryApi.ts`, `productsApi.ts`).
  - `baseQueryWithAuth` (p.ej. `invoicesApi.ts`, `billsApi.ts`, `pdvsApi.ts`).
  - `fetchBaseQuery` con `baseUrl` específico (p.ej. `salesInvoicesApi.ts` usa `${HOST_API}/invoices`).

---

## 3) Módulos (orden de criticidad)

## 3.1 POS (Punto de Venta)

### Rutas
Definidas en `src/routes/sections/pos.tsx`:
- `/pos` (index) → `src/pages/pos/details` (renderiza `PosContainerView`)
- `/pos/list` → `src/pages/pos/list`
- `/pos/cash-register` → `src/pages/pos/shift/status`
- `/pos/history` → `src/pages/pos/history`
- `/pos/sellers` → `src/pages/dashboard/pos/sellers-list`
- Turnos:
  - `/pos/shift/status`, `/pos/shift/open` → `src/pages/pos/shift/status`
  - `/pos/shift/history` → `src/pages/pos/shift/history`
  - `/pos/shift/close` → `src/sections/pos/view/shift-close-view`
  - `/pos/shift/:id` → `src/pages/pos/shift/detail`
- Otras:
  - `/pos/return` → `src/pages/pos/return`
  - `/pos/daily-report` → `src/pages/pos/daily-report`

### Navegación
En `src/layouts/dashboard/config-navigation.tsx`:
- Menú **POS**:
  - “Punto de venta” → `/pos`
  - “Caja” → `/pos/cash-register`
  - “Historial de ventas” → `/pos/history`
  - “Vendedores” → `/pos/sellers`

### Estado local (Redux)
- Slice: `src/redux/pos/posSlice.ts`
  - `currentRegister` (caja/turno actual), `salesWindows` (multitab), `completedSales`.
  - Campos de sincronización por ventana: `draft_id`, `synced`, `synced_at`, `sync_error`.

### Hooks POS (lógica de negocio)
Carpeta: `src/sections/pos/hooks/*`

- `useCashRegister` (`src/sections/pos/hooks/useCashRegister.ts`)
  - Abre/cierra caja usando `posApi`.
  - También lista PDVs (`pdvsApi`) y vendedores (`posApi.getSellers`).
- `useSyncCashRegister` (`src/sections/pos/hooks/useSyncCashRegister.ts`)
  - Sincroniza caja actual desde backend vía `useGetCurrentCashRegisterQuery(pdvId)`.
- `useSaleDraftsLoader` (`src/sections/pos/hooks/useSaleDraftsLoader.ts`)
  - Carga drafts activos del backend al iniciar (si caja abierta):
    - `useLazyGetSaleDraftsQuery` → lista
    - `useLazyGetSaleDraftQuery` → detalle
    - Mapea a ventanas con `addSaleWindowFromDraft`.
- `useCreateWindowWithDraft` (`src/sections/pos/hooks/useCreateWindowWithDraft.ts`)
  - Crea ventana local (`addSaleWindow`) y crea draft remoto inmediatamente (`useCreateSaleDraftMutation`).
- `useSaleWindowSync` (`src/sections/pos/hooks/useSaleWindowSync.ts`)
  - Auto-save con debounce:
    - Si no hay `draft_id` → `useCreateSaleDraftMutation`
    - Si hay `draft_id` → `useUpdateSaleDraftMutation`
- `useSaleCompletion` (`src/sections/pos/hooks/useSaleCompletion.ts`)
  - Completa la venta:
    - `useCreatePOSSaleMutation`
    - Luego intenta borrar el draft con `useDeleteSaleDraftMutation`.

### Servicio RTK Query (POS)
Archivo: `src/redux/services/posApi.ts`

**Caja / turnos**
- `POST /cash-registers/open?pdv_id={pdv_id}`
- `POST /cash-registers/{id}/close`
- `GET /cash-registers`
- `GET /cash-registers/{id}`
- `GET /cash-registers/current?pdv_id={pdv_id}`
- `GET /cash-registers/{register_id}/closing-summary`

**Movimientos de caja**
- `POST /cash-movements`
- `GET /cash-movements`

**Vendedores**
- `POST /sellers/invite`
- `POST /sellers` (legacy)
- `GET /sellers` (usa `limit`, `offset`, `active_only`)
- `GET /sellers/{id}`
- `PATCH /sellers/{id}`
- `DELETE /sellers/{id}`

**Ventas POS**
- `POST /pos/sales?pdv_id={pdv_id}`
- `GET /pos/sales/`
- `GET /pos/sales/{id}`
- `POST /pos/sales/{id}/cancel`
- `POST /pos/sales/{id}/credit-note`
- `GET /pos/sales/{id}/receipt`

**Shifts / reportes**
- `GET /cash-registers/shifts/history`
- `GET /cash-registers/shifts/{register_id}/detail`
- `GET /cash-registers/shift/status?pdv_id={pdv_id}`
- `GET /cash-registers/shift/daily-report?register_id={register_id}`
- `GET /pos/sales/shift/sales`
- `GET /pos/reports/daily?date=YYYY-MM-DD`
- `GET /pos/shift/{id}/report`

**Drafts (persistencia multitab)**
- `POST /pos/drafts`
- `GET /pos/drafts`
- `GET /pos/drafts/{draft_id}`
- `PATCH /pos/drafts/{draft_id}`
- `DELETE /pos/drafts/{draft_id}`
- `POST /pos/drafts/{draft_id}/complete`
- `POST /pos/drafts/cleanup`

---

## 3.2 Ventas (Facturas de venta)

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'sales'`):
- `/dashboard/sales` (index) → `src/pages/dashboard/sales/invoice/list`
- `/dashboard/sales/new-sale` → `src/pages/dashboard/sales/invoice/new`
- `/dashboard/sales/:id` → `src/pages/dashboard/sales/invoice/details`
- `/dashboard/sales/:id/edit` → `src/pages/dashboard/sales/invoice/edit`

### Navegación
En `src/layouts/dashboard/config-navigation.tsx`:
- “Ventas” → “Facturas de venta” (`paths.dashboard.sales.root`) con `openPopup()` que navega a `paths.dashboard.sales.newSale`.

### UI (páginas/vistas)
- Páginas:
  - `src/pages/dashboard/sales/invoice/list.tsx` → `InvoiceListView`
  - `src/pages/dashboard/sales/invoice/details.tsx` → `InvoiceDetailsView`
  - `src/pages/dashboard/sales/invoice/new.tsx` / `edit.tsx` → formularios
- Componentes destacados:
  - `src/sections/sales/invoice/invoice-payment-dialog.tsx` (pago sobre factura)

### Servicio principal observado (SalesInvoices)
Archivo: `src/redux/services/salesInvoicesApi.ts` (baseUrl: `${HOST_API}/invoices`)

Endpoints (tal como están definidos en ese service):
- `GET ${HOST_API}/invoices` (usa params e incluye `type: 'sale'`, `offset`, `limit`)
- `GET ${HOST_API}/invoices/{id}`
- `POST ${HOST_API}/invoices`
- `PATCH ${HOST_API}/invoices/{id}`
- `DELETE ${HOST_API}/invoices/{id}`
- `POST ${HOST_API}/invoices/{id}/confirm`
- `POST ${HOST_API}/invoices/{id}/cancel`
- `POST ${HOST_API}/invoices/{id}/payments`
- `GET ${HOST_API}/invoices/{id}/payments`
- `GET ${HOST_API}/invoices/{id}/pdf`
- `POST ${HOST_API}/invoices/{id}/send-email`
- `GET ${HOST_API}/invoices/reports/summary`
- `GET ${HOST_API}/invoices/next-number/{pdvId}`
- `GET ${HOST_API}/invoices/reports/monthly-status?year={year}&month={month}`
- `GET ${HOST_API}/invoices/pending-by-customer/{customer_id}`

### Servicio alterno existente (Invoices genérico)
Archivo: `src/redux/services/invoicesApi.ts` (baseUrl: `${HOST_API}` y rutas `/invoices/*`)

Endpoints:
- `GET /invoices`
- `GET /invoices/{id}`
- `POST /invoices`
- `PUT /invoices/{id}`
- `DELETE /invoices/{id}`
- `POST /invoices/{id}/confirm`
- `POST /invoices/{id}/cancel`
- `POST /invoices/{invoiceId}/payments`
- `GET /invoices/{invoiceId}/payments`
- `GET /invoices/{invoiceId}/pdf`
- `POST /invoices/{invoiceId}/send-email`
- `GET /invoices/reports/summary`
- `GET /invoices/next-number/{pdvId}`

---

## 3.3 Pagos recibidos

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'payments-received'`):
- `/dashboard/payments-received` (index) → `src/pages/dashboard/payments-received/list`
- `/dashboard/payments-received/new` → `src/pages/dashboard/payments-received/new`
- `/dashboard/payments-received/:id` → `src/pages/dashboard/payments-received/details`
- `/dashboard/payments-received/:id/edit` → `src/pages/dashboard/payments-received/edit`

### Navegación
En `src/layouts/dashboard/config-navigation.tsx`:
- “Ventas” → “Pagos recibidos” (`paths.dashboard.paymentsReceived.root`) con `openPopup()` que navega a `paths.dashboard.paymentsReceived.new`.

### Servicio RTK Query
Archivo: `src/redux/services/paymentsReceivedApi.ts`

Endpoints:
- `GET /payments/` (con querystring construido desde filtros)
- `GET /payments/{payment_id}`
- `POST /payments/`
- `PUT /payments/{payment_id}`
- `POST /payments/{payment_id}/void`
- `DELETE /payments/{payment_id}`
- `GET /payments/summary/stats`
- `POST /payments/{payment_id}/allocate`
- `POST /payments/{payment_id}/email` (en el código está marcado como “TODO: Backend aún no implementado”)

---

## 3.4 Bancos (Tesorería)

### Rutas
En `src/routes/sections/dashboard.tsx`:
- `/dashboard/treasury` → `src/pages/dashboard/treasury` (único entry registrado en el árbol actual).

En `src/routes/paths.tsx` existen helpers adicionales:
- `/dashboard/treasury/accounts`
- `/dashboard/treasury/movements`
- `/dashboard/treasury/transfers`
- `/dashboard/treasury/accounts/{id}`

### Navegación
En `src/layouts/dashboard/config-navigation.tsx`:
- “Bancos” → `paths.dashboard.treasury.root`

### UI (implementación actual observada)
- Página: `src/pages/dashboard/treasury/index.tsx` → `TreasuryView`
- Vista: `src/sections/treasury/view/treasury-view.tsx`
  - Carga cuentas vía `useGetAccountsQuery`.
  - Componentes: `src/sections/treasury/components/treasury-summary-cards.tsx`, `treasury-accounts-table.tsx`.

### Servicio RTK Query
Archivo: `src/redux/services/treasuryApi.ts`

Accounts / balances
- `GET /treasury/accounts`
- `GET /treasury/accounts/{id}`
- `POST /treasury/accounts`
- `PUT /treasury/accounts/{id}`
- `GET /treasury/accounts/balances`

Movements
- `GET /treasury/movements`
- `GET /treasury/movements/{id}`
- `POST /treasury/movements`
- `POST /treasury/movements/{id}/void`
- `POST /treasury/movements/{id}/reverse`
- `GET /treasury/movements/by-source`
- `POST /treasury/movements/validate`
- `GET /treasury/movements/{id}/journal-entry`

Transfers
- `POST /treasury/transfers`

Reports
- `GET /treasury/reports/summary`
- `GET /treasury/reports/account-balance/{accountId}`

Catalogs / lookups
- `GET /treasury/catalogs`
- `GET /treasury/accounts/lookup`
- `GET /treasury/accounts/available-for-operation`
- `GET /treasury/accounts/{accountId}/summary`

---

## 3.5 Inventario

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'inventory'`):
- `/dashboard/inventory` (index) → `src/pages/dashboard/product/list`
- `/dashboard/inventory/list` → `src/pages/dashboard/product/list`
- `/dashboard/inventory/new-product` → `src/pages/dashboard/product/new`
- `/dashboard/inventory/categories` → `src/pages/dashboard/categories/list`
- `/dashboard/inventory/pdvs` → `src/pages/dashboard/pdvs/list`
- `/dashboard/inventory/brands` → `src/pages/dashboard/brands/list`

### Navegación
En `src/layouts/dashboard/config-navigation.tsx`:
- “Inventario” con children:
  - Productos → listado (`/dashboard/inventory`) y `openPopup()` navega a `paths.dashboard.inventory.newProduct`
  - Categorías → `openPopup()` abre popup (`categoriesSlice.switchPopupState(true)`)
  - Marcas → `openPopup()` abre popup (`brandsSlice.switchPopupState(true)`)
  - Puntos de venta → `openPopup()` abre popup (`pdvsSlice.switchPopup(true)`)

### Servicios RTK Query (Inventario)

**Productos** (`src/redux/services/productsApi.ts`)
- `GET /products/` (querystring por filtros)
- `GET /products/{id}`
- `POST /products/simple`
- `PATCH /products/{id}`
- `DELETE /products/{id}`
- `POST /products/{id}/taxes`
- `PATCH /products/{id}/stock/{pdvId}/min-quantity`

**Categorías** (`src/redux/services/categoriesApi.ts`)
- `GET /categories`
- `GET /categories/{id}`
- `POST /categories`
- `PATCH /categories/{id}`
- `DELETE /categories/{id}`
- `GET /categories/{id}/products`

**Marcas** (`src/redux/services/brandsApi.ts`)
- `GET /brands`
- `GET /brands/{id}`
- `POST /brands`
- `PUT /brands/{id}`
- `DELETE /brands/{id}`
- `GET /brands/{id}/products`

**PDVs** (`src/redux/services/pdvsApi.ts`)
- `GET /pdvs/`
- `GET /pdvs/{id}`
- `POST /pdvs/`
- `PATCH /pdvs/{id}`
- `DELETE /pdvs/{id}`

**Catálogos (read-only, utilitario)** (`src/redux/services/catalogApi.ts`)
- `GET /taxes`
- `GET /pdvs`
- `GET /categories`
- `GET /brands`

### Uploads (Staged Uploads) usados por Inventario
Servicio: `src/redux/services/uploadsApi.ts`

Endpoints:
- `POST /uploads/presign`
- `POST /uploads/confirm`
- `GET /uploads/{id}`
- `GET /uploads` (con querystring por filtros)
- `PATCH /uploads/{id}`
- `DELETE /uploads/{id}`

Nota de flujo (según el comentario del service): el upload real del archivo ocurre con `fetch` nativo hacia la URL presignada, no con RTK Query.

---

## 4) Módulos de soporte (presentes en rutas y/o services)

## 4.1 Gastos (Facturas de compra / Bills)

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'bill'`):
- `/dashboard/bill` → `src/pages/dashboard/bill/invoice/list`
- `/dashboard/bill/new-bill` → `src/pages/dashboard/bill/invoice/new`
- `/dashboard/bill/:id` → `src/pages/dashboard/bill/invoice/details`
- `/dashboard/bill/:id/edit` → `src/pages/dashboard/bill/invoice/edit`

Rutas “provide” (mismas páginas):
- `/dashboard/bill/provide`
- `/dashboard/bill/new-provide`
- `/dashboard/bill/provide/:id`
- `/dashboard/bill/provide/:id/edit`

### Servicio RTK Query
Archivo: `src/redux/services/billsApi.ts`

Purchase Orders
- `GET /bills/purchase-orders/`
- `GET /bills/purchase-orders/{id}`
- `POST /bills/purchase-orders/`
- `PATCH /bills/purchase-orders/{id}`
- `POST /bills/purchase-orders/{id}/convert-to-bill`
- `POST /bills/purchase-orders/{id}/void`

Bills
- `GET /bills/`
- `GET /bills/{id}`
- `POST /bills/`
- `PATCH /bills/{id}`
- `POST /bills/{id}/void`
- `GET /bills/monthly-summary/{year}/{month}`

Bill payments
- `POST /bills/{billId}/payments`
- `GET /bills/{billId}/payments`
- `GET /bills/bill-payments/`
- `DELETE /payments/{paymentId}` (nota: endpoint de borrado cuelga de `/payments/*` en este service)

Debit notes (asociadas a bills)
- `GET /bills/debit-notes/`
- `GET /bills/debit-notes/{id}`
- `POST /bills/debit-notes/`
- `POST /bills/debit-notes/{id}/void`

Otros
- `POST /bills/{billId}/send-email` (multipart/form-data)

---

## 4.2 Notas débito (módulo en dashboard)

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'debit-notes'`):
- `/dashboard/debit-notes` → `src/pages/dashboard/debit-notes/list`
- `/dashboard/debit-notes/new` → `src/pages/dashboard/debit-notes/new`
- `/dashboard/debit-notes/:id` → `src/pages/dashboard/debit-notes/details`
- `/dashboard/debit-notes/:id/edit` → `src/pages/dashboard/debit-notes/edit`

### Servicio RTK Query
Archivo: `src/redux/services/debitNotesApi.ts`

Endpoints:
- `GET /debit-notes/`
- `GET /debit-notes/{id}`
- `POST /debit-notes/`
- `PUT /debit-notes/{id}`
- `POST /debit-notes/{id}/void`
- `DELETE /debit-notes/{id}`
- `GET /debit-notes/{id}/journal-entry`

Nota: también existe debit note para compras dentro de `billsApi.ts` bajo `/bills/debit-notes/*`.

---

## 4.3 Gastos (Órdenes de compra / Debit notes bajo /expenses)

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'expenses'`):
- `/dashboard/expenses/purchase-orders/*` (list/new/:id/:id/edit) → `src/pages/dashboard/expenses/purchase-orders*`
- `/dashboard/expenses/debit-notes/*` (list/new) → `src/pages/dashboard/expenses/debit-notes*`

(El service HTTP específico para estas páginas depende de la implementación en esas vistas; el repositorio sí contiene endpoints de purchase orders y debit notes en `src/redux/services/billsApi.ts`.)

---

## 4.4 Contabilidad

### Rutas
En `src/routes/sections/dashboard.tsx`:
- `/dashboard/accounting/chart-of-accounts` → `src/pages/dashboard/accounting/chart-of-accounts`
- `/dashboard/accounting/chart-of-accounts/mappings` → `src/pages/dashboard/accounting/chart-of-accounts-mappings`
- `/dashboard/accounting/chart-of-accounts/import` → `src/pages/dashboard/accounting/chart-of-accounts-import`
- Páginas de diario declaradas (lazy imports):
  - `src/pages/dashboard/accounting/journal-list`
  - `src/pages/dashboard/accounting/journal-entry-editor`
  - `src/pages/dashboard/accounting/journal-entry-detail`
  - `src/pages/dashboard/accounting/journal-reversal`

### Servicio RTK Query
Archivo: `src/redux/services/accountingApi.ts`

Accounts
- `GET /accounting/accounts`
- `GET /accounting/accounts/{id}`
- `POST /accounting/accounts`
- `PUT /accounting/accounts/{id}`
- `DELETE /accounting/accounts/{id}`

Journal entries
- `GET /accounting/journal-entries`
- `GET /accounting/journal-entries/{id}`
- `GET /accounting/catalogs`

Cost centers
- `GET /accounting/cost-centers`
- `GET /accounting/cost-centers/{id}`
- `POST /accounting/cost-centers`
- `PATCH /accounting/cost-centers/{id}`
- `DELETE /accounting/cost-centers/{id}`

---

## 4.5 Usuarios / Perfil / Empresa (y “Contactos” en menú)

### Rutas
En `src/routes/sections/dashboard.tsx` (subárbol `path: 'user'`):
- `/dashboard/user` (index) → `src/pages/dashboard/user/profile`
- `/dashboard/user/profile`
- `/dashboard/user/cards`
- `/dashboard/user/list`
- `/dashboard/user/new`
- `/dashboard/user/:id/edit`
- `/dashboard/user/account`

### Servicios RTK Query

**Perfil/empresa/invitaciones** (`src/redux/services/userProfileApi.ts`)
- `PATCH /auth/me`
- `POST /auth/me/avatar`
- `GET /auth/me/avatar`
- `GET /auth/invitations`
- `POST /auth/invite-user`
- `POST /auth/accept-invitation`
- `GET /auth/invitation/{token}`
- `POST /auth/accept-invitation/existing`
- `GET /auth/company/users`
- `PATCH /company/me`
- `POST /company/me/logo`
- `GET /company/me/logo`
- `GET /company/me`

**Contactos** (`src/redux/services/contactsApi.ts`)
- `GET /contacts/`
- `GET /contacts/{id}`
- `POST /contacts/`
- `PUT /contacts/{id}`
- `DELETE /contacts/{id}`
- `POST /contacts/{id}/restore`
- `GET /contacts/clients/for-invoices`
- `GET /contacts/providers/for-bills`

---

## 4.6 Autenticación

Servicio: `src/redux/services/authApi.ts`

Endpoints (en el fragmento leído):
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/verify-email`
- `GET /auth/verify-email?token=...&auto_login=...`
- `POST /auth/logout` (declarado en el archivo, más abajo)

Nota: el manejo global de `401` (expiración de sesión) está en `src/redux/services/baseQuery.ts`.

---

## 4.7 Suscripciones / Planes

Servicio: `src/redux/services/subscriptionsApi.ts`

Planes
- `GET /subscriptions/plans`
- `GET /subscriptions/plans/{planId}`

Suscripciones
- `GET /subscriptions/current`
- `GET /subscriptions/`
- `POST /subscriptions/`
- `GET /subscriptions/{id}`
- `PATCH /subscriptions/{id}`
- `POST /subscriptions/{id}/cancel`
- `POST /subscriptions/{id}/reactivate`
- `GET /subscriptions/stats/current`

Usuario
- `PATCH /auth/me/first-login`
