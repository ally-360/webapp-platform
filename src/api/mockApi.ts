// ========================================
// 🎭 MOCK API - ALLY360 POS
// ========================================

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
  ContactIdentity,
  SalesInvoice,
  SalesInvoiceItem,
  ProductFilters,
  ContactFilters,
  InvoiceFilters,
  StockFilters,
  CreateInvoicePayload,
  ApiSuccessResponse,
  PaginatedResponse,
  // POS types
  PosSaleHistoryItem,
  GetPosSalesHistoryFilters
} from './types';

import {
  companies,
  users,
  profiles,
  brands,
  categories,
  products,
  warehouses,
  stocks,
  departments,
  towns,
  contacts,
  contactIdentities,
  salesInvoices,
  salesInvoiceItems,
  userCompanyRelations
} from './mock/db';

import {
  delay,
  paginate,
  genInvoiceNumber,
  generateId,
  generateContactId,
  generateContactIdentityId,
  searchInFields,
  filterByField,
  validateMockToken,
  createSuccessResponse,
  decodeMockToken
} from './mock/utils';

// ========================================
// 🔐 AUTH FUNCTIONS
// ========================================

/**
 * Autentica un usuario con email y contraseña
 */
export const login = async (credentials: AuthCredentials): Promise<ApiSuccessResponse<AuthResponse>> => {
  await delay();

  const { email, password } = credentials;

  // Buscar usuario por email
  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    throw new Error('Credenciales inválidas');
  }

  // Obtener perfil del usuario
  const profile = profiles.find((p) => p.userId === user.id);
  if (!profile) {
    throw new Error('Perfil de usuario no encontrado');
  }

  // Obtener empresas del usuario
  const userCompanies = userCompanyRelations.get(user.id) || [];
  const userCompaniesData = companies.filter((c) => userCompanies.includes(c.id));

  // Generar token
  const token = `mock-jwt-${user.id}`;

  // Guardar en localStorage (simulando comportamiento del frontend)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('companyId', userCompaniesData[0]?.id || '');
  }

  return createSuccessResponse({
    token,
    user,
    profile,
    companies: userCompaniesData
  });
};

/**
 * Registra un nuevo usuario
 */
export const register = async (userData: RegisterUserData): Promise<ApiSuccessResponse<AuthResponse>> => {
  await delay();

  const { email, password, name, lastname, dni, personalPhoneNumber } = userData;

  // Verificar si el email ya existe
  if (users.some((u) => u.email === email)) {
    throw new Error('El email ya está registrado');
  }

  // Crear nuevo usuario
  const newUser: User = {
    id: generateId(),
    email,
    password,
    verified: true,
    authId: generateId(),
    firstLogin: true
  };

  // Crear perfil
  const newProfile: Profile = {
    id: generateId(),
    userId: newUser.id,
    name,
    lastname,
    dni,
    personalPhoneNumber,
    photo: `https://i.pravatar.cc/150?u=${email}`
  };

  // Agregar a las colecciones
  users.push(newUser);
  profiles.push(newProfile);

  // Asignar a la primera empresa por defecto (demo)
  userCompanyRelations.set(newUser.id, [companies[0].id]);

  // Generar token
  const token = `mock-jwt-${newUser.id}`;

  return createSuccessResponse({
    token,
    user: newUser,
    profile: newProfile,
    companies: [companies[0]]
  });
};

/**
 * Obtiene el usuario actual basado en el token
 */
export const getCurrentUser = async (): Promise<
  ApiSuccessResponse<{ user: User; profile: Profile; companies: Company[] }>
> => {
  await delay();

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (!token || !validateMockToken(token)) {
    throw new Error('Token inválido o expirado');
  }

  const decoded = decodeMockToken(token);
  if (!decoded) {
    throw new Error('Token malformado');
  }

  const userId = decoded.userId.replace('mock-jwt-', '');
  const user = users.find((u) => u.id === userId);
  const profile = profiles.find((p) => p.userId === userId);

  if (!user || !profile) {
    throw new Error('Usuario no encontrado');
  }

  const userCompanies = userCompanyRelations.get(userId) || [];
  const userCompaniesData = companies.filter((c) => userCompanies.includes(c.id));

  return createSuccessResponse({
    user,
    profile,
    companies: userCompaniesData
  });
};

