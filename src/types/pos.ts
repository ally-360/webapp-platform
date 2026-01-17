// ========================================
// 📝 POS API TYPES - Backend Integration
// ========================================

export const CashRegisterStatus = {
  OPEN: 'open',
  CLOSED: 'closed'
} as const;

export const MovementType = {
  SALE: 'sale',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  EXPENSE: 'expense',
  ADJUSTMENT: 'adjustment'
} as const;

export const PaymentMethodType = {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER',
  QR_CODE: 'QR_CODE',
  OTHER: 'OTHER'
} as const;

export type CashRegisterStatusType = (typeof CashRegisterStatus)[keyof typeof CashRegisterStatus];
export type MovementTypeType = (typeof MovementType)[keyof typeof MovementType];
export type PaymentMethodTypeType = (typeof PaymentMethodType)[keyof typeof PaymentMethodType];

// ========================================
// 🏦 CASH REGISTER TYPES
// ========================================

export interface CashRegisterOpen {
  opening_balance: number;
  opening_notes?: string;
}

export interface CashRegisterClose {
  closing_balance: number;
  closing_notes?: string;
}

export interface CashRegister {
  id: string;
  pdv_id: string;
  name: string;
  status: CashRegisterStatusType;
  opening_balance: number;
  closing_balance?: number;
  opened_by: string;
  closed_by?: string;
  opened_at: string;
  closed_at?: string;
  opening_notes?: string;
  closing_notes?: string;
  calculated_balance: number;
  difference?: number;
}

// ========================================
// 💰 CASH MOVEMENT TYPES
// ========================================

export interface CashMovementCreate {
  cash_register_id: string;
  type: MovementTypeType;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface CashMovement {
  id: string;
  cash_register_id: string;
  type: MovementTypeType;
  signed_amount: number;
  reference?: string;
  notes?: string;
  invoice_id?: string;
  created_by: string;
  created_at: string;
}

// ========================================
// 👥 SELLER TYPES
// ========================================
// Nueva arquitectura: Sellers son usuarios del sistema con role='seller', 'admin' o 'owner'
// La tabla sellers solo almacena configuración POS (comisiones, salarios)
// Los datos personales vienen de User + Profile

export interface SellerInvite {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  commission_rate?: number;
  base_salary?: number;
  notes?: string;
}

export interface SellerInviteResponse {
  status: string;
  message: string;
  invitation_id: string;
  expires_at: string;
  user_exists: boolean;
  note?: string;
}

export interface SellerCreate {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  commission_rate?: number;
  base_salary?: number;
  notes?: string;
}

export interface SellerUpdate {
  commission_rate?: number;
  base_salary?: number;
  notes?: string;
  is_active?: boolean;
}

export interface Seller {
  id: string;
  user_id: string | null;

  // Datos del usuario (desde User + Profile)
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string | null;
  document: string | null;

  // Configuración POS
  is_active: boolean;
  commission_rate: number | null;
  base_salary: number | null;
  notes: string | null;

