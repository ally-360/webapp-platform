import {
  AuthCredentials,
  AuthResponse,
  RegisterUserData,
  RegisterCompanyData,
  Company,
  User,
  Profile,
  Brand,
  Category,
  Product,
  Warehouse,
  Stock,
  Department,
  Town,
  Contact,
  SalesInvoice,
  SalesInvoiceItem,
  ProductFilters,
  ContactFilters,
  InvoiceFilters,
  StockFilters,
  CreateInvoicePayload,
  ApiSuccessResponse,
  PaginatedResponse,
  PosSaleHistoryItem,
  GetPosSalesHistoryFilters
} from './types';

import { JWTconfig } from '../config-global';

// Configuración de la API real
const API_BASE = `${JWTconfig.apiUrl}`;

// ========================================
// 🛠️ UTILIDADES HTTP
// ========================================

/**
 * Configuración base para requests
 */
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const companyId = localStorage.getItem('companyId');
  if (companyId) {
    headers['company-id'] = companyId;
  }

  return headers;
};

/**
 * Realiza petición HTTP
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiSuccessResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data && typeof data === 'object' && 'success' in data) {
    if (data.success && 'data' in data) {
      return data;
    }
    if (!data.success) {
      throw new Error(data.message || 'Error en la respuesta del servidor');
    }
  }

  return {
    success: true,
    data
  };
}

// ========================================
// 🔐 AUTH FUNCTIONS
// ========================================

/**
 * Autentica un usuario con email y contraseña
 */
export const login = async (credentials: AuthCredentials): Promise<ApiSuccessResponse<AuthResponse>> =>
  apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });

/**
 * Registra un nuevo usuario
 */
export const register = async (userData: RegisterUserData): Promise<ApiSuccessResponse<AuthResponse>> =>
  apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

/**
 * Obtiene información del usuario actual
 */
export const getCurrentUser = async (): Promise<
  ApiSuccessResponse<{ user: User; profile: Profile; companies: Company[] }>
> => apiRequest<{ user: User; profile: Profile; companies: Company[] }>('/auth/me');

/**
 * Cierra sesión
 */
export const logout = async (): Promise<ApiSuccessResponse<{ message: string }>> =>
  apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST'
  });

// ========================================
// 🏢 COMPANY FUNCTIONS
// ========================================

/**
 * Obtiene todas las empresas del usuario
 */
export const getCompanies = async (): Promise<ApiSuccessResponse<Company[]>> => apiRequest<Company[]>('/companies');

/**
 * Obtiene empresa por ID
 */
export const getCompanyById = async (companyId: string): Promise<ApiSuccessResponse<Company>> =>
  apiRequest<Company>(`/companies/${companyId}`);

/**
 * Crea nueva empresa
 */
export const createCompany = async (companyData: RegisterCompanyData): Promise<ApiSuccessResponse<Company>> =>
  apiRequest<Company>('/companies', {
    method: 'POST',
    body: JSON.stringify(companyData)
  });

// ========================================
// 📦 PRODUCT CATALOG FUNCTIONS
// ========================================

/**
 * Obtiene todas las marcas
 */
export const getBrands = async ({ companyId }: { companyId: string }): Promise<ApiSuccessResponse<Brand[]>> =>
  apiRequest<Brand[]>(`/brands?companyId=${companyId}`);

/**
 * Obtiene todas las categorías
 */
export const getCategories = async ({ companyId }: { companyId: string }): Promise<ApiSuccessResponse<Category[]>> =>
  apiRequest<Category[]>(`/categories?companyId=${companyId}`);

/**
 * Obtiene productos con filtros y paginación
 */
export const getProducts = async (
  filters: ProductFilters = {}
): Promise<ApiSuccessResponse<PaginatedResponse<Product>>> => {
  const searchParams = new URLSearchParams();

  if (filters.companyId) searchParams.set('companyId', filters.companyId);
  if (filters.search) searchParams.set('search', filters.search);
  if (filters.categoryId) searchParams.set('categoryId', filters.categoryId);
  if (filters.brandId) searchParams.set('brandId', filters.brandId);
  if (filters.page) searchParams.set('page', filters.page.toString());
  if (filters.limit) searchParams.set('limit', filters.limit.toString());

  return apiRequest<PaginatedResponse<Product>>(`/products?${searchParams.toString()}`);
};

/**
 * Obtiene producto por ID
 */
export const getProductById = async (productId: string): Promise<ApiSuccessResponse<Product>> =>
  apiRequest<Product>(`/products/${productId}`);

// ========================================
// 🏪 WAREHOUSE FUNCTIONS
// ========================================

/**
 * Obtiene almacenes
 */
export const getWarehouses = async ({ companyId }: { companyId: string }): Promise<ApiSuccessResponse<Warehouse[]>> =>
  apiRequest<Warehouse[]>(`/warehouses?companyId=${companyId}`);

/**
 * Obtiene stocks con filtros y paginación
 */