/**
 * Cierra sesión del usuario
 */
export const logout = async (): Promise<ApiSuccessResponse<{ message: string }>> => {
  await delay();

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('companyId');
  }

  return createSuccessResponse({ message: 'Sesión cerrada exitosamente' });
};

// ========================================
// 🏢 COMPANY FUNCTIONS
// ========================================

/**
 * Obtiene lista de empresas
 */
export const getCompanies = async (): Promise<ApiSuccessResponse<Company[]>> => {
  await delay();
  return createSuccessResponse(companies);
};

/**
 * Obtiene una empresa por ID
 */
export const getCompanyById = async (companyId: string): Promise<ApiSuccessResponse<Company>> => {
  await delay();

  const company = companies.find((c) => c.id === companyId);
  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  return createSuccessResponse(company);
};

/**
 * Crea una nueva empresa
 */
export const createCompany = async (companyData: RegisterCompanyData): Promise<ApiSuccessResponse<Company>> => {
  await delay();

  const newCompany: Company = {
    id: generateId(),
    ...companyData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  companies.push(newCompany);

  return createSuccessResponse(newCompany);
};

// ========================================
// 🏷️ BRAND FUNCTIONS
// ========================================

/**
 * Obtiene marcas de una empresa
 */
export const getBrands = async ({ companyId }: { companyId: string }): Promise<ApiSuccessResponse<Brand[]>> => {
  await delay();

  const companyBrands = brands.filter((b) => b.companyId === companyId);
  return createSuccessResponse(companyBrands);
};

// ========================================
// 📂 CATEGORY FUNCTIONS
// ========================================

/**
 * Obtiene categorías de una empresa
 */
export const getCategories = async ({ companyId }: { companyId: string }): Promise<ApiSuccessResponse<Category[]>> => {
  await delay();

  const companyCategories = categories.filter((c) => c.companyId === companyId);
  return createSuccessResponse(companyCategories);
};

// ========================================
// 🛍️ PRODUCT FUNCTIONS
// ========================================

/**
 * Obtiene productos con filtros y paginación
 */
export const getProducts = async (
  filters: ProductFilters = {}
): Promise<ApiSuccessResponse<PaginatedResponse<Product>>> => {
  await delay();

  const { companyId, brandId, categoryId, search, page = 0, limit = 25 } = filters;

  let filteredProducts = [...products];

  // Filtrar por empresa
  if (companyId) {
    filteredProducts = filterByField(filteredProducts, 'companyId', companyId);
  }

  // Filtrar por marca
  if (brandId) {
    filteredProducts = filterByField(filteredProducts, 'brandId', brandId);
  }

  // Filtrar por categoría
  if (categoryId) {
    filteredProducts = filterByField(filteredProducts, 'categoryId', categoryId);
  }

  // Buscar por texto
  if (search) {
    filteredProducts = searchInFields(filteredProducts, search, ['name', 'description', 'barCode', 'sku']);
  }

  const paginatedResponse = paginate(filteredProducts, page, limit);

  return createSuccessResponse(paginatedResponse);
};

/**
 * Obtiene un producto por ID
 */
export const getProductById = async (productId: string): Promise<ApiSuccessResponse<Product>> => {
  await delay();

  const product = products.find((p) => p.id === productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  return createSuccessResponse(product);
};

// ========================================
// 🏪 WAREHOUSE FUNCTIONS
// ========================================

/**
 * Obtiene bodegas/PDVs de una empresa
 */
export const getWarehouses = async ({ companyId }: { companyId: string }): Promise<ApiSuccessResponse<Warehouse[]>> => {
  await delay();

  const companyWarehouses = warehouses.filter((w) => w.companyId === companyId);
  return createSuccessResponse(companyWarehouses);
};

// ========================================
// 📦 STOCK FUNCTIONS
// ========================================

/**
 * Obtiene inventario con filtros
 */
export const getStocks = async (filters: StockFilters = {}): Promise<ApiSuccessResponse<Stock[]>> => {
  await delay();

  const { companyId, warehouseId, productId } = filters;

  let filteredStocks = [...stocks];

  // Filtrar por bodega si se especifica
  if (warehouseId) {
    filteredStocks = filterByField(filteredStocks, 'warehouseId', warehouseId);
  }

  // Filtrar por producto si se especifica
  if (productId) {
    filteredStocks = filterByField(filteredStocks, 'productId', productId);
  }

  // Si se especifica empresa, filtrar por bodegas de la empresa
  if (companyId) {
    const companyWarehouseIds = warehouses.filter((w) => w.companyId === companyId).map((w) => w.id);

    filteredStocks = filteredStocks.filter((s) => companyWarehouseIds.includes(s.warehouseId));
  }

  return createSuccessResponse(filteredStocks);
};

// ========================================
// 📍 LOCATION FUNCTIONS
// ========================================

/**
 * Obtiene departamentos de Colombia
 */
export const getDepartments = async (): Promise<ApiSuccessResponse<Department[]>> => {
  await delay();
  return createSuccessResponse(departments);
};

/**
 * Obtiene ciudades de un departamento
 */
export const getTowns = async ({ departmentId }: { departmentId: number }): Promise<ApiSuccessResponse<Town[]>> => {
  await delay();

  const departmentTowns = towns.filter((t) => t.departmentId === departmentId);
  return createSuccessResponse(departmentTowns);
};

// ========================================
// 📞 CONTACT FUNCTIONS
// ========================================

/**
 * Obtiene contactos con filtros
 */
export const getContacts = async (filters: ContactFilters = {}): Promise<ApiSuccessResponse<Contact[]>> => {
  await delay();

  const { companyId, townId, search } = filters;

  let filteredContacts = [...contacts];

  // Filtrar por empresa
  if (companyId) {
    filteredContacts = filterByField(filteredContacts, 'companyId', companyId);
  }

  // Filtrar por ciudad
  if (townId) {
    filteredContacts = filterByField(filteredContacts, 'townId', townId);
  }

  // Buscar por texto
  if (search) {
    filteredContacts = searchInFields(filteredContacts, search, ['name', 'lastname', 'email']);
  }

  return createSuccessResponse(filteredContacts);
};

/**
 * Crea un nuevo contacto
 */
export const createContact = async (
  contactData: Omit<Contact, 'id' | 'identityId'> & { identity: Omit<ContactIdentity, 'id'> }
): Promise<ApiSuccessResponse<Contact>> => {
  await delay();

  // Crear identidad del contacto
  const newIdentity: ContactIdentity = {
    id: generateContactIdentityId(),
    ...contactData.identity
  };

  // Crear contacto
  const newContact: Contact = {
    id: generateContactId(),
    identityId: newIdentity.id,
    ...contactData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Agregar a las colecciones
  contactIdentities.push(newIdentity);
  contacts.push(newContact);

  return createSuccessResponse(newContact);
};

// ========================================
// 🧾 INVOICE FUNCTIONS
// ========================================

/**
 * Obtiene facturas con filtros
 */
export const getInvoices = async (
  filters: InvoiceFilters = {}
): Promise<ApiSuccessResponse<PaginatedResponse<SalesInvoice>>> => {
  await delay();

  const { companyId, page = 0, limit = 25 } = filters;

  let filteredInvoices = [...salesInvoices];

  // Filtrar por empresa
  if (companyId) {
    filteredInvoices = filterByField(filteredInvoices, 'companyId', companyId);
  }

  const paginatedResponse = paginate(filteredInvoices, page, limit);

  return createSuccessResponse(paginatedResponse);
};

/**
 * Obtiene una factura por ID
 */
export const getInvoiceById = async (
  invoiceId: string
): Promise<ApiSuccessResponse<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }>> => {
  await delay();

  const invoice = salesInvoices.find((i) => i.id === invoiceId);
  if (!invoice) {
    throw new Error('Factura no encontrada');
  }

  const items = salesInvoiceItems.filter((item) => item.salesInvoiceId === invoiceId);

  return createSuccessResponse({ invoice, items });
};

/**
 * Crea una nueva factura
 */
export const createInvoice = async (
  payload: CreateInvoicePayload
): Promise<ApiSuccessResponse<{ invoice: SalesInvoice; items: SalesInvoiceItem[] }>> => {
  await delay();

  const {
    companyId,
    invoiceCustomerId,
    items,
    paymentMethod,
    shipping = 0,
    method = 'CONTADO',
    paymentTerm = 'INMEDIATO'
  } = payload;

  // Obtener empresa para generar número de factura
  const company = companies.find((c) => c.id === companyId);
  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  // Calcular totales basado en items
  const invoiceItems: SalesInvoiceItem[] = [];
  let subtotal = 0;

  // Reemplazar for..of por forEach para evitar necesidad de regenerator-runtime
  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Producto ${item.productId} no encontrado`);
    }

    const itemTotal = item.quantity * item.price;
    const itemTaxes = Math.round(itemTotal * 0.19); // 19% IVA

    const invoiceItem: SalesInvoiceItem = {
      id: generateId(),
      product: product.name,
      quantity: item.quantity,
      price: item.price,
      taxes: itemTaxes,
      total: itemTotal,
      salesInvoiceId: '', // Se asignará después
      productId: item.productId
    };

    invoiceItems.push(invoiceItem);
    subtotal += itemTotal;
  });

  const totalTaxes = Math.round(subtotal * 0.19);
  const totalAmount = subtotal + totalTaxes + shipping;

  // Crear factura
  const newInvoice: SalesInvoice = {
    id: generateId(),
    invoiceNumber: genInvoiceNumber(company),
    createDate: new Date().toISOString(),
    totalTaxes,
    shipping,
    status: 1,
    method,
    paymentTerm,
    totalAmount,
    currency: 'COP',
    paymentMethod,
    invoiceCustomerId,
    companyId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Actualizar salesInvoiceId en items
  invoiceItems.forEach((item) => {
    item.salesInvoiceId = newInvoice.id;
  });

  // Agregar a las colecciones
  salesInvoices.push(newInvoice);
  salesInvoiceItems.push(...invoiceItems);

  return createSuccessResponse({ invoice: newInvoice, items: invoiceItems });
};

// ========================================
// 🏪 POS SALES HISTORY (MOCK)
// ========================================

// In-memory POS sales cache to support optimistic updates between calls
let posSalesCache: PosSaleHistoryItem[] | null = null;

function seedPosSalesCache(): PosSaleHistoryItem[] {
  if (posSalesCache) return posSalesCache;

  const now = new Date();
  const base: PosSaleHistoryItem[] = [];

  // A couple of static rows
  base.push({
    id: 'pos-sale-001',
    invoice_number: 'TECH-001',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    customer: { name: 'Carlos Martínez' },
    seller_name: 'Juan Carlos',
    products: [{ id: 'prod-tech-001', name: 'Samsung Galaxy S24', quantity: 1, price: 3300000 }],
    payments: [{ method: 'card', amount: 3477000 }],
    subtotal: 3300000,
    tax_amount: 177000,
    total: 3477000,
    pos_type: 'simple',
    status: 'paid'
  });

  base.push({
    id: 'pos-sale-002',
    invoice_number: 'DORADO-001',
    created_at: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 13).toISOString(),
    customer: { name: 'Luis García' },
    seller_name: 'María Elena',
    products: [
      { id: 'prod-dorado-001', name: 'Camiseta Nike Dri-FIT', quantity: 2, price: 120000 },
      { id: 'prod-dorado-003', name: 'Zapatillas Nike Air Max 270', quantity: 1, price: 550000 }
    ],
    payments: [{ method: 'cash', amount: 1021000 }],
    subtotal: 910000,
    tax_amount: 111000,
    total: 1021000,
    pos_type: 'electronic',
    status: 'paid'
  });

  // Synthetic recent rows (last 14 days)
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const isElectronic = i % 2 === 0;
    const id = `pos-sale-synth-${i.toString().padStart(2, '0')}`;

    let items: { id: string; name: string; quantity: number; price: number }[];
    if (i % 3 === 0) {
      items = [{ id: 'prod-tech-005', name: 'Logitech MX Master 3S', quantity: 1, price: 380000 }];
    } else {
      items = [
        { id: 'prod-dorado-001', name: 'Camiseta Nike Dri-FIT', quantity: 1 + (i % 2), price: 120000 },
        { id: 'prod-dorado-003', name: 'Zapatillas Nike Air Max 270', quantity: 1, price: 550000 }
      ];
    }

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * 0.19);
    const total = subtotal + tax;

    base.push({
      id,
      invoice_number: isElectronic ? `E-10${i}` : `S-20${i}`,
      created_at: d.toISOString(),
      customer: { name: i % 2 === 0 ? 'Cliente Demo' : 'Empresa TechCorp SAS' },
      seller_name: i % 2 === 0 ? 'Juan Carlos' : 'María Elena',
      products: items,
      payments: [{ method: isElectronic ? 'card' : 'cash', amount: total }],
      subtotal,
      tax_amount: tax,
      total,
      pos_type: isElectronic ? 'electronic' : 'simple',
      status: 'paid'
    });
  }

  posSalesCache = base.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return posSalesCache;
}

function applyPosFilters(data: PosSaleHistoryItem[], filters: GetPosSalesHistoryFilters): PosSaleHistoryItem[] {
  let out = [...data];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    out = out.filter(
      (row) =>
        (row.invoice_number || '').toLowerCase().includes(q) ||
        (row.customer?.name || '').toLowerCase().includes(q) ||
        (row.seller_name || '').toLowerCase().includes(q)
    );
  }

  if (filters.pos_type && filters.pos_type !== 'all') {
    out = out.filter((row) => row.pos_type === filters.pos_type);
  }

  if (filters.dateFrom && filters.dateTo) {
    const start = new Date(filters.dateFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    const s = start.getTime();
    const e = end.getTime();
    out = out.filter((row) => {
      const t = new Date(row.created_at).getTime();
      return t >= s && t <= e;
    });
  }

  return out;
}

export const getPosSalesHistory = async (
  filters: GetPosSalesHistoryFilters = {}
): Promise<ApiSuccessResponse<PaginatedResponse<PosSaleHistoryItem>>> => {
  await delay(200);
  const all = seedPosSalesCache();
  const filtered = applyPosFilters(all, filters);

  const page = filters.page ?? 0;
  const limit = filters.limit ?? 50;
  const start = page * limit;
  const end = start + limit;
  const pageData = filtered.slice(start, end);

  return createSuccessResponse({
    data: pageData,
    total: filtered.length,
    page,
    limit,
    hasNext: end < filtered.length,
    hasPrev: page > 0
  });
};

export const downloadSalePDF = async (saleId: string): Promise<ApiSuccessResponse<{ url: string }>> => {
  await delay(150);
  const url = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#sale=${encodeURIComponent(
    saleId
  )}`;
  return createSuccessResponse({ url });
};

export const cancelSale = async (saleId: string): Promise<ApiSuccessResponse<{ id: string; status: 'cancelled' }>> => {
  await delay(200);
  const all = seedPosSalesCache();
  const idx = all.findIndex((s) => s.id === saleId);
  if (idx === -1) throw new Error('Venta no encontrada');
  all[idx] = { ...all[idx], status: 'cancelled' };
  posSalesCache = [...all];
  return createSuccessResponse({ id: saleId, status: 'cancelled' });
};

export const createCreditNote = async (
  saleId: string,
  _payload: { reason?: string }
): Promise<ApiSuccessResponse<{ id: string; status: 'refunded'; creditNoteId: string }>> => {
  await delay(220);
  const all = seedPosSalesCache();
  const idx = all.findIndex((s) => s.id === saleId);
  if (idx === -1) throw new Error('Venta no encontrada');
  all[idx] = { ...all[idx], status: 'refunded' };
  posSalesCache = [...all];
  return createSuccessResponse({ id: saleId, status: 'refunded', creditNoteId: `CN-${Date.now()}` });
};

// ----------------------------------------
// 🔒 POS: Cerrar Caja (mock)
// ----------------------------------------
export const closePosRegister = async (
  payload: any
): Promise<ApiSuccessResponse<{ id: string; closedAt: string; summary: any }>> => {
  await delay(250);
  return createSuccessResponse({ id: `close-${Date.now()}`, closedAt: new Date().toISOString(), summary: payload });
};

// ----------------------------------------
// ⬇️ POS: Descargar reporte de cierre (mock)
// ----------------------------------------
export const downloadRegisterReport = async (
  format: 'pdf' | 'excel',
  params: { dateFrom?: string; dateTo?: string }
): Promise<ApiSuccessResponse<{ url: string; format: string; params: any }>> => {
  await delay(150);
  const q = new URLSearchParams({ ...(params as any), format }).toString();
  const url =
    format === 'pdf'
      ? `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?${q}`
      : `https://raw.githubusercontent.com/cs109/2014_data/master/countries.csv?${q}`;
  return createSuccessResponse({ url, format, params });
};

// ----------------------------------------
// 🕒 POS: Turnos (mock)
// ----------------------------------------

type ShiftStatus = 'open' | 'closed' | 'error';

type ShiftSummary = {
  salesTotal: number;
  byMethod: Record<string, number>;
  topProducts: Array<{ id: string; name: string; qty: number; total: number }>;
  expectedCash: number; // efectivo de ventas
  openingCash: number; // fondo inicial
  cashInDrawer: number; // openingCash + expectedCash
};

type ShiftItem = {
  id: string;
  user: { id: string; name: string };
  pos: { id: string; name: string };
  openedAt: string; // ISO
  closedAt?: string | null;
  status: ShiftStatus;
  notes?: string;
  countedCash?: number | null;
  summary: ShiftSummary;
  difference?: number | null; // countedCash - cashInDrawer
};

let shiftsCache: ShiftItem[] = [];
let currentShiftCache: ShiftItem | null = null;

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeDaySummary(dateYMD: string, openingCash = 0): ShiftSummary {
  const all = seedPosSalesCache();
  const [y, m, d] = dateYMD.split('-').map((n) => Number(n));
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  const s = start.getTime();
  const e = end.getTime();
  const daySales = all.filter((row) => {
    const t = new Date(row.created_at).getTime();
    return t >= s && t <= e;
  });

  const byMethod: Record<string, number> = {};
  let salesTotal = 0;
  const productMap = new Map<string, { id: string; name: string; qty: number; total: number }>();

  daySales.forEach((row) => {
    salesTotal += row.total || 0;
    (row.payments || []).forEach((p: any) => {
      byMethod[p.method] = (byMethod[p.method] || 0) + (p.amount || 0);
    });
    (row.products || []).forEach((p: any) => {
      const key = p.id || p.name;
      const prev = productMap.get(key) || { id: key, name: p.name, qty: 0, total: 0 };
      prev.qty += p.quantity || 0;
      prev.total += (p.price || 0) * (p.quantity || 0);
      productMap.set(key, prev);
    });
  });

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const expectedCash = byMethod.cash || 0;
  const cashInDrawer = openingCash + expectedCash;

  return { salesTotal, byMethod, topProducts, expectedCash, openingCash, cashInDrawer };
}

function seedShifts() {
  if (shiftsCache.length) return shiftsCache;
  const today = new Date();
  // Generate last 10 days of closed shifts
  for (let i = 10; i >= 1; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ymd = formatYMD(d);
    const openingCash = Math.round(50000 + Math.random() * 100000);
    const summary = computeDaySummary(ymd, openingCash);
    const countedCash = Math.round(summary.cashInDrawer + (Math.random() * 20000 - 10000));
    const difference = countedCash - summary.cashInDrawer;
    shiftsCache.push({
      id: `shift-${ymd}`,
      user: { id: 'u-1', name: 'Cajero Demo' },
      pos: { id: 'pos-1', name: 'Caja 1' },
      openedAt: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8, 0, 0).toISOString(),
      closedAt: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0, 0).toISOString(),
      status: 'closed',
      notes: difference === 0 ? undefined : 'Ajuste en conteo',
      countedCash,
      summary,
      difference
    });
  }
  return shiftsCache;
}

