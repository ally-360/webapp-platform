// ========================================
// 💳 PAYMENT RECEIVED TYPES
// ========================================

/**
 * Estado del pago recibido
 */
export type PaymentReceivedStatus = 'active' | 'voided' | 'pending';

/**
 * Método de pago (valores del backend en mayúsculas)
 */
export type PaymentMethod =
  | 'CASH' // Efectivo
  | 'TRANSFER' // Transferencia
  | 'CARD' // Tarjeta
  | 'OTHER'; // Otro

/**
 * Factura asociada al pago
 */
export interface AssociatedInvoice {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_total: number;
  amount_applied: number; // Monto aplicado de este pago a esta factura
}

/**
 * Pago Recibido (Payment Received) - Estructura del backend
 */
export interface PaymentReceived {
  id: string;
  invoice_id?: string; // Factura asociada (si existe)
  bank_account_id?: string;
  contact_id: string; // ID del cliente
  created_by?: string;

  // Datos del pago
  amount: string; // Backend retorna como string
  method: PaymentMethod;
  reference?: string;
  payment_date: string; // YYYY-MM-DD
  notes?: string;

  // Anulación
  is_voided: boolean;
  voided_at?: string;
  voided_by?: string;
  void_reason?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Datos expandidos (agregados por frontend para UX)
  customer_name?: string;
  customer_email?: string;
  invoice_number?: string;
  invoice_total?: number;
  balance_due?: number;
}

/**
 * Filtros para la tabla de pagos recibidos (parámetros del backend)
 */
export interface PaymentReceivedFilters {
  customer_id?: string;
  invoice_id?: string;
  invoice_type?: 'SALE' | 'POS';
  payment_method?: PaymentMethod; // Backend usa 'payment_method' en el GET endpoint
  start_date?: Date | null;
  end_date?: Date | null;
  min_amount?: number;
  max_amount?: number;
  include_voided?: boolean; // Incluir pagos anulados
  page?: number;
  size?: number; // Backend usa 'size' no 'page_size'
  // UI filters
  name?: string; // Para buscar por nombre de cliente
}

/**
 * Request para aplicar pago a múltiples facturas (schema del backend)
 */
export interface AllocatePaymentRequest {
  allocations: {
    invoice_id: string;
    allocated_amount: number; // Backend usa 'allocated_amount' no 'amount_applied'
    notes?: string;
  }[];
}

/**
 * Request para crear pago recibido (schema del backend)
 */
export interface CreatePaymentReceivedRequest {
  invoice_id?: string; // Para pago asociado a factura
  bank_account_id?: string; // Para pago anticipado
  contact_id?: string; // Para pago anticipado (requerido si no hay invoice_id)
  amount: number;
  method: PaymentMethod;
  payment_date: string; // YYYY-MM-DD
  reference?: string;
  notes?: string;
}

/**
 * Request para actualizar pago recibido
 */
export interface UpdatePaymentReceivedRequest extends Partial<CreatePaymentReceivedRequest> {
  id: string;
}

/**
 * Request para anular pago recibido
 */
export interface VoidPaymentReceivedRequest {
  id: string;
  reason: string;
}

/**
 * Respuesta paginada de pagos recibidos
 */
export interface PaymentReceivedListResponse {
  data: PaymentReceived[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Estadísticas de pagos recibidos (respuesta real del backend)
 */
export interface PaymentReceivedStats {
  total_payments: number;
  total_amount: string;
  by_method: Record<
    string,
    {
      count?: number;
      total?: string;
    }
  >;
}
