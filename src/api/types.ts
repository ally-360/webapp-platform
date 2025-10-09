// ========================================
// 🏢 TIPOS DE DOMINIO - ALLY360 POS
// ========================================

// ========================================
// 🏢 COMPANY & USER TYPES
// ========================================
export interface Company {
  id: string;
  name: string;
  nit: string;
  address: string;
  phoneNumber: string;
  website?: string;
  quantityEmployees?: string;
  economicActivity?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Solo para mock
  verified: boolean;
  authId: string;
  firstLogin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Profile {
  id: string;
  userId: string;
  name: string;
  lastname: string;
  dni: string;
  personalPhoneNumber: string;
  photo?: string;
}

// ========================================
// 🏷️ CATALOG TYPES
// ========================================
export interface Brand {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  barCode?: string;
  images: string[];
  typeProduct: '1' | '2'; // '1' = simple, '2' = configurable
  taxesOption: number;
  sku?: string;
  priceSale: number; // precio de venta
  priceBase: number; // precio base
  quantityStock: number; // stock global
  globalStock: number; // stock total
  state: boolean; // activo/inactivo
  sellInNegative: boolean; // permitir venta en negativo
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
  productPdv: Array<{
    pdv_id: string;
    pdv_name: string;
    quantity: number;
    min_quantity: number;
  }>;
  inventoryType?: string | null;
  companyId?: string;
  categoryId?: string;
  brandId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ========================================
// 🏪 WAREHOUSE TYPES
// ========================================
export interface Warehouse {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
  main: boolean;
  companyId: string;
  locationId: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  minQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

// ========================================
// 📍 LOCATION TYPES
// ========================================
export interface Department {
  id: number;
  name: string;
}

export interface Town {
  id: number;
  name: string;
  departmentId: number;
}

// ========================================
// 📞 CONTACT TYPES
// ========================================
export interface ContactIdentity {
  id: number;
  typeDocument: 13 | 31; // CC = 13, NIT = 31
  typePerson: 1 | 2; // Natural = 1, Juridica = 2
  number: number;
  dv: number;
}

export interface Contact {
  id: number;
  name: string;
  lastname: string;
  email: string;
  address: string;
  phoneNumber: string;
  type: number;
  identityId: number;
  companyId: string;
  townId: number;
  phoneNumber2?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ========================================
// 🧾 INVOICE TYPES
// ========================================
export interface InvoiceCustomer {
  id: string;
  // Referencia al customer/contact
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  createDate: string; // ISO string
  totalTaxes: number; // en centavos
  shipping: number; // en centavos
  status: number;
  method: string;
  paymentTerm: string;
  totalAmount: number; // en centavos
  currency: 'COP';
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  invoiceCustomerId: string;
  companyId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesInvoiceItem {
  id: string;
  product: string; // name of product
  quantity: number;
  price: number; // en centavos
  taxes: number; // en centavos
  total: number; // en centavos
  salesInvoiceId: string;
  productId: string;
}

// ========================================
// 🔐 AUTH TYPES
// ========================================
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile: Profile;
  companies: Company[];
}

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  lastname: string;
  dni: string;
  personalPhoneNumber: string;
}

export interface RegisterCompanyData {
  name: string;
  nit: string;
  address: string;
  phoneNumber: string;
  website?: string;
  quantityEmployees?: string;
  economicActivity?: string;
}

// ========================================
// 📊 API RESPONSE TYPES
// ========================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: any;
}

// ========================================
// 🔍 FILTER & SEARCH TYPES
// ========================================
export interface ProductFilters {
  search?: string; // buscar por nombre, SKU o descripción
  category_id?: string; // filtrar por categoría
  brand_id?: string; // filtrar por marca
  is_active?: boolean; // filtrar por estado activo
  page?: number; // número de página
  limit?: number; // elementos por página
  // Legacy support
  companyId?: string;
  brandId?: string;
  categoryId?: string;
}

export interface ContactFilters {
  companyId?: string;
  townId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface InvoiceFilters {
  companyId?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface StockFilters {
  companyId?: string;
  warehouseId?: string;
  productId?: string;
}

// ========================================
// 💼 BUSINESS LOGIC TYPES
// ========================================
export interface CreateInvoicePayload {
  companyId: string;
  invoiceCustomerId: string;
  items: {
    productId: string;
    quantity: number;
    price: number; // en centavos
  }[];
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';
  shipping?: number; // en centavos
  method?: string;
  paymentTerm?: string;
}

// ========================================
// 🏪 POS SALES HISTORY TYPES
// ========================================
export interface PosSalePayment {
  method: 'cash' | 'card' | 'nequi' | 'transfer' | 'credit';
  amount: number; // unidades monetarias (no centavos)
  reference?: string;
}

export interface PosSaleProduct {
  id: string;
  name: string;
  quantity: number;
  price: number; // unidades monetarias (no centavos)
}

export interface PosSaleHistoryItem {
  id: string;
  invoice_number?: string;
  created_at: string; // ISO
  customer?: { id?: string | number; name: string } | null;
  seller_name?: string;
  products: PosSaleProduct[];
  payments: PosSalePayment[];
  subtotal: number;
  tax_amount: number;
  total: number;
  pos_type: 'simple' | 'electronic';
  status?: 'paid' | 'cancelled' | 'refunded';
}

export interface GetPosSalesHistoryFilters {
  start_date?: string; // Fecha inicial del filtro (yyyy-MM-dd)
  end_date?: string; // Fecha final del filtro (yyyy-MM-dd)
  seller_id?: string; // Filtrar por vendedor específico (UUID)
  limit?: number; // Número máximo de resultados (default: 100, max: 1000)
  offset?: number; // Número de registros a saltar (default: 0)
  // Legacy filters for compatibility
  query?: string;
  pos_type?: 'all' | 'simple' | 'electronic';
  dateFrom?: string; // yyyy-MM-dd
  dateTo?: string; // yyyy-MM-dd
  page?: number;
}
