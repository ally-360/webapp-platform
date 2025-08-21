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
  priceSale: number; // en centavos
  priceBase: number; // en centavos
  companyId: string;
  categoryId: string;
  brandId: string;
  state?: boolean;
  sellInNegative?: boolean;
  quantityStock?: number;
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
  companyId?: string;
  brandId?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
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