function seedCurrentShift() {
  if (currentShiftCache) return currentShiftCache;
  const today = new Date();
  const ymd = formatYMD(today);
  const openingCash = 80000;
  const summary = computeDaySummary(ymd, openingCash);
  currentShiftCache = {
    id: `shift-${ymd}-current`,
    user: { id: 'u-1', name: 'Cajero Demo' },
    pos: { id: 'pos-1', name: 'Caja 1' },
    openedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0, 0).toISOString(),
    closedAt: null,
    status: 'open',
    summary,
    countedCash: null,
    difference: null
  };
  return currentShiftCache;
}

export const getCurrentShiftStatus = async (): Promise<ApiSuccessResponse<ShiftItem>> => {
  await delay(150);
  seedShifts();
  const curr = seedCurrentShift();
  // Recompute live summary on each call
  const ymd = formatYMD(new Date());
  const opening = curr.summary.openingCash;
  const summary = computeDaySummary(ymd, opening);
  currentShiftCache = { ...curr, summary };
  return createSuccessResponse(currentShiftCache);
};

export const closeCurrentShift = async (
  payload: {
    countedCash: number;
    notes?: string;
  }
): Promise<ApiSuccessResponse<ShiftItem>> => {
  await delay(250);
  const curr = seedCurrentShift();
  const now = new Date();
  const summary = computeDaySummary(formatYMD(now), curr.summary.openingCash);
  const difference = payload.countedCash - summary.cashInDrawer;
  const closed: ShiftItem = {
    ...curr,
    closedAt: now.toISOString(),
    status: 'closed',
    countedCash: payload.countedCash,
    notes: payload.notes,
    summary,
    difference
  };
  // Save and clear current
  shiftsCache = [...seedShifts(), closed];
  currentShiftCache = null;
  return createSuccessResponse(closed);
};

