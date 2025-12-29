// ========================================
// 🏪 POS SLICE V2 - Backend Aligned
// ========================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SaleWindow, SaleWindowProduct, SaleWindowCustomer, SaleWindowPayment, CashRegister } from 'src/types/pos';

// ========================================
// 📝 TYPES
// ========================================

interface CompletedSale {
  id: string; // ID de la factura del backend
  sale_window_id: number; // ID de la ventana local que generó esta venta
  register_id: string;
  customer: SaleWindowCustomer | null;
  products: SaleWindowProduct[];
  payments: SaleWindowPayment[];
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
  invoice_number?: string;
  pos_type: 'simple' | 'electronic';
  notes?: string;
  seller_id?: string;
  seller_name?: string;
  sale_date?: string;
  discount_percentage?: number;
  discount_amount?: number;
}

interface POSState {
  isLoading: boolean;
  error: string | false;
  currentRegister: CashRegister | null;
  salesWindows: SaleWindow[];
  completedSales: CompletedSale[];
  availablePaymentMethods: Array<{
    id: string;
    name: string;
    type: 'cash' | 'card' | 'transfer' | 'other';
    enabled: boolean;
  }>;
  settings: {
    max_cash_difference: number;
    require_customer_for_invoice: boolean;
    auto_print_receipt: boolean;
    default_tax_rate: number;
    auto_save_interval: number; // Intervalo de auto-guardado en ms
  };
}

// ========================================
// 🎬 INITIAL STATE
// ========================================

const mockPaymentMethods = [
  { id: 'cash', name: 'Efectivo', type: 'cash' as const, enabled: true },
  { id: 'card', name: 'Tarjeta', type: 'card' as const, enabled: true },
  { id: 'transfer', name: 'Transferencia', type: 'transfer' as const, enabled: true },
  { id: 'other', name: 'Otro', type: 'other' as const, enabled: false }
];

const initialState: POSState = {
  isLoading: false,
  error: false,
  currentRegister: null,
  salesWindows: [],
  completedSales: [],
  availablePaymentMethods: mockPaymentMethods,
  settings: {
    max_cash_difference: 5000,
    require_customer_for_invoice: true,
    auto_print_receipt: false,
    default_tax_rate: 0.19,
    auto_save_interval: 2000
  }
};

// ========================================
// 🛠️ HELPER FUNCTIONS
// ========================================

/**
 * Calcula totales de una ventana de venta
 */
function calculateWindowTotals(window: SaleWindow, defaultTaxRate: number): void {
  // Helper para redondear a 2 decimales
  const roundToTwo = (num: number): number => Math.round(num * 100) / 100;

  // Calcular subtotal
  const subtotal = roundToTwo(window.products.reduce((sum, product) => sum + product.price * product.quantity, 0));

  // Calcular impuestos
  const tax_amount = roundToTwo(
    window.products.reduce((sum, product) => {
      const tax_rate = product.tax_rate || defaultTaxRate;
      return sum + product.price * product.quantity * tax_rate;
    }, 0)
  );

  // Calcular total
  let total = roundToTwo(subtotal + tax_amount);

  // Aplicar descuentos
  if (window.discount_percentage) {
    window.discount_amount = roundToTwo(total * (window.discount_percentage / 100));
  }
  if (window.discount_amount) {
    total = roundToTwo(total - window.discount_amount);
  }

  // Actualizar ventana
  window.subtotal = subtotal;
  window.tax_amount = tax_amount;
  window.total = Math.max(0, total);
  window.last_modified_at = new Date().toISOString();
  window.has_changes = true;

  // Actualizar estado de pago
  const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
  if (totalPaid >= window.total && window.total > 0) {
    window.status = 'paid';
  } else if (window.payments.length > 0) {
    window.status = 'pending_payment';
  } else {
    window.status = 'draft';
  }
}

