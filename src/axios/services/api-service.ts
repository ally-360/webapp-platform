/* eslint-disable class-methods-use-this */
import axios from 'axios';
import apiClient from '../axios';
import {
  configGetWithToken,
  configPostWithToken,
  configPatchWithToken,
  configDeleteWithToken,
  configPostWithoutToken
} from '../configFetch';

import type {
  AuthCredentials,
  RegisterUser,
  changePassword,
  RegisterCompany,
  PaginationRequest,
  EntityUpdateRequest,
  RelationsRequest,
  UserUpdateRequest,
  ProfileUpdateRequest,
  CompanyUserAssignmentRequest
} from './service-interfaces';

/**
 * Servicio centralizado para todas las peticiones HTTP de la aplicación POS
 *
 * Este servicio está organizado por módulos funcionales:
 * - Auth: Autenticación y autorización
 * - Users: Gestión de usuarios y perfiles
 * - Companies: Gestión de empresas
 * - Inventory: Productos, categorías y marcas
 * - POS: Puntos de venta
 * - Location: Ubicaciones y datos geográficos
 * - Contacts: Gestión de contactos
 *
 * Todos los métodos utilizan el sistema de manejo de errores automático
 * configurado en los interceptores de Axios.
 */
class ApiService {
  // ========================================
  // 🔐 AUTH SERVICES
  // ========================================

