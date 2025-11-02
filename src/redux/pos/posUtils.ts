import type { POSRegister, SaleWindow, CompletedSale } from './posSlice';

// ===== STORAGE UTILITIES =====
export const POSStorageKeys = {
  CURRENT_REGISTER: 'pos_current_register',
  SALES_WINDOWS: 'pos_sales_windows',
  COMPLETED_SALES: 'pos_completed_sales'
} as const;

export function saveToLocalStorage(key: string, data: any): void {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage(key: string): any | null {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return null;
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export const clearPOSStorage = (): void => {
  Object.values(POSStorageKeys).forEach((key) => {
    localStorage.removeItem(key);
  });
};

// ===== CALCULATION UTILITIES =====
export const calculateSubtotal = (products: Array<{ price: number; quantity: number }>): number =>
  products.reduce((sum, product) => sum + product.price * product.quantity, 0);

export const calculateTaxAmount = (
  products: Array<{ price: number; quantity: number; tax_rate?: number }>,
  defaultTaxRate = 0.19
): number =>
  products.reduce((sum, product) => {
    const taxRate = product.tax_rate || defaultTaxRate;
    return sum + product.price * product.quantity * taxRate;
  }, 0);

export const calculateTotal = (subtotal: number, taxAmount: number, discountAmount?: number): number => {
  const total = subtotal + taxAmount - (discountAmount || 0);
  return Math.max(0, total);
};

export const calculateDiscountAmount = (
  total: number,
  discountPercentage?: number,
  discountAmount?: number
): number => {
  if (discountAmount) return discountAmount;
  if (discountPercentage) return total * (discountPercentage / 100);
  return 0;
};

// ===== VALIDATION UTILITIES =====
export const validateRegisterStatus = (register: POSRegister | null): boolean =>
  register !== null && register.status === 'open';

export const canCloseSaleWindow = (window: SaleWindow): boolean => {
  if (window.products.length === 0) return false;
  if (window.total <= 0) return false;

  const totalPaid = window.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return totalPaid >= window.total;
};

export const validatePaymentAmount = (paymentAmount: number, remainingAmount: number): boolean =>
  paymentAmount > 0 && paymentAmount <= remainingAmount + 1; // +1 for floating point precision

export const getRemainingAmount = (window: SaleWindow): number => {
  const totalPaid = window.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return Math.max(0, window.total - totalPaid);
};

// ===== FORMATTING UTILITIES =====
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);

export const formatDate = (dateString: string): string =>
  new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(dateString));

export const formatShortDate = (dateString: string): string =>
  new Intl.DateTimeFormat('es-CO', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));

// ===== PAYMENT METHOD UTILITIES =====
export const getPaymentMethodName = (method: string): string => {
  const methodNames: Record<string, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    nequi: 'Nequi',
    transfer: 'Transferencia',
    credit: 'Crédito'
  };
  return methodNames[method] || method;
};

export const getPaymentMethodIcon = (method: string): string => {
  const methodIcons: Record<string, string> = {
    cash: 'mdi:cash',
    card: 'mdi:credit-card',
    nequi: 'mdi:cellphone',
    transfer: 'mdi:bank-transfer',
    credit: 'mdi:credit-card-clock'
  };
  return methodIcons[method] || 'mdi:payment';
};

// ===== REGISTER UTILITIES =====
export const calculateRegisterSummary = (register: POSRegister, completedSales: CompletedSale[]) => {
  const registerSales = completedSales.filter((sale) => sale.register_id === register.id);

  const totalSales = registerSales.length;
  const totalRevenue = registerSales.reduce((sum, sale) => sum + sale.total, 0);

  const paymentsByMethod = registerSales.reduce((acc, sale) => {
    sale.payments.forEach((payment) => {
      if (!acc[payment.method]) {
        acc[payment.method] = 0;
      }
      acc[payment.method] += payment.amount;
    });
    return acc;
  }, {} as Record<string, number>);

  const cashSales = paymentsByMethod.cash || 0;
  const expectedCash = register.opening_amount + cashSales;
  const cashDifference = (register.closing_amount || 0) - expectedCash;

  return {
    totalSales,
    totalRevenue,
    paymentsByMethod,
    cashSales,
    expectedCash,
    cashDifference,
    openingAmount: register.opening_amount,
    closingAmount: register.closing_amount || 0
  };
};

// ===== RECEIPT/INVOICE UTILITIES =====
export const generateReceiptNumber = (): string => {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  return `POS-${timestamp}`;
};

export const generateInvoiceNumber = (consecutive?: number): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const seq = (consecutive || 1).toString().padStart(6, '0');
  return `FE${year}${month}${seq}`;
};

// ===== ERROR MESSAGES =====
export const POS_ERROR_MESSAGES = {
  NO_REGISTER_OPEN: 'No hay una caja abierta. Debe abrir caja antes de realizar ventas.',
  REGISTER_ALREADY_OPEN: 'Ya hay una caja abierta para este usuario.',
  INSUFFICIENT_PAYMENT: 'El monto pagado es insuficiente para completar la venta.',
  NO_PRODUCTS: 'Debe agregar al menos un producto para completar la venta.',
  INVALID_QUANTITY: 'La cantidad debe ser mayor a cero.',
  INSUFFICIENT_STOCK: 'Stock insuficiente para el producto solicitado.',
  CUSTOMER_REQUIRED: 'Es necesario seleccionar un cliente para facturar.',
  PAYMENT_REQUIRED: 'Debe registrar al menos un método de pago.',
  REGISTER_CLOSE_ERROR: 'Error al cerrar la caja. Verifique los datos.',
  STORAGE_ERROR: 'Error al guardar datos localmente.'
} as const;

export type POSErrorMessage = (typeof POS_ERROR_MESSAGES)[keyof typeof POS_ERROR_MESSAGES];
