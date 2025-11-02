// ========================================
// 🎯 CAPA UNIFICADA DE API - ALLY360 POS
// ========================================

import * as mockApi from './mockApi';
import * as realApi from './realApi';

// TEMPORAL: Forzar API real para la integración con el backend
const USE_MOCK = false;

// Seleccionar implementación base
const api = USE_MOCK ? mockApi : realApi;

// ========================================
// 🔐 AUTH EXPORTS
// ========================================
const {
  login,
  register,
  getCurrentUser,
  logout,
  // ========================================
  // 🏢 COMPANY EXPORTS
  // ========================================
  getCompanies,
  getCompanyById,
  createCompany,
  // ========================================
  // 🏷️ CATALOG EXPORTS
  // ========================================
  getBrands,
  getCategories,
  getProducts,
  getProductById,
  // ========================================
  // 🏪 WAREHOUSE & INVENTORY EXPORTS
  // ========================================
  getWarehouses,
  getStocks,
  // ========================================
  // 📍 LOCATION EXPORTS
  // ========================================
  getDepartments,
  getTowns,
  // ========================================
  // 📞 CONTACT EXPORTS
  // ========================================
  getContacts,
  createContact,
  // ========================================
  // 🧾 INVOICE EXPORTS
  // ========================================
  getInvoices,
  getInvoiceById,
  createInvoice
} = api;

// ========================================
// 🏪 POS SPECIFIC EXPORTS
// ========================================
const {
  getPosSalesHistory,
  downloadSalePDF,
  cancelSale,
  createCreditNote,
  // nuevos endpoints mock para cierre de caja y reporte
  closePosRegister,
  downloadRegisterReport,
  // turnos (shift)
  getCurrentShiftStatus,
  closeCurrentShift,
  getShiftHistory,
  getShiftById,
  downloadShiftReport
} = mockApi;

/**
 * Función de compatibilidad para verificar si el sistema POS está en modo mock
 */
export const isPOSMockMode = () => true;

// ========================================
// 📊 API METADATA
// ========================================
export const API_INFO = {
  mode: 'mock',
  isMockActive: true,
  version: '1.0.0',
  description: 'Sistema de mock quemado para desarrollo sin backend'
};

// ========================================
// 🛠️ UTILIDADES GENERALES
// ========================================

/**
 * Obtiene información sobre el estado actual de la API
 */
export const getApiInfo = () => API_INFO;

/**
 * Verifica si el sistema mock está activo
 */
export const isMockMode = () => true;

/**
 * Obtiene configuración de ambiente
 */
export const getEnvironmentConfig = () => {
  try {
    const env = (import.meta as any)?.env;
    return {
      VITE_USE_MOCK: env?.VITE_USE_MOCK,
      VITE_API_URL: env?.VITE_API_URL,
      VITE_API_VERSION: env?.VITE_API_VERSION,
      NODE_ENV: env?.NODE_ENV
    };
  } catch {
    return {
      VITE_USE_MOCK: 'false',
      VITE_API_URL: 'http://localhost:3000',
      VITE_API_VERSION: 'api/v1',
      NODE_ENV: 'development'
    };
  }
};

// ========================================
// 📤 EXPORTS
// ========================================
export {
  // Auth
  login,
  register,
  getCurrentUser,
  logout,
  // Company
  getCompanies,
  getCompanyById,
  createCompany,
  // Catalog
  getBrands,
  getCategories,
  getProducts,
  getProductById,
  // Warehouse & Inventory
  getWarehouses,
  getStocks,
  // Location
  getDepartments,
  getTowns,
  // Contacts
  getContacts,
  createContact,
  // Invoices
  getInvoices,
  getInvoiceById,
  createInvoice,
  // POS (forzado mock)
  getPosSalesHistory,
  downloadSalePDF,
  cancelSale,
  createCreditNote,
  closePosRegister,
  downloadRegisterReport,
  // Shifts (mock)
  getCurrentShiftStatus,
  closeCurrentShift,
  getShiftHistory,
  getShiftById,
  downloadShiftReport
};
