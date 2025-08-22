import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types para el POS
interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  tax_rate?: number;
  category?: string;
  stock?: number;
}

interface Customer {
  id?: number;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type?: 'CC' | 'NIT' | 'CE' | 'PP';
}

interface PaymentMethod {
  id: string;
  method: 'cash' | 'card' | 'nequi' | 'transfer' | 'credit';
  amount: number;
  reference?: string;
}

interface SaleWindow {
  id: number;
  name: string;
  products: Product[];
  customer: Customer | null;
  payments: PaymentMethod[];
  subtotal: number;
  tax_amount: number;
  total: number;
  status: 'draft' | 'pending_payment' | 'paid' | 'cancelled';
  created_at: string;
  notes?: string;
  discount_percentage?: number;
  discount_amount?: number;
}

interface POSRegister {
  id: string;
  user_id: string;
  user_name: string;
  pdv_id: string;
  pdv_name: string;
  opening_amount: number;
  opened_at: string;
  closed_at?: string;
  closing_amount?: number;
  status: 'open' | 'closed';
  total_sales: number;
  total_cash: number;
  difference_cash: number;
  notes?: string;
}

interface CompletedSale {
  id: string;
  sale_window_id: number;
  register_id: string;
  customer: Customer | null;
  products: Product[];
  payments: PaymentMethod[];
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
  invoice_number?: string;
  pos_type: 'simple' | 'electronic';
  notes?: string;
}

interface POSState {
  isLoading: boolean;
  error: string | false;
  currentRegister: POSRegister | null;
  salesWindows: SaleWindow[];
  completedSales: CompletedSale[];
  availablePaymentMethods: Array<{
    id: string;
    name: string;
    type: 'cash' | 'card' | 'nequi' | 'transfer' | 'credit';
    enabled: boolean;
  }>;
  settings: {
    max_cash_difference: number;
    require_customer_for_invoice: boolean;
    auto_print_receipt: boolean;
    default_tax_rate: number;
  };
}