export const getStocks = async (filters: StockFilters = {}): Promise<ApiSuccessResponse<PaginatedResponse<Stock>>> => {
  const searchParams = new URLSearchParams();

  if (filters.companyId) searchParams.set('companyId', filters.companyId);
  if (filters.warehouseId) searchParams.set('warehouseId', filters.warehouseId);
  if (filters.productId) searchParams.set('productId', filters.productId);

  return apiRequest<PaginatedResponse<Stock>>(`/stocks?${searchParams.toString()}`);
};

// ========================================
// 🌍 LOCATION FUNCTIONS
// ========================================

/**
 * Obtiene departamentos de Colombia
 */
export const getDepartments = async (): Promise<ApiSuccessResponse<Department[]>> =>
  apiRequest<Department[]>('/locations/departments');

/**
 * Obtiene ciudades por departamento
 */
export const getTowns = async ({ departmentId }: { departmentId: number }): Promise<ApiSuccessResponse<Town[]>> =>
  apiRequest<Town[]>(`/locations/towns?departmentId=${departmentId}`);

// ========================================
// 👥 CONTACT FUNCTIONS
// ========================================

/**
 * Obtiene contactos con filtros y paginación
 */
export const getContacts = async (
  filters: ContactFilters = {}
): Promise<ApiSuccessResponse<PaginatedResponse<Contact>>> => {
  const searchParams = new URLSearchParams();

  if (filters.companyId) searchParams.set('companyId', filters.companyId);
  if (filters.search) searchParams.set('search', filters.search);
  if (filters.townId) searchParams.set('townId', filters.townId.toString());
  if (filters.page) searchParams.set('page', filters.page.toString());
  if (filters.limit) searchParams.set('limit', filters.limit.toString());

  return apiRequest<PaginatedResponse<Contact>>(`/contacts?${searchParams.toString()}`);
};

/**
 * Crea un nuevo contacto
 */
export const createContact = async (contactData: any): Promise<ApiSuccessResponse<Contact>> =>
  apiRequest<Contact>('/contacts', {
    method: 'POST',
    body: JSON.stringify(contactData)
  });

// ========================================
// 🧾 INVOICE FUNCTIONS
// ========================================

/**
 * Obtiene facturas con filtros y paginación
 */
export const getInvoices = async (
  filters: InvoiceFilters = {}
): Promise<ApiSuccessResponse<PaginatedResponse<SalesInvoice>>> => {
  const searchParams = new URLSearchParams();

  if (filters.companyId) searchParams.set('companyId', filters.companyId);
  if (filters.dateFrom) searchParams.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) searchParams.set('dateTo', filters.dateTo);
  if (filters.page) searchParams.set('page', filters.page.toString());
  if (filters.limit) searchParams.set('limit', filters.limit.toString());

  return apiRequest<PaginatedResponse<SalesInvoice>>(`/invoices?${searchParams.toString()}`);
};

/**
 * Obtiene factura por ID
 */
export const getInvoiceById = async (
  invoiceId: string
): Promise<ApiSuccessResponse<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }>> =>
  apiRequest<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }>(`/invoices/${invoiceId}`);

/**
 * Crea una nueva factura
 */
export const createInvoice = async (
  payload: CreateInvoicePayload
): Promise<ApiSuccessResponse<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }>> =>
  apiRequest<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }>('/invoices', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

// ========================================
// 🏪 POS SALES HISTORY FUNCTIONS
// ========================================

/**
 * Obtiene el historial de ventas POS con filtros
 * GET /api/v1/pos/sales/
 */
export const getPosSalesHistory = async (
  filters: GetPosSalesHistoryFilters = {}
): Promise<ApiSuccessResponse<PosSaleHistoryItem[]>> => {
  const searchParams = new URLSearchParams();

  if (filters.start_date) searchParams.set('start_date', filters.start_date);
  if (filters.end_date) searchParams.set('end_date', filters.end_date);
  if (filters.seller_id) searchParams.set('seller_id', filters.seller_id);
  if (filters.limit) searchParams.set('limit', filters.limit.toString());
  if (filters.offset) searchParams.set('offset', filters.offset.toString());

  const response = await apiRequest<PosSaleHistoryItem[]>(`/api/v1/pos/sales/?${searchParams.toString()}`);

  // Transform API response to match expected format
  if (Array.isArray(response.data)) {
    // API returns array directly, map to expected format
    const transformedData: PosSaleHistoryItem[] = response.data.map((sale: any) => {
      // Determine status based on API response
      let status: 'paid' | 'cancelled' | 'refunded' = 'paid';
      if (sale.status === 'cancelled') {
        status = 'cancelled';
      } else if (sale.status === 'refunded') {
        status = 'refunded';
      }

      return {
        id: sale.id,
        invoice_number: sale.number,
        created_at: sale.issue_date || sale.created_at,
        customer: sale.customer_name ? { name: sale.customer_name } : null,
        seller_name: sale.seller_name,
        products: [], // Will need to be populated from line items if available
        payments: [], // Will need to be populated from payment records if available
        subtotal: parseFloat(sale.subtotal || '0'),
        tax_amount: parseFloat(sale.taxes_total || '0'),
        total: parseFloat(sale.total_amount || '0'),
        pos_type: 'simple', // Assume simple POS type for now
        status
      };
    });

    return {
      success: true,
      data: transformedData
    };
  }

  return response as ApiSuccessResponse<PosSaleHistoryItem[]>;
};
