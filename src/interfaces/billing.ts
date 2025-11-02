// ========================================
// 💳 BILLING INTERFACES - ALLY360
// ========================================

export interface BackendPlan {
  id: string;
  name: string;
  code: string;
  type: string; // Cambiado de union type a string para coincidir con la API
  description: string;
  monthly_price: string;
  yearly_price: string;
  max_users: number;
  max_pdvs: number;
  max_products: number;
  max_storage_gb: number;
  max_invoices_month: number;
  has_advanced_reports: boolean;
  has_api_access: boolean;
  has_multi_currency: boolean;
  has_inventory_alerts: boolean;
  has_email_support: boolean;
  has_phone_support: boolean;
  has_priority_support: boolean;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendSubscription {
  id: string;
  plan_name: string;
  plan_code: string;
  plan_type: string; // Cambiado de union type a string para coincidir con la API
  status: 'trial' | 'active' | 'cancelled' | 'expired' | 'inactive';
  billing_cycle: 'monthly' | 'yearly';
  is_trial: boolean;
  days_remaining: number;
  next_billing_date: string;
  max_users: number;
  max_pdvs: number;
  max_products: number;
  max_storage_gb: number;
  max_invoices_month: number;
  has_advanced_reports: boolean;
  has_api_access: boolean;
  has_multi_currency: boolean;
  has_inventory_alerts: boolean;
}

// Interfaces adaptadas para el componente
export interface UIBillingPlan extends BackendPlan {
  primary?: boolean; // indica si es el plan actual del usuario
  subscription?: string; // alias para code
  price?: number; // precio calculado según billing_cycle
}

// Interface para datos de facturación (mock por ahora)
export interface BillingAddress {
  id: string;
  name: string;
  fullAddress: string;
  phoneNumber: string;
  primary: boolean;
}

export interface PaymentCard {
  id: string;
  cardNumber: string;
  cardType: string;
  primary: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  price: number;
}

// Props para los componentes
export interface AccountBillingProps {
  // No longer needed as props - will fetch directly from API
}

export interface AccountBillingPlanProps {
  plans?: UIBillingPlan[];
  cardList?: PaymentCard[];
  addressBook?: BillingAddress[];
}