// Mock data
const mockPaymentMethods = [
  { id: 'cash', name: 'Efectivo', type: 'cash' as const, enabled: true },
  { id: 'card', name: 'Tarjeta', type: 'card' as const, enabled: true },
  { id: 'nequi', name: 'Nequi', type: 'nequi' as const, enabled: true },
  { id: 'transfer', name: 'Transferencia', type: 'transfer' as const, enabled: true },
  { id: 'credit', name: 'Crédito', type: 'credit' as const, enabled: false }
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
    default_tax_rate: 0.19
  }
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
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
    openRegister(
      state,
      action: PayloadAction<{
        user_id: string;
        user_name: string;
        pdv_id: string;
        pdv_name: string;
        opening_amount: number;
        notes?: string;
      }>
    ) {
      const { user_id, user_name, pdv_id, pdv_name, opening_amount, notes } = action.payload;
      const register: POSRegister = {
        id: `register_${Date.now()}`,
        user_id,
        user_name,
        pdv_id,
        pdv_name,
        opening_amount,
        opened_at: new Date().toISOString(),
        status: 'open',
        total_sales: 0,
        total_cash: opening_amount,
        difference_cash: 0,
        notes
      };
      state.currentRegister = register;
      state.salesWindows = [];
      state.completedSales = [];
    },

    closeRegister(
      state,
      action: PayloadAction<{
        closing_amount: number;
        notes?: string;
      }>
    ) {
      if (!state.currentRegister) return;

      const { closing_amount, notes } = action.payload;
      state.currentRegister.closed_at = new Date().toISOString();
      state.currentRegister.closing_amount = closing_amount;
      state.currentRegister.status = 'closed';
      state.currentRegister.difference_cash =
        closing_amount - (state.currentRegister.opening_amount + state.currentRegister.total_cash);
      if (notes) state.currentRegister.notes = notes;
    },

    // ===== SALES WINDOWS MANAGEMENT =====
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
        created_at: new Date().toISOString()
      };
      state.salesWindows.push(newWindow);
    },

    removeSaleWindow(state, action: PayloadAction<number>) {
      state.salesWindows = state.salesWindows.filter((window) => window.id !== action.payload);
    },

    updateSaleWindowName(state, action: PayloadAction<{ id: number; name: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.id);
      if (window) {
        window.name = action.payload.name;
      }
    },

    // ===== PRODUCTS MANAGEMENT =====
    addProductToSaleWindow(state, action: PayloadAction<{ windowId: number; product: Product }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const existingProduct = window.products.find((p) => p.id === action.payload.product.id);
      if (existingProduct) {
        existingProduct.quantity += action.payload.product.quantity;
      } else {
        window.products.push({ ...action.payload.product });
      }

      // Recalcular totales
      posSlice.caseReducers.recalculateTotals(state, {
        payload: action.payload.windowId,
        type: 'recalculateTotals'
      });
    },

    removeProductFromSaleWindow(state, action: PayloadAction<{ windowId: number; productId: number }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      window.products = window.products.filter((p) => p.id !== action.payload.productId);
      posSlice.caseReducers.recalculateTotals(state, {
        payload: action.payload.windowId,
        type: 'recalculateTotals'
      });
    },

    updateProductQuantity(state, action: PayloadAction<{ windowId: number; productId: number; quantity: number }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const product = window.products.find((p) => p.id === action.payload.productId);
      if (product && action.payload.quantity > 0) {
        product.quantity = action.payload.quantity;
        posSlice.caseReducers.recalculateTotals(state, {
          payload: action.payload.windowId,
          type: 'recalculateTotals'
        });
      }
    },

    // ===== CUSTOMER MANAGEMENT =====
    setCustomerToSaleWindow(state, action: PayloadAction<{ windowId: number; customer: Customer | null }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (window) {
        window.customer = action.payload.customer;
      }
    },

    // ===== PAYMENT MANAGEMENT =====
    addPaymentToSaleWindow(state, action: PayloadAction<{ windowId: number; payment: PaymentMethod }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const existingPayment = window.payments.find((p) => p.id === action.payload.payment.id);
      if (existingPayment) {
        existingPayment.amount = action.payload.payment.amount;
      } else {
        window.payments.push({ ...action.payload.payment });
      }

      const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
      window.status = totalPaid >= window.total ? 'paid' : 'pending_payment';
    },

    removePaymentFromSaleWindow(state, action: PayloadAction<{ windowId: number; paymentId: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      window.payments = window.payments.filter((p) => p.id !== action.payload.paymentId);
      const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
      window.status = totalPaid >= window.total ? 'paid' : window.payments.length > 0 ? 'pending_payment' : 'draft';
    },

    // ===== DISCOUNTS =====
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
      posSlice.caseReducers.recalculateTotals(state, {
        payload: action.payload.windowId,
        type: 'recalculateTotals'
      });
    },

    // ===== CALCULATIONS =====
    recalculateTotals(state, action: PayloadAction<number>) {
      const window = state.salesWindows.find((w) => w.id === action.payload);
      if (!window) return;

      const subtotal = window.products.reduce((sum, product) => sum + product.price * product.quantity, 0);

      const tax_amount = window.products.reduce((sum, product) => {
        const tax_rate = product.tax_rate || state.settings.default_tax_rate;
        return sum + product.price * product.quantity * tax_rate;
      }, 0);

      let total = subtotal + tax_amount;

      // Apply discounts
      if (window.discount_percentage) {
        window.discount_amount = total * (window.discount_percentage / 100);
      }
      if (window.discount_amount) {
        total -= window.discount_amount;
      }

      window.subtotal = subtotal;
      window.tax_amount = tax_amount;
      window.total = Math.max(0, total);
    },

    // ===== COMPLETE SALE =====
    completeSale(
      state,
      action: PayloadAction<{
        windowId: number;
        pos_type: 'simple' | 'electronic';
        invoice_number?: string;
      }>
    ) {
      const windowIndex = state.salesWindows.findIndex((w) => w.id === action.payload.windowId);
      if (windowIndex === -1 || !state.currentRegister) return;

      const window = state.salesWindows[windowIndex];
      if (window.status !== 'paid') return;

      // Create completed sale
      const completedSale: CompletedSale = {
        id: `sale_${Date.now()}`,
        sale_window_id: window.id,
        register_id: state.currentRegister.id,
        customer: window.customer,
        products: [...window.products],
        payments: [...window.payments],
        subtotal: window.subtotal,
        tax_amount: window.tax_amount,
        total: window.total,
        created_at: new Date().toISOString(),
        pos_type: action.payload.pos_type,
        invoice_number: action.payload.invoice_number,
        notes: window.notes
      };

      state.completedSales.push(completedSale);

      // Update register totals
      state.currentRegister.total_sales += window.total;
      const cashPayments = window.payments.filter((p) => p.method === 'cash');
      const cashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0);
      state.currentRegister.total_cash += cashAmount;

      // Remove completed window
      state.salesWindows.splice(windowIndex, 1);
    },

    // ===== DATA PERSISTENCE =====
    initializeFromStorage(
      state,
      action: PayloadAction<{
        currentRegister?: POSRegister;
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
    }
  }
});

// Reducer
export default posSlice.reducer;

// Actions
export const {
  startLoading,
  hasError,
  clearError,
  openRegister,
  closeRegister,
  addSaleWindow,
  removeSaleWindow,
  updateSaleWindowName,
  addProductToSaleWindow,
  removeProductFromSaleWindow,
  updateProductQuantity,
  setCustomerToSaleWindow,
  addPaymentToSaleWindow,
  removePaymentFromSaleWindow,
  applyDiscountToSaleWindow,
  recalculateTotals,
  completeSale,
  initializeFromStorage
} = posSlice.actions;

// Types export
export type { Product, Customer, PaymentMethod, SaleWindow, POSRegister, CompletedSale, POSState };