export const getShiftHistory = async (
  filters: { dateFrom?: string; dateTo?: string; userId?: string; posId?: string; page?: number; limit?: number } = {}
): Promise<ApiSuccessResponse<PaginatedResponse<ShiftItem>>> => {
  await delay(180);
  const all = [...seedShifts()];
  // Include open current shift as first row with live summary
  if (seedCurrentShift()) {
    const curr = await getCurrentShiftStatus();
    if (curr.data.status === 'open') {
      all.unshift(curr.data);
    }
  }

  let out = all;
  if (filters.dateFrom && filters.dateTo) {
    const s = new Date(filters.dateFrom);
    s.setHours(0, 0, 0, 0);
    const e = new Date(filters.dateTo);
    e.setHours(23, 59, 59, 999);
    const sMs = s.getTime();
    const eMs = e.getTime();
    out = out.filter((sh) => {
      const t = new Date(sh.openedAt).getTime();
      return t >= sMs && t <= eMs;
    });
  }
  if (filters.userId) out = out.filter((sh) => sh.user.id === filters.userId);
  if (filters.posId) out = out.filter((sh) => sh.pos.id === filters.posId);

  const page = filters.page ?? 0;
  const limit = filters.limit ?? 20;
  const start = page * limit;
  const end = start + limit;
  const pageData = out.slice(start, end);

  return createSuccessResponse({
    data: pageData,
    total: out.length,
    page,
    limit,
    hasNext: end < out.length,
    hasPrev: page > 0
  });
};

export const getShiftById = async (id: string): Promise<ApiSuccessResponse<ShiftItem>> => {
  await delay(120);
  if (currentShiftCache && currentShiftCache.id === id) {
    return createSuccessResponse(currentShiftCache);
  }
  const all = seedShifts();
  const found = all.find((s) => s.id === id);
  if (!found) throw new Error('Turno no encontrado');
  return createSuccessResponse(found);
};

export const downloadShiftReport = async (
  format: 'pdf' | 'excel',
  params: { id?: string; dateFrom?: string; dateTo?: string }
): Promise<ApiSuccessResponse<{ url: string; format: string; params: any }>> => {
  await delay(150);
  const q = new URLSearchParams({ ...(params as any), format }).toString();
  const url =
    format === 'pdf'
      ? `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf?${q}`
      : `https://raw.githubusercontent.com/cs109/2014_data/master/countries.csv?${q}`;
  return createSuccessResponse({ url, format, params });
};
