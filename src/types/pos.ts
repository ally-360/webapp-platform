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
  customer_id: string;
  seller_id: string;
  items: POSLineItemCreate[];
  payments: POSPaymentCreate[];
  notes?: string;
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
