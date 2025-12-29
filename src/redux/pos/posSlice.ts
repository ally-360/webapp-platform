import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types para el POS
interface ProductPdv {
  pdv_id: string;
  pdv_name: string;
  quantity: number;
  min_quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sku: string;
  barCode?: string;
  description?: string;
  brand?: string;
  sellInNegative?: boolean;
  tax_rate?: number;
  category?: string;
  stock?: number; // Stock total (quantityStock del backend)
  globalStock?: number; // Stock global
  quantityStock?: number; // Stock total del producto
  productPdv?: ProductPdv[]; // Stock por cada PDV (campo del backend)
  image?: string;
  images?: string[];
}

interface Customer {
  id: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  document_type?: 'CC' | 'NIT' | 'CE' | 'PP';
}

interface PaymentMethod {
  id: string;
  method: 'cash' | 'card' | 'nequi' | 'transfer' | 'credit'; // UI uses lowercase
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
  last_modified?: string;
  notes?: string;
  discount_percentage?: number;
  discount_amount?: number;
  // Campos de sincronización con backend
  draft_id?: string; // UUID del draft en backend
  synced?: boolean; // true si está sincronizado
  synced_at?: string; // Timestamp de última sincronización
  sync_error?: string; // Mensaje de error si falla sync
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
  shift_id?: string; // ID del turno actual (si existe)
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
  seller_id?: string;
  seller_name?: string;
  sale_date?: string;
  discount_percentage?: number;
  discount_amount?: number;
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
        register_id?: string; // ✅ ID del backend (UUID)
        user_id: string;
        user_name: string;
        pdv_id: string;
        pdv_name: string;
        opening_amount: number;
        notes?: string;
        shift_id?: string; // ID del turno/shift (mismo que register_id usualmente)
      }>
    ) {
      const { register_id, user_id, user_name, pdv_id, pdv_name, opening_amount, notes, shift_id } = action.payload;
      const register: POSRegister = {
        id: register_id || `register_${Date.now()}`, // ✅ Usar ID del backend si existe
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
        notes,
        shift_id: shift_id || register_id // Usar shift_id si existe, sino usar register_id
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
      const now = new Date().toISOString();
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
        created_at: now,
        last_modified: now,
        // Inicializar campos de sincronización
        draft_id: undefined,
        synced: false,
        synced_at: undefined,
        sync_error: undefined
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

      // Marcar como modificada
      window.last_modified = new Date().toISOString();
      window.synced = false;

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

      // Marcar como modificada
      window.last_modified = new Date().toISOString();
      window.synced = false;

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

        // Marcar como modificada
        window.last_modified = new Date().toISOString();
        window.synced = false;

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

        // Marcar como modificada
        window.last_modified = new Date().toISOString();
        window.synced = false;
      }
    },

    // ===== PAYMENT MANAGEMENT =====
    addPaymentToSaleWindow(state, action: PayloadAction<{ windowId: number; payment: PaymentMethod }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      const existingPaymentIndex = window.payments.findIndex((p) => p.id === action.payload.payment.id);
      if (existingPaymentIndex >= 0) {
        // Crear nuevo array con el pago actualizado para que useEffect detecte el cambio
        window.payments = [
          ...window.payments.slice(0, existingPaymentIndex),
          { ...window.payments[existingPaymentIndex], amount: action.payload.payment.amount },
          ...window.payments.slice(existingPaymentIndex + 1)
        ];
      } else {
        window.payments.push({ ...action.payload.payment });
      }

      const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
      window.status = totalPaid >= window.total ? 'paid' : 'pending_payment';

      // Marcar como modificada
      window.last_modified = new Date().toISOString();
      window.synced = false;
    },

    removePaymentFromSaleWindow(state, action: PayloadAction<{ windowId: number; paymentId: string }>) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (!window) return;

      window.payments = window.payments.filter((p) => p.id !== action.payload.paymentId);
      const totalPaid = window.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= window.total) {
        window.status = 'paid';
      } else if (window.payments.length > 0) {
        window.status = 'pending_payment';
      } else {
        window.status = 'draft';
      }

      // Marcar como modificada
      window.last_modified = new Date().toISOString();
      window.synced = false;
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

      // Marcar como modificada
      window.last_modified = new Date().toISOString();
      window.synced = false;

      posSlice.caseReducers.recalculateTotals(state, {
        payload: action.payload.windowId,
        type: 'recalculateTotals'
      });
    },

    // ===== CALCULATIONS =====
    recalculateTotals(state, action: PayloadAction<number>) {
      const window = state.salesWindows.find((w) => w.id === action.payload);
      if (!window) return;

      // Función helper para redondear a 2 decimales
      const roundToTwo = (num: number): number => Math.round(num * 100) / 100;

      const subtotal = roundToTwo(window.products.reduce((sum, product) => sum + product.price * product.quantity, 0));

      const tax_amount = roundToTwo(
        window.products.reduce((sum, product) => {
          const tax_rate = product.tax_rate || state.settings.default_tax_rate;
          return sum + product.price * product.quantity * tax_rate;
        }, 0)
      );

      let total = roundToTwo(subtotal + tax_amount);

      // Apply discounts
      if (window.discount_percentage) {
        window.discount_amount = roundToTwo(total * (window.discount_percentage / 100));
      }
      if (window.discount_amount) {
        total = roundToTwo(total - window.discount_amount);
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
        seller_id?: string;
        seller_name?: string;
        sale_date?: string; // Cambiar a string para serialización
        tax_rate?: number;
        discount_percentage?: number;
        discount_amount?: number;
        notes?: string;
      }>
    ) {
      const windowIndex = state.salesWindows.findIndex((w) => w.id === action.payload.windowId);
      if (windowIndex === -1 || !state.currentRegister) return;

      const window = state.salesWindows[windowIndex];
      if (window.status !== 'paid') return;

      // Apply final updates to window before completing
      if (action.payload.discount_percentage !== undefined) {
        window.discount_percentage = action.payload.discount_percentage;
      }
      if (action.payload.discount_amount !== undefined) {
        window.discount_amount = action.payload.discount_amount;
      }
      if (action.payload.notes !== undefined) {
        window.notes = action.payload.notes;
      }

      // Recalculate totals if tax rate changed
      if (action.payload.tax_rate !== undefined) {
        const subtotal = window.products.reduce((sum, product) => sum + product.price * product.quantity, 0);

        const discountAmount = window.discount_amount || 0;
        const subtotalAfterDiscount = subtotal - discountAmount;
        const tax_amount = (subtotalAfterDiscount * action.payload.tax_rate) / 100;
        const total = subtotalAfterDiscount + tax_amount;

        window.subtotal = subtotal;
        window.tax_amount = tax_amount;
        window.total = Math.max(0, total);
      }

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
        created_at: action.payload.sale_date || new Date().toISOString(),
        pos_type: action.payload.pos_type,
        invoice_number: action.payload.invoice_number,
        notes: action.payload.notes || window.notes,
        seller_id: action.payload.seller_id,
        seller_name: action.payload.seller_name,
        sale_date: action.payload.sale_date,
        discount_percentage: window.discount_percentage,
        discount_amount: window.discount_amount
      };

      state.completedSales.push(completedSale);

      // Update register totals
      state.currentRegister.total_sales += window.total;
      const cashPayments = window.payments.filter((p) => p.method === 'cash');
      const cashAmount = cashPayments.reduce((sum, p) => sum + p.amount, 0);
      state.currentRegister.total_cash += cashAmount;

      // Remove completed window
      state.salesWindows.splice(windowIndex, 1);

      // Auto-create new sale window if no windows left
      if (state.salesWindows.length === 0) {
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
      }
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
    },

    // ===== SALE DRAFT SYNC =====
    /**
     * Actualizar draft_id y estado de sincronización después de crear/actualizar en backend
     */
    updateWindowSyncStatus(
      state,
      action: PayloadAction<{
        windowId: number;
        draft_id?: string;
        synced?: boolean;
        synced_at?: string;
        sync_error?: string;
      }>
    ) {
      const window = state.salesWindows.find((w) => w.id === action.payload.windowId);
      if (window) {
        if (action.payload.draft_id !== undefined) window.draft_id = action.payload.draft_id;
        if (action.payload.synced !== undefined) window.synced = action.payload.synced;
        if (action.payload.synced_at !== undefined) window.synced_at = action.payload.synced_at;
        if (action.payload.sync_error !== undefined) window.sync_error = action.payload.sync_error;
      }
    },

    /**
     * Agregar ventana desde draft del backend (al cargar borradores)
     */
    addSaleWindowFromDraft(
      state,
      action: PayloadAction<{
        draft_id: string;
        window_id: string;
        name?: string;
        products: Product[];
        customer?: Customer | null;
        seller_id?: string;
        seller_name?: string;
        payments: PaymentMethod[];
        subtotal: number;
        tax_amount: number;
        total: number;
        notes?: string;
        created_at: string;
        updated_at: string;
      }>
    ) {
      const draft = action.payload;

      // Buscar si ya existe una ventana con este draft_id
      const existingWindow = state.salesWindows.find((w) => w.draft_id === draft.draft_id);

      if (existingWindow) {
        // Actualizar ventana existente con datos del backend
        existingWindow.products = draft.products;
        existingWindow.customer = draft.customer || null;
        existingWindow.payments = draft.payments;
        existingWindow.subtotal = draft.subtotal;
        existingWindow.tax_amount = draft.tax_amount;
        existingWindow.total = draft.total;
        existingWindow.notes = draft.notes;
        existingWindow.synced = true;
        existingWindow.synced_at = draft.updated_at;
        existingWindow.last_modified = draft.updated_at;
      } else {
        // Generar ID numérico único para la nueva ventana
        const windowId = Date.now() + state.salesWindows.length;

        // Crear nueva ventana desde draft
        const newWindow: SaleWindow = {
          id: windowId,
          name: draft.name || `Venta ${state.salesWindows.length + 1}`,
          products: draft.products,
          customer: draft.customer || null,
          payments: draft.payments,
          subtotal: draft.subtotal,
          tax_amount: draft.tax_amount,
          total: draft.total,
          status: 'draft',
          created_at: draft.created_at,
          last_modified: draft.updated_at,
          notes: draft.notes,
          seller_id: draft.seller_id,
          seller_name: draft.seller_name,
          // Sincronización
          draft_id: draft.draft_id,
          synced: true,
          synced_at: draft.updated_at
        };
        state.salesWindows.push(newWindow);
      }
    },

    /**
     * Marcar ventana como modificada (para disparar sincronización)
     */
    markWindowAsModified(state, action: PayloadAction<number>) {
      const window = state.salesWindows.find((w) => w.id === action.payload);
      if (window) {
        window.last_modified = new Date().toISOString();
        window.synced = false;
      }
    },

    // ===== COMPANY RESET =====
    resetPOSState(_state) {
      // Reset al estado inicial cuando se cambia de empresa
      return initialState;
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
  initializeFromStorage,
  updateWindowSyncStatus,
  addSaleWindowFromDraft,
  markWindowAsModified,
  resetPOSState
} = posSlice.actions;

// Types export
export type { Product, Customer, PaymentMethod, SaleWindow, POSRegister, CompletedSale, POSState };