  // Metadata
  role: 'seller' | 'admin' | 'owner';
  is_invitation_pending: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellersResponse {
  sellers: Seller[];
  total: number;
  limit: number;
  offset: number;
}

// ========================================
// 🛒 POS SALE TYPES
// ========================================

export interface POSLineItemCreate {
  product_id: string;
  quantity: number;
  unit_price?: number;
}

export interface POSPaymentCreate {
  method: PaymentMethodTypeType;
  amount: number;
  reference?: string;
  notes?: string;
}

export interface POSInvoiceCreate {
  customer_id: string | null; // UUID del cliente o null para cliente genérico
  seller_id: string;
  items: POSLineItemCreate[];
  payments: POSPaymentCreate[];
  notes?: string;
  invoice_type?: 'pos' | 'electronic' | 'simple'; // ✅ Tipo de factura explícito
}

export interface POSInvoice {
  id: string;
  invoice_number: string;
  number: string;
  issue_date: string;
  created_at: string;
  customer_id: string;
  customer_name: string;
  customer_dni?: string;
  items_count: number;
  line_items: Array<{
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    tax: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payments: Array<{
    method: PaymentMethodTypeType;
    amount: number;
  }>;
  total_paid: number;
  payment_status: 'paid' | 'pending' | 'partial' | 'cancelled';
  seller_id: string;
  seller_name: string;
  pos_type: string;
  pdv_id: string;
  pdv_name: string;
  status: 'PAID' | 'CANCELLED' | 'REFUNDED' | 'PENDING';
}

export interface POSLineItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: any; // From products module
}

export interface POSPayment {
  id: string;
  method: PaymentMethodTypeType;
  amount: number;
  reference?: string;
  notes?: string;
  payment_date: string;
}

// ========================================
// 🪟 SALE WINDOW TYPES (Frontend State Management)
// ========================================

/**
 * Producto en ventana de venta (estado local frontend)
 * Se mapea a POSLineItemCreate al crear la venta
 */
export interface SaleWindowProduct {
  id: string; // product_id del backend
  name: string;
  price: number; // unit_price
  quantity: number;
  sku: string;
  barCode?: string;
  description?: string;
  brand?: string;
  sellInNegative?: boolean;
  tax_rate?: number;
  category?: string;
  stock?: number;
  image?: string;
}

/**
 * Cliente en ventana de venta (estado local frontend)
 */
export interface SaleWindowCustomer {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type?: 'CC' | 'NIT' | 'CE' | 'PP';
}

/**
 * Método de pago en ventana de venta (estado local frontend)
 * Se mapea a POSPaymentCreate al crear la venta
 */
export interface SaleWindowPayment {
  id: string; // ID temporal local (no del backend)
  method: PaymentMethodTypeType;
  amount: number;
  reference?: string;
  notes?: string;
}

/**
 * Estado de una ventana de venta (Tab)
 * Estructura optimizada para sincronización con backend
 */
export interface SaleWindow {
  // Identificadores
  id: number; // ID temporal local (timestamp)
  draft_id?: string; // UUID del draft en backend (cuando se implemente)
  name: string; // "Venta 1", "Venta 2", etc.

  // Datos de la venta
  products: SaleWindowProduct[];
  customer: SaleWindowCustomer | null;
  payments: SaleWindowPayment[];
  seller_id?: string; // UUID del vendedor asignado
  seller_name?: string;

  // Cálculos (calculados en frontend, validados en backend)
  subtotal: number;
  tax_amount: number;
  discount_percentage?: number;
  discount_amount?: number;
  total: number;

  // Estado
  status: 'draft' | 'pending_payment' | 'paid' | 'cancelled';
  created_at: string; // ISO string
  notes?: string;

