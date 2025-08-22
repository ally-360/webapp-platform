// ========================================
// 🎯 CAPA UNIFICADA DE API - ALLY360 POS
// ========================================

import * as mockApi from './mockApi';
import * as realApi from './realApi';

// Determinar qué API usar basado en variable de entorno
const getUseMock = (): boolean => {
  try {
    return (import.meta.env as any)?.VITE_USE_MOCK === 'true';
  } catch {
    return false;
  }
};

const USE_MOCK = getUseMock();

// ========================================
// 🔐 AUTH EXPORTS
// ========================================
export const login = USE_MOCK ? mockApi.login : realApi.login;
export const register = USE_MOCK ? mockApi.register : realApi.register;
export const getCurrentUser = USE_MOCK ? mockApi.getCurrentUser : realApi.getCurrentUser;
export const logout = USE_MOCK ? mockApi.logout : realApi.logout;

// ========================================
// 🏢 COMPANY EXPORTS
// ========================================
export const getCompanies = USE_MOCK ? mockApi.getCompanies : realApi.getCompanies;
export const getCompanyById = USE_MOCK ? mockApi.getCompanyById : realApi.getCompanyById;
export const createCompany = USE_MOCK ? mockApi.createCompany : realApi.createCompany;

// ========================================
// 🏷️ CATALOG EXPORTS
// ========================================
export const getBrands = USE_MOCK ? mockApi.getBrands : realApi.getBrands;
export const getCategories = USE_MOCK ? mockApi.getCategories : realApi.getCategories;
export const getProducts = USE_MOCK ? mockApi.getProducts : realApi.getProducts;
export const getProductById = USE_MOCK ? mockApi.getProductById : realApi.getProductById;

// ========================================
// 🏪 WAREHOUSE & INVENTORY EXPORTS
// ========================================
export const getWarehouses = USE_MOCK ? mockApi.getWarehouses : realApi.getWarehouses;
export const getStocks = USE_MOCK ? mockApi.getStocks : realApi.getStocks;

// ========================================
// 📍 LOCATION EXPORTS
// ========================================
export const getDepartments = USE_MOCK ? mockApi.getDepartments : realApi.getDepartments;
export const getTowns = USE_MOCK ? mockApi.getTowns : realApi.getTowns;

// ========================================
// 📞 CONTACT EXPORTS
// ========================================
export const getContacts = USE_MOCK ? mockApi.getContacts : realApi.getContacts;
export const createContact = USE_MOCK ? mockApi.createContact : realApi.createContact;

// ========================================
// 🧾 INVOICE EXPORTS
// ========================================
export const getInvoices = USE_MOCK ? mockApi.getInvoices : realApi.getInvoices;
export const getInvoiceById = USE_MOCK ? mockApi.getInvoiceById : realApi.getInvoiceById;
export const createInvoice = USE_MOCK ? mockApi.createInvoice : realApi.createInvoice;

// ========================================
// 🏪 POS SPECIFIC EXPORTS
// ========================================
// Funciones que solo existen en posRealApi, usar mock genérico si es necesario
// export const openShift = USE_MOCK ? mockApi.createInvoice : posRealApi.openShift; // Placeholder temporal
// export const getActiveShift = USE_MOCK ? mockApi.getInvoices : posRealApi.getActiveShift; // Placeholder temporal
// export const closeShift = USE_MOCK ? mockApi.createInvoice : posRealApi.closeShift; // Placeholder temporal
// export const searchProducts = USE_MOCK ? mockApi.getProducts : posRealApi.searchProducts;
// export const createSale = USE_MOCK ? mockApi.createInvoice : posRealApi.createSale; // Placeholder temporal
// export const addPayment = USE_MOCK ? mockApi.createInvoice : posRealApi.addPayment; // Placeholder temporal
// export const getSales = USE_MOCK ? mockApi.getInvoices : posRealApi.getSales;
// export const getSaleById = USE_MOCK ? mockApi.getInvoiceById : posRealApi.getSaleById;

/**
 * Función de compatibilidad para verificar si el sistema POS está en modo mock
 */
export const isPOSMockMode = () => USE_MOCK;

// ========================================
// 📊 API METADATA
// ========================================
export const API_INFO = {
  mode: USE_MOCK ? 'mock' : 'real',
  isMockActive: USE_MOCK,
  version: '1.0.0',
  description: USE_MOCK
    ? 'Sistema de mock quemado para desarrollo sin backend'
    : 'API real conectada al backend de producción'
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
export const isMockMode = () => USE_MOCK;

/**
 * Obtiene configuración de ambiente
 */
export const getEnvironmentConfig = () => {
  try {
    const env = import.meta.env as any;
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
// 🔍 DEBUG INFO
// ========================================
if (typeof window !== 'undefined' && window.console) {
  const mode = USE_MOCK ? '🎭 MOCK' : '🌐 REAL';
  console.log(`%c[ALLY360 API] Modo activo: ${mode}`, 'color: #00bcd4; font-weight: bold');

  if (USE_MOCK) {
    console.log(
      '%c[ALLY360 API] 🎭 Sistema Mock activo:\n' +
        '• Datos quemados en memoria\n' +
        '• Usuario de prueba: example@gmail.com / 123456\n' +
        '• Sin conexión a backend\n' +
        '• Para desactivar: VITE_USE_MOCK=false',
      'color: #ff9800; font-size: 12px'
    );
  } else {
    console.log(
      '%c[ALLY360 API] 🌐 API Real activa:\n' +
        '• Conectando al backend\n' +
        '• Autenticación JWT requerida\n' +
        '• Para activar mock: VITE_USE_MOCK=true',
      'color: #4caf50; font-size: 12px'
    );
  }
}