  /**
   * Autentica un usuario con email y contraseña
   * @param credentials - Credenciales de autenticación (email, password)
   * @returns Promise con los datos de autenticación (token, user info)
   */
  async authenticateUser(credentials: AuthCredentials) {
    return apiClient.post('/auth/login', credentials);
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData - Datos del usuario a registrar
   * @returns Promise con los datos del usuario creado
   */
  async registerUser(userData: RegisterUser) {
    return apiClient.post('/auth/register', userData);
  }

  /**
   * Cambia la contraseña de un usuario autenticado
   * @param passwordData - Datos para cambio de contraseña (current, new)
   * @returns Promise con confirmación del cambio
   */
  async changeUserPassword(passwordData: changePassword) {
    return apiClient(configPatchWithToken('/auth/change-password', passwordData));
  }

  /**
   * Envía código de recuperación de contraseña al email
   * @param email - Email del usuario que solicita recuperación
   * @returns Promise con confirmación del envío
   */
  async sendPasswordResetCode(email: string) {
    return configPostWithoutToken('/auth/reset-password', { email });
  }

  // ========================================
  // 👥 USER SERVICES
  // ========================================

  /**
   * Obtiene los datos de un usuario por su ID
   * @param userId - ID del usuario a consultar
   * @returns Promise con los datos del usuario
   */
  async getUserById(userId: string) {
    return apiClient.get(`/users/${userId}`);
  }

  /**
   * Actualiza los datos de un usuario
   * @param request - Objeto con ID del usuario y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updateUser({ id, databody }: UserUpdateRequest) {
    return apiClient(configPatchWithToken(`/user/${id}`, databody));
  }

  /**
   * Actualiza el perfil de un usuario
   * @param request - Objeto con ID del usuario y datos del perfil
   * @returns Promise con el perfil actualizado
   */
  async updateUserProfile({ id, databody }: ProfileUpdateRequest) {
    return apiClient(configPatchWithToken(`/profile/${id}`, databody));
  }

  /**
   * Asigna una empresa a un usuario
   * @param request - IDs de la empresa y usuario a asociar
   * @returns Promise con confirmación de la asignación
   */
  async assignCompanyToUser({ companyId, userId }: CompanyUserAssignmentRequest) {
    return apiClient(configPostWithToken(`/companies/${companyId}/user/${userId}`));
  }

  // ========================================
  // 🏢 COMPANY SERVICES
  // ========================================

  /**
   * Obtiene la lista de todas las empresas
   * @param _options - Opciones de consulta (incluir relaciones) - Reservado para uso futuro
   * @returns Promise con la lista de empresas
   */
  async getCompaniesList(_options: RelationsRequest = {}) {
    return apiClient(configGetWithToken('/companies'));
  }

  /**
   * Obtiene una empresa específica por ID
   * @param companyId - ID de la empresa
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con los datos de la empresa
   */
  async getCompanyById(companyId: string, includeRelations = true) {
    return apiClient(configGetWithToken(`/companies/${companyId}?r=${includeRelations}`));
  }

  /**
   * Crea una nueva empresa
   * @param companyData - Datos de la empresa a crear
   * @returns Promise con los datos de la empresa creada
   */
  async createCompany(companyData: RegisterCompany) {
    return apiClient(configPostWithToken('/companies', companyData));
  }

  /**
   * Actualiza los datos de una empresa
   * @param request - ID de la empresa y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updateCompany({ id, databody }: EntityUpdateRequest) {
    return apiClient(configPatchWithToken(`/companies/${id}`, databody));
  }

  // ========================================
  // 📦 INVENTORY SERVICES
  // ========================================

  /**
   * Obtiene lista paginada de productos
   * @param pagination - Parámetros de paginación (page, pageSize)
   * @returns Promise con la lista paginada de productos
   */
  async getProductsList({ page = 0, pageSize = 25 }: PaginationRequest = {}) {
    return apiClient(configGetWithToken(`/product?page=${page}&pageSize=${pageSize}`));
  }

  /**
   * Obtiene un producto específico por ID
   * @param productId - ID del producto
   * @returns Promise con los datos del producto
   */
  async getProductById(productId: string) {
    return apiClient(configGetWithToken(`/product/${productId}`));
  }

  /**
   * Crea un nuevo producto
   * @param productData - Datos del producto a crear
   * @returns Promise con los datos del producto creado
   */
  async createProduct(productData: any) {
    return apiClient(configPostWithToken('/product', productData));
  }

  /**
   * Actualiza un producto existente
   * @param request - ID del producto y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updateProduct({ id, databody }: EntityUpdateRequest) {
    return apiClient(configPatchWithToken(`/product/${id}`, databody));
  }

  /**
   * Elimina un producto del inventario
   * @param productId - ID del producto a eliminar
   * @returns Promise con confirmación de eliminación
   */
  async deleteProduct(productId: string) {
    return apiClient(configDeleteWithToken(`/product/${productId}`));
  }

  /**
   * Obtiene todas las categorías disponibles
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con la lista de categorías
   */
  async getCategoriesList(includeRelations = true) {
    return apiClient(configGetWithToken(`/category/?r=${includeRelations}`));
  }

  /**
   * Obtiene una categoría específica por ID
   * @param categoryId - ID de la categoría
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con los datos de la categoría
   */
  async getCategoryById(categoryId: string, includeRelations = true) {
    return apiClient(configGetWithToken(`/category/${categoryId}?r=${includeRelations}`));
  }

  /**
   * Crea una nueva categoría
   * @param categoryData - Datos de la categoría a crear
   * @returns Promise con los datos de la categoría creada
   */
  async createCategory(categoryData: any) {
    return apiClient(configPostWithToken('/category', categoryData));
  }

  /**
   * Actualiza una categoría existente
   * @param request - ID de la categoría y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updateCategory({ id, databody }: EntityUpdateRequest) {
    return apiClient(configPatchWithToken(`/category/${id}`, databody));
  }

  /**
   * Elimina una categoría
   * @param categoryId - ID de la categoría a eliminar
   * @returns Promise con confirmación de eliminación
   */
  async deleteCategory(categoryId: string) {
    return apiClient(configDeleteWithToken(`/category/${categoryId}`));
  }

  /**
   * Obtiene todas las marcas disponibles
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con la lista de marcas
   */
  async getBrandsList(includeRelations = false) {
    return apiClient(configGetWithToken(`/brand?r=${includeRelations}`));
  }

  /**
   * Crea una nueva marca
   * @param brandData - Datos de la marca a crear
   * @returns Promise con los datos de la marca creada
   */
  async createBrand(brandData: any) {
    return apiClient(configPostWithToken('/brand', brandData));
  }

  /**
   * Actualiza una marca existente
   * @param request - ID de la marca y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updateBrand({ id, databody }: EntityUpdateRequest) {
    return apiClient(configPatchWithToken(`/brand/${id}`, databody));
  }

  /**
   * Elimina una marca
   * @param brandId - ID de la marca a eliminar
   * @returns Promise con confirmación de eliminación
   */
  async deleteBrand(brandId: string) {
    return apiClient(configDeleteWithToken(`/brand/${brandId}`));
  }

  // ========================================
  // 🏪 POS (POINT OF SALE) SERVICES
  // ========================================

  /**
   * Obtiene todos los puntos de venta (PDV)
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con la lista de PDVs
   */
  async getPointsOfSaleList(includeRelations = false) {
    return apiClient(configGetWithToken(`/pdv?r=${includeRelations}`));
  }

  /**
   * Obtiene un punto de venta específico por ID
   * @param pdvId - ID del punto de venta
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con los datos del PDV
   */
  async getPointOfSaleById(pdvId: string, includeRelations = true) {
    return apiClient(configGetWithToken(`/pdv/${pdvId}?r=${includeRelations}`));
  }

  /**
   * Crea un nuevo punto de venta
   * @param pdvData - Datos del PDV a crear
   * @returns Promise con los datos del PDV creado
   */
  async createPointOfSale(pdvData: any) {
    return apiClient(configPostWithToken('/warehouse', pdvData));
  }

  /**
   * Actualiza un punto de venta existente
   * @param request - ID del PDV y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updatePointOfSale({ id, databody }: EntityUpdateRequest) {
    return apiClient(configPatchWithToken(`/pdv/${id}`, databody));
  }

  /**
   * Elimina un punto de venta
   * @param pdvId - ID del PDV a eliminar
   * @returns Promise con confirmación de eliminación
   */
  async deletePointOfSale(pdvId: string) {
    return apiClient(configDeleteWithToken(`/pdv/${pdvId}`));
  }

  // ========================================
  // 📍 LOCATION SERVICES
  // ========================================

  /**
   * Obtiene todas las ubicaciones disponibles
   * @param includeRelations - Si incluir datos relacionados
   * @returns Promise con la lista de ubicaciones
   */
  async getLocationsList(includeRelations = false) {
    return apiClient(configGetWithToken(`/location?r=${includeRelations}`));
  }

  /**
   * Obtiene la lista de departamentos de Colombia (API externa)
   * @returns Promise con la lista de departamentos
   */
  async getColombianDepartments() {
    return axios.get('https://www.datos.gov.co/resource/xdk5-pm3f.json?$select=distinct%20departamento');
  }

  /**
   * Obtiene las ciudades de un departamento específico (API externa)
   * @param department - Nombre del departamento
   * @returns Promise con la lista de ciudades
   */
  async getCitiesByDepartment(department: string) {
    return axios.get(`https://www.datos.gov.co/resource/xdk5-pm3f.json?departamento=${department}`);
  }

  // ========================================
  // 📞 CONTACT SERVICES
  // ========================================

  /**
   * Obtiene todos los contactos
   * @returns Promise con la lista de contactos
   */
  async getContactsList() {
    return apiClient(configGetWithToken('/contacts'));
  }

  /**
   * Obtiene un contacto específico por ID
   * @param contactId - ID del contacto
   * @returns Promise con los datos del contacto
   */
  async getContactById(contactId: string) {
    return apiClient(configGetWithToken(`/contacts/${contactId}`));
  }

  /**
   * Crea un nuevo contacto
   * @param contactData - Datos del contacto a crear
   * @returns Promise con los datos del contacto creado
   */
  async createContact(contactData: any) {
    return apiClient(configPostWithToken('/contacts', contactData));
  }

  /**
   * Actualiza un contacto existente
   * @param request - ID del contacto y datos a actualizar
   * @returns Promise con los datos actualizados
   */
  async updateContact({ id, databody }: EntityUpdateRequest) {
    return apiClient(configPatchWithToken(`/contacts/${id}`, databody));
  }

  /**
   * Elimina un contacto
   * @param contactId - ID del contacto a eliminar
   * @returns Promise con confirmación de eliminación
   */
  async deleteContact(contactId: string) {
    return apiClient(configDeleteWithToken(`/contacts/${contactId}`));
  }
}

// Exportar instancia singleton del servicio
export default new ApiService();