  // Metadata para sincronización
  last_modified_at?: string; // ISO string
  synced_at?: string; // ISO string - última sincronización con backend
  has_changes?: boolean; // Flag para auto-save
}

/**
 * Request para crear venta completa desde SaleWindow
 * Mapea SaleWindow → POSInvoiceCreate
 */
export interface CreateSaleFromWindowRequest {
  window: SaleWindow;
  pdv_id: string;
}

/**
 * Mapeo de SaleWindow a POSInvoiceCreate
 */
export function mapSaleWindowToPOSInvoiceCreate(window: SaleWindow, seller_id: string): POSInvoiceCreate {
  // Helper function to map payment methods from UI (lowercase) to API (UPPERCASE)
  const mapPaymentMethod = (method: string): PaymentMethodTypeType => {
    const methodMap: Record<string, PaymentMethodTypeType> = {
      cash: 'CASH',
      card: 'CARD',
      nequi: 'TRANSFER',
      transfer: 'TRANSFER',
      credit: 'OTHER',
      other: 'OTHER'
    };
    return methodMap[method.toLowerCase()] || 'OTHER';
  };

  return {
    customer_id: window.customer?.id || null,
    seller_id: window.seller_id || seller_id,
    items: window.products.map((product) => ({
      product_id: product.id,
      quantity: product.quantity,
      unit_price: product.price
    })),
    payments: window.payments.map((payment) => ({
      method: mapPaymentMethod(payment.method),
      amount: payment.amount,
      reference: payment.reference,
      notes: payment.notes
    })),
    notes: window.notes,
    invoice_type: window.customer?.document ? 'electronic' : 'simple'
  };
}

// ========================================
// 📊 SHIFT TYPES
// ========================================

export interface ShiftCurrent {
  id: string;
  pdv_id: string;
  seller_id?: string;
  name: string;
  status: 'open' | 'closed';
  opening_balance: string;
  closing_balance?: string;
  opened_by: string;
  closed_by?: string;
  opened_at: string;
  closed_at?: string;
  opening_notes?: string;
  closing_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShiftClose {
  countedCash: number;
  notes?: string;
}

export interface ShiftHistory {
  register_id: string;
  shift_number: number | null;
  opened_at: string;
  closed_at: string | null;
  duration_minutes: number | null;
  opened_by_name: string;
  closed_by_name: string | null;
  pdv_name: string;
  pdv_id: string;
  opening_balance: string;
  expected_balance: string;
  declared_balance: string | null;
  difference: string | null;
  total_sales: string;
  total_transactions: number;
  status: 'open' | 'closed';
}

export interface ShiftDetail {
  register_id: string;
  shift_number: number | null;
  opened_at: string;
  closed_at: string | null;
  duration_minutes: number | null;
  opened_by_name: string;
  closed_by_name: string | null;
  pdv_name: string;
  pdv_id: string;
  opening_balance: string;
  expected_balance: string;
  declared_balance: string | null;
  difference: string | null;
  physical_cash_count: string | null;
  status: string;
  closing_notes: string | null;
  total_sales: string;
  total_deposits: string;
  total_withdrawals: string;
  total_expenses: string;
  total_adjustments: string;
  total_transactions: number;
  total_invoices: number;
  payment_methods_breakdown: Record<string, string>;
  movements: any[];
  invoices: any[];
}

// ========================================
// 📈 REPORTS TYPES
// ========================================

/**
 * ✅ Estado en tiempo real del turno actual abierto
 * GET /cash-registers/shift/status?pdv_id={pdv_id}
 */
export interface ShiftStatusResponse {
  status: 'open' | 'closed';
  register_id: string;
  pdv_id: string;
  pdv_name: string;
  opened_by_name: string;
  opened_at: string;
  opening_balance: string;
  total_sales: string;
  expected_cash: string;
  total_in_register: string;
  payment_methods_breakdown: Record<string, string>; // Monto directo como string
  top_products: Array<{
    product_name: string; // No incluye cantidad en nombre
    sku: string;
    quantity: number; // Cantidad vendida
    total: string; // Total revenue
  }>;
  total_transactions: number;
  total_invoices: number;
}

/**
 * Reporte diario/cierre de caja completo
 * GET /cash-registers/shift/daily-report?register_id={register_id}
 */
export interface DailyClosingReport {
  register_id: string;
  status: 'open' | 'closed';
  cashier_name: string;
  pdv_name: string;
  opened_at: string;
  closed_at: string | null;
  subtotal: number;
  discounts: number;
  taxes: number;
  total_sold: number;
  items_sold: number;
  invoices_count: number;
  payment_methods_breakdown: Record<
    string,
    {
      count: number;
      amount: number;
    }
  >;
  opening_balance: number;
  expected_cash: number;
  counted_cash: number | null;
  difference: number | null;
  closing_notes: string | null;
  additional_movements: Array<{
    id: string;
    type: string;
    amount: number;
    reference?: string;
    notes?: string;
    created_at: string;
  }>;
}

export interface DailyReport {
  date: string;
  cash_register: CashRegister;
  summary: {
    total_sales: number;
    total_amount: number;
    opening_balance: number;
    closing_balance?: number;
    payments: Record<
      string,
      {
        count: number;
        amount: number;
      }
    >;
    movements: CashMovement[];
  };
}

// ========================================
// 📝 API RESPONSE TYPES
// ========================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size?: number;
  size?: number;
  pages?: number;
  total_pages?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
}

// ========================================
// 🔍 QUERY PARAMS
// ========================================

export interface CashMovementsParams {
  cash_register_id?: string;
  type?: MovementTypeType;
  start_date?: string;
  end_date?: string;
  page?: number;
  size?: number;
}

export interface POSSalesParams {
  start_date?: string; // Fecha inicial del filtro
  end_date?: string; // Fecha final del filtro
  seller_id?: string; // Filtrar por vendedor específico
  limit?: number; // Número máximo de resultados (default: 100, max: 1000)
  offset?: number; // Número de registros a saltar (default: 0)
}

/**
 * Query params para ventas del turno actual
 * GET /pos/sales/shift/sales
 */
export interface ShiftSalesParams {
  pdv_id: string; // ID del punto de venta (requerido)
  limit?: number; // Límite de resultados (default: 100)
  offset?: number; // Offset para paginación (default: 0)
}

export interface ShiftHistoryParams {
  date_from?: string;
  date_to?: string;
  user_id?: string;
  pdv_id?: string;
  status?: 'open' | 'closed';
  page?: number;
  page_size?: number;
  sort_by?: 'opened_at' | 'closed_at';
  sort_order?: 'asc' | 'desc';
}

// ========================================
// 📋 SALE DRAFTS TYPES
// ========================================

/**
 * Item de un borrador de venta
 */
export interface SaleDraftItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  notes?: string;
}

/**
 * Pago de un borrador de venta
 */
export interface SaleDraftPayment {
  method: 'CASH' | 'CARD' | 'TRANSFER' | 'QR_CODE' | 'OTHER';
  amount: number;
  reference?: string;
}

/**
 * Crear nuevo borrador de venta
 * POST /pos/drafts
 */
export interface SaleDraftCreate {
  window_id: string; // ID temporal del frontend
  pdv_id: string;
  shift_id: string; // ID del turno actual
  cash_register_id: string; // ID de la caja registradora
  window_number: number; // Número secuencial de la ventana
  customer_id?: string;
  seller_id?: string;
  items: SaleDraftItem[];
  payments: SaleDraftPayment[];
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total_amount: number;
  notes?: string;
  pos_type?: 'simple' | 'electronic';
  frontend_created_at?: string;
  frontend_modified_at?: string;
}

/**
 * Actualizar borrador de venta existente
 * PATCH /pos/drafts/{draft_id}
 */
export interface SaleDraftUpdate {
  customer_id?: string;
  seller_id?: string;
  items?: SaleDraftItem[];
  payments?: SaleDraftPayment[];
  subtotal?: number;
  tax_total?: number;
  discount_total?: number;
  total_amount?: number;
  notes?: string;
  status?: string; // Backend acepta string, no enum específico
  pos_type?: 'simple' | 'electronic';
  frontend_modified_at?: string;
}

/**
 * Respuesta resumida del listado de borradores
 * GET /pos/drafts
 */
export interface SaleDraftListItem {
  id: string; // UUID del draft
  window_number: number;
  window_name: string;
  customer_name: string | null;
  status: 'active' | 'completed' | 'cancelled';
  total: string; // Decimal como string
  items_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Respuesta paginada del listado de borradores
 */
export interface SaleDraftListResponse {
  items: SaleDraftListItem[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Respuesta detallada de un borrador individual
 * GET /pos/drafts/{draft_id}
 */
export interface SaleDraftResponse {
  id: string; // UUID del draft
  window_id?: string; // ID temporal del frontend (opcional)
  tenant_id: string;
  shift_id: string;
  cash_register_id: string;
  pdv_id: string;
  pdv_name?: string;
  user_id: string;
  window_number: number;
  window_name: string;
  customer_id: string | null;
  customer_name: string | null;
  seller_id?: string;
  seller_name?: string;
  created_by?: string;
  creator_name?: string;
  items: any[]; // Array de items (estructura definida por backend)
  payments?: any[]; // Array de pagos
  subtotal: string; // Decimal como string
  tax: string; // Decimal como string (no tax_total)
  discount_total?: string; // Decimal como string
  total: string; // Decimal como string (no total_amount)
  status: 'active' | 'completed' | 'cancelled';
  notes: string | null;
  pos_type?: 'simple' | 'electronic';
  frontend_created_at?: string;
  frontend_modified_at?: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  invoice_id?: string;
}

/**
 * Parámetros para listar borradores
 * GET /pos/drafts
 */
export interface SaleDraftsParams {
  pdv_id?: string;
  status?: 'active' | 'completed' | 'cancelled';
  customer_id?: string;
  seller_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

/**
 * Completar venta desde borrador
 * POST /pos/drafts/{draft_id}/complete
 */
export interface SaleDraftCompleteRequest {
  // Opcionalmente se pueden sobrescribir datos finales
  customer_id?: string;
  seller_id?: string;
  notes?: string;
  sale_date?: string;
}
