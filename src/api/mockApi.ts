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
  PaginatedResponse
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

  for (const item of items) {
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
  }

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