// ========================================
// 🔄 SLICE
// ========================================

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    // ===== LOADING & ERROR =====
    startLoading(state) {
      state.isLoading = true;
    },

    hasError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    clearError(state) {
      state.error = false;
    },

    // ===== REGISTER MANAGEMENT =====
    setCurrentRegister(state, action: PayloadAction<CashRegister | null>) {
      state.currentRegister = action.payload;
    },

    // ===== SALES WINDOWS MANAGEMENT =====

    /**
     * Agregar nueva ventana de venta
     */
    addSaleWindow(state) {
      const newWindow: SaleWindow = {
        id: Date.now(),
        name: `Venta ${state.salesWindows.length + 1}`,
        products: [],
        customer: null,
        payments: [],
        subtotal: 0,
        tax_amount: 0,
        total: 0,
        status: 'draft',
        created_at: new Date().toISOString(),
        last_modified_at: new Date().toISOString(),
        has_changes: false
      };
      state.salesWindows.push(newWindow);
    },

    /**
     * Eliminar ventana de venta
     */
    removeSaleWindow(state, action: PayloadAction<number>) {
      state.salesWindows = state.salesWindows.filter((window) => window.id !== action.payload);
    },

    /**
     * Actualizar nombre de ventana
     */
    updateSaleWindowName(state, action: PayloadAction<{ id: number; name: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.id);
      if (window) {
        window.name = action.payload.name;
        window.last_modified_at = new Date().toISOString();
        window.has_changes = true;
      }
    },

    /**
     * Sincronizar ventana con draft del backend
     */
    syncWindowWithDraft(
      state,
      action: PayloadAction<{
        windowId: number;
        draftId: string;
        syncedAt: string;
      }>
    ) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (window) {
        window.draft_id = action.payload.draftId;
        window.synced_at = action.payload.syncedAt;
        window.has_changes = false;
      }
    },

    // ===== PRODUCTS MANAGEMENT =====

    /**
     * Agregar producto a ventana
     */
    addProductToSaleWindow(state, action: PayloadAction<{ windowId: number; product: SaleWindowProduct }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const existingProduct = window.products.find((p) => p.id === action.payload.product.id);
      if (existingProduct) {
        existingProduct.quantity += action.payload.product.quantity;
      } else {
        window.products.push({ ...action.payload.product });
      }

      calculateWindowTotals(window, state.settings.default_tax_rate);
    },

    /**
     * Eliminar producto de ventana
     */
    removeProductFromSaleWindow(state, action: PayloadAction<{ windowId: number; productId: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      window.products = window.products.filter((p) => p.id !== action.payload.productId);
      calculateWindowTotals(window, state.settings.default_tax_rate);
    },

    /**
     * Actualizar cantidad de producto
     */
    updateProductQuantity(state, action: PayloadAction<{ windowId: number; productId: string; quantity: number }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const product = window.products.find((p) => p.id === action.payload.productId);
      if (product && action.payload.quantity > 0) {
        product.quantity = action.payload.quantity;
        calculateWindowTotals(window, state.settings.default_tax_rate);
      }
    },

    // ===== CUSTOMER MANAGEMENT =====

    /**
     * Asignar cliente a ventana
     */
    setCustomerToSaleWindow(state, action: PayloadAction<{ windowId: number; customer: SaleWindowCustomer | null }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (window) {
        window.customer = action.payload.customer;
        window.last_modified_at = new Date().toISOString();
        window.has_changes = true;
      }
    },

    /**
     * Asignar vendedor a ventana
     */
    setSellerToSaleWindow(state, action: PayloadAction<{ windowId: number; seller_id: string; seller_name: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (window) {
        window.seller_id = action.payload.seller_id;
        window.seller_name = action.payload.seller_name;
        window.last_modified_at = new Date().toISOString();
        window.has_changes = true;
      }
    },

    // ===== PAYMENT MANAGEMENT =====

    /**
     * Agregar pago a ventana
     */
    addPaymentToSaleWindow(state, action: PayloadAction<{ windowId: number; payment: SaleWindowPayment }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const existingPayment = window.payments.find((p) => p.id === action.payload.payment.id);
      if (existingPayment) {
        existingPayment.amount = action.payload.payment.amount;
      } else {
        window.payments.push({ ...action.payload.payment });
      }

      // Actualizar estado
      const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
      window.status = totalPaid >= window.total ? 'paid' : 'pending_payment';
      window.last_modified_at = new Date().toISOString();
      window.has_changes = true;
    },

    /**
     * Eliminar pago de ventana
     */
    removePaymentFromSaleWindow(state, action: PayloadAction<{ windowId: number; paymentId: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      window.payments = window.payments.filter((p) => p.id !== action.payload.paymentId);

      // Actualizar estado
      const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= window.total) {
        window.status = 'paid';
      } else if (window.payments.length > 0) {
        window.status = 'pending_payment';
      } else {
        window.status = 'draft';
      }
      window.last_modified_at = new Date().toISOString();
      window.has_changes = true;
    },

    // ===== DISCOUNTS =====

    /**
     * Aplicar descuento a ventana
     */
    applyDiscountToSaleWindow(
      state,
      action: PayloadAction<{
        windowId: number;
        discount_percentage?: number;
        discount_amount?: number;
      }>
    ) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      window.discount_percentage = action.payload.discount_percentage;
      window.discount_amount = action.payload.discount_amount;
      calculateWindowTotals(window, state.settings.default_tax_rate);
    },

    // ===== COMPLETE SALE =====

    /**
     * Completar venta (después de enviarse al backend exitosamente)
     */
    completeSale(
      state,
      action: PayloadAction<{
        windowId: number;
        invoiceId: string;
        invoiceNumber: string;
      }>
    ) {
      const windowIndex = state.salesWindows.findIndex((w) => w.id === action.payload.windowId);
      if (windowIndex === -1 || !state.currentRegister) return;

      const window = state.salesWindows[windowIndex];
      if (window.status !== 'paid') return;

      // Crear registro de venta completada
      const completedSale: CompletedSale = {
        id: action.payload.invoiceId,
        sale_window_id: window.id,
        register_id: state.currentRegister.id,
        customer: window.customer,
        products: [...window.products],
        payments: [...window.payments],
        subtotal: window.subtotal,
        tax_amount: window.tax_amount,
        total: window.total,
        created_at: new Date().toISOString(),
        invoice_number: action.payload.invoiceNumber,
        pos_type: window.customer?.document ? 'electronic' : 'simple',
        notes: window.notes,
        seller_id: window.seller_id,
        seller_name: window.seller_name,
        discount_percentage: window.discount_percentage,
        discount_amount: window.discount_amount
      };

      state.completedSales.push(completedSale);

      // Eliminar ventana completada
      state.salesWindows.splice(windowIndex, 1);

      // Auto-crear nueva ventana si no quedan ventanas
      if (state.salesWindows.length === 0) {
        const newWindow: SaleWindow = {
          id: Date.now(),
          name: 'Venta 1',
          products: [],
          customer: null,
          payments: [],
          subtotal: 0,
          tax_amount: 0,
          total: 0,
          status: 'draft',
          created_at: new Date().toISOString(),
          last_modified_at: new Date().toISOString(),
          has_changes: false
        };
        state.salesWindows.push(newWindow);
      }
    },

    // ===== DATA PERSISTENCE =====

    /**
     * Inicializar desde localStorage
     */
    initializeFromStorage(
      state,
      action: PayloadAction<{
        currentRegister?: CashRegister;
        salesWindows?: SaleWindow[];
        completedSales?: CompletedSale[];
      }>
    ) {
      if (action.payload.currentRegister) {
        state.currentRegister = action.payload.currentRegister;
      }
      if (action.payload.salesWindows) {
        state.salesWindows = action.payload.salesWindows;
      }
      if (action.payload.completedSales) {
        state.completedSales = action.payload.completedSales;
      }
    },

    /**
     * Resetear estado POS
     */
    resetPOSState(_state) {
      return initialState;
    }
  }
});

// ========================================
// 📤 EXPORTS
// ========================================

export default posSlice.reducer;

export const {
  startLoading,
  hasError,
  clearError,
  setCurrentRegister,
  addSaleWindow,
  removeSaleWindow,
  updateSaleWindowName,
  syncWindowWithDraft,
  addProductToSaleWindow,
  removeProductFromSaleWindow,
  updateProductQuantity,
  setCustomerToSaleWindow,
  setSellerToSaleWindow,
  addPaymentToSaleWindow,
  removePaymentFromSaleWindow,
  applyDiscountToSaleWindow,
  completeSale,
  initializeFromStorage,
  resetPOSState
} = posSlice.actions;

// Tipo para el estado
export type { POSState, CompletedSale };
