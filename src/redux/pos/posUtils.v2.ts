// ========================================
// 🛠️ POS UTILITIES V2 - Backend Integration Helpers
// ========================================

import type { SaleWindow, SaleWindowPayment } from 'src/types/pos';

// ========================================
// 💰 PAYMENT CALCULATIONS
// ========================================

/**
 * Calcula el monto restante a pagar en una ventana
 */
export function getRemainingAmount(window: SaleWindow): number {
  const totalPaid = window.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.max(0, window.total - totalPaid);
}

/**
 * Calcula el vuelto (cambio) en una ventana
 */
export function getChange(window: SaleWindow): number {
  const totalPaid = window.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.max(0, totalPaid - window.total);
}

/**
 * Verifica si todos los pagos están completos
 */
export function isFullyPaid(window: SaleWindow): boolean {
  const totalPaid = window.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return totalPaid >= window.total && window.total > 0;
}

// ========================================
// ✅ VALIDATION
// ========================================

/**
 * Verifica si una ventana puede ser cerrada (completada)
 */
export function canCloseSaleWindow(window: SaleWindow): boolean {
  return (
    window.products.length > 0 && // Tiene productos
    window.total > 0 && // Total mayor a 0
    isFullyPaid(window) // Pagos completos
  );
}

/**
 * Verifica si una ventana tiene cambios sin sincronizar
 */
export function hasUnsyncedChanges(window: SaleWindow): boolean {
  return window.has_changes === true;
}

/**
 * Verifica si se necesita factura electrónica
 */
export function needsElectronicInvoice(window: SaleWindow): boolean {
  return Boolean(window.customer?.document);
}

// ========================================
// 🔄 DATA TRANSFORMATION
// ========================================

/**
 * Agrupa pagos por método
 */
export function groupPaymentsByMethod(payments: SaleWindowPayment[]): Record<
  string,
  {
    count: number;
    total: number;
    payments: SaleWindowPayment[];
  }
> {
  return payments.reduce(
    (acc, payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = {
          count: 0,
          total: 0,
          payments: []
        };
      }
      acc[payment.method].count += 1;
      acc[payment.method].total += payment.amount;
      acc[payment.method].payments.push(payment);
      return acc;
    },
    {} as Record<
      string,
      {
        count: number;
        total: number;
        payments: SaleWindowPayment[];
      }
    >
  );
}

/**
 * Obtiene resumen de pagos
 */
export function getPaymentSummary(window: SaleWindow) {
  const grouped = groupPaymentsByMethod(window.payments);
  const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = getRemainingAmount(window);
  const change = getChange(window);

  return {
    total: window.total,
    totalPaid,
    remaining,
    change,
    byMethod: grouped
  };
}

// ========================================
// 🏷️ WINDOW NAMING
// ========================================

/**
 * Genera nombre para nueva ventana
 */
export function generateWindowName(existingWindows: SaleWindow[]): string {
  const windowNumber = existingWindows.length + 1;
  return `Venta ${windowNumber}`;
}

/**
 * Sugiere nombre para ventana basado en cliente
 */
export function suggestWindowName(window: SaleWindow): string {
  if (window.customer) {
    const firstName = window.customer.name.split(' ')[0];
    return `${firstName} - ${window.products.length} productos`;
  }
  if (window.products.length > 0) {
    return `${window.products.length} productos`;
  }
  return window.name;
}

// ========================================
// 📊 STATISTICS
// ========================================

/**
 * Calcula estadísticas de una ventana
 */
export function getWindowStatistics(window: SaleWindow) {
  const totalItems = window.products.reduce((sum, p) => sum + p.quantity, 0);
  const uniqueProducts = window.products.length;
  const averagePrice = uniqueProducts > 0 ? window.subtotal / totalItems : 0;

  return {
    totalItems,
    uniqueProducts,
    averagePrice,
    hasDiscount: Boolean(window.discount_amount || window.discount_percentage),
    discountValue: window.discount_amount || 0,
    taxPercentage: window.subtotal > 0 ? (window.tax_amount / window.subtotal) * 100 : 0
  };
}

// ========================================
// 🔍 SEARCH & FILTER
// ========================================

/**
 * Filtra ventanas por estado
 */
export function filterWindowsByStatus(windows: SaleWindow[], status: SaleWindow['status']): SaleWindow[] {
  return windows.filter((w) => w.status === status);
}

/**
 * Encuentra ventana por customer_id
 */
export function findWindowByCustomer(windows: SaleWindow[], customerId: string): SaleWindow | undefined {
  return windows.find((w) => w.customer?.id === customerId);
}

/**
 * Encuentra ventanas con cambios pendientes
 */
export function findWindowsWithChanges(windows: SaleWindow[]): SaleWindow[] {
  return windows.filter((w) => hasUnsyncedChanges(w));
}

// ========================================
// 🕐 TIME HELPERS
// ========================================

/**
 * Calcula tiempo transcurrido desde creación
 */
export function getWindowAge(window: SaleWindow): number {
  const created = new Date(window.created_at).getTime();
  const now = Date.now();
  return now - created; // milliseconds
}

/**
 * Calcula tiempo desde última modificación
 */
export function getTimeSinceLastModification(window: SaleWindow): number {
  if (!window.last_modified_at) return 0;
  const modified = new Date(window.last_modified_at).getTime();
  const now = Date.now();
  return now - modified; // milliseconds
}

/**
 * Verifica si una ventana es antigua (más de X minutos)
 */
export function isStaleWindow(window: SaleWindow, maxAgeMinutes = 30): boolean {
  const ageMs = getWindowAge(window);
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  return ageMs > maxAgeMs && window.products.length === 0;
}
