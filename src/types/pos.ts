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
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  OTHER: 'other'
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
  name?: string;
  email?: string;
  phone?: string;
  commission_rate?: number;
  base_salary?: number;
  notes?: string;
  is_active?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  is_active: boolean;
  commission_rate?: number;
  base_salary?: number;
  notes?: string;
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
  pdv_id: string;
  customer_id: string;
  seller_id: string;
  number: string;
  status: string;
  issue_date: string;
  notes?: string;
  currency: string;
  subtotal: string;
  taxes_total: string;
  total_amount: string;
  paid_amount: string;
  balance_due: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  seller_name: string;
  pdv_name: string;
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
  return {
    customer_id: window.customer?.id || null,
    seller_id: window.seller_id || seller_id,
    items: window.products.map((product) => ({
      product_id: product.id,
      quantity: product.quantity,
      unit_price: product.price
    })),
    payments: window.payments.map((payment) => ({
      method: payment.method,
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
  id: string;
  cash_register_id: string;
  start_time: string;
  end_time: string;
  total_sales: number;
  total_amount: number;
  opening_balance: number;
  closing_balance: number;
  difference: number;
  status: 'closed';
}

// ========================================
// 📈 REPORTS TYPES
// ========================================

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
  size: number;
  pages: number;
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

export interface ShiftHistoryParams {
  start_date?: string;
  end_date?: string;
  user_id?: string;
  pdv_id?: string;
  page?: number;
  size?: number;
}
