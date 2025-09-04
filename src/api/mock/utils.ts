// ========================================
// 🛠️ UTILIDADES PARA MOCK API - ALLY360 POS
// ========================================

import { Company } from '../types';
import { counters } from './db';

/**
 * Simula latencia de red
 * @param ms Milisegundos a esperar (300-600ms)
 */
export const delay = (ms: number = Math.floor(Math.random() * 300) + 300): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Pagina un array de elementos
 * @param arr Array a paginar
 * @param page Página actual (0-based)
 * @param limit Elementos por página
 */
export function paginate<T>(arr: T[], page = 0, limit = 25) {
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const data = arr.slice(startIndex, endIndex);

  return {
    data,
    total: arr.length,
    page,
    limit,
    hasNext: endIndex < arr.length,
    hasPrev: page > 0
  };
}

/**
 * Calcula los totales de una factura basado en sus items
 * @param items Array de items de factura
 */
export function calcInvoiceTotals(items: { quantity: number; price: number }[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxes = Math.round(subtotal * 0.19); // 19% IVA
  const total = subtotal + taxes;

  return {
    subtotal,
    taxes,
    total
  };
}

/**
 * Genera un número de factura secuencial para la empresa
 * @param company Empresa para la cual generar el número
 */
export function genInvoiceNumber(company: Company): string {
  const prefix = company.name.split(' ')[0].toUpperCase().substring(0, 6);
  const currentNumber = counters.invoiceNumber[company.id] || 1;
  counters.invoiceNumber[company.id] = currentNumber + 1;

  return `${prefix}-${String(currentNumber).padStart(3, '0')}`;
}

/**
 * Genera un UUID único (mock simple)
 */
export const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Genera un ID numérico incremental para contactos
 */
export const generateContactId = (): number => {
  counters.contactId += 1;
  return counters.contactId;
};

/**
 * Genera un ID incremental para identidades de contacto
 */
export const generateContactIdentityId = (): number => {
  counters.contactIdentityId += 1;
  return counters.contactIdentityId;
};

/**
 * Busca elementos por texto en múltiples campos
 * @param items Array de items a buscar
 * @param searchText Texto a buscar
 * @param fields Campos donde buscar
 */
export function searchInFields<T>(items: T[], searchText: string, fields: (keyof T)[]): T[] {
  if (!searchText || searchText.trim() === '') {
    return items;
  }

  const searchLower = searchText.toLowerCase().trim();

  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchLower);
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchText);
      }
      return false;
    })
  );
}

/**
 * Filtra elementos por un campo específico
 * @param items Array de items a filtrar
 * @param fieldName Nombre del campo
 * @param fieldValue Valor a filtrar
 */
export function filterByField<T>(items: T[], fieldName: keyof T, fieldValue: any): T[] {
  if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
    return items;
  }

  return items.filter((item) => item[fieldName] === fieldValue);
}

/**
 * Formatea un precio en centavos a formato de moneda colombiana
 * @param centavos Precio en centavos
 */
export function formatCurrency(centavos: number): string {
  const pesos = centavos / 100;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(pesos);
}

/**
 * Convierte pesos a centavos
 * @param pesos Cantidad en pesos
 */
export function pesosTocentavos(pesos: number): number {
  return Math.round(pesos * 100);
}

/**
 * Convierte centavos a pesos
 * @param centavos Cantidad en centavos
 */
export function centavosToPesos(centavos: number): number {
  return centavos / 100;
}

/**
 * Valida si un email tiene formato correcto
 * @param email Email a validar
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Genera un token JWT mock
 * @param userId ID del usuario
 */
export function generateMockToken(userId: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId,
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 24 * 60 * 60 // 24 horas
    })
  );
  const signature = btoa('mock-signature');

  return `${header}.${payload}.${signature}`;
}

/**
 * Decodifica un token JWT mock
 * @param token Token JWT a decodificar
 */
export function decodeMockToken(token: string): { userId: string; iat: number; exp: number } | null {
  try {
    if (!token || !token.startsWith('mock-jwt-')) {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    }

    // Token generado por el sistema mock
    const userId = token.replace('mock-jwt-', '');
    return {
      userId,
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 24 * 60 * 60
    };
  } catch {
    return null;
  }
}

/**
 * Simula validación de token
 * @param token Token a validar
 */
export function validateMockToken(token: string): boolean {
  const decoded = decodeMockToken(token);
  if (!decoded) return false;

  return decoded.exp > Date.now() / 1000;
}

/**
 * Genera datos de respuesta paginada
 * @param data Array de datos
 * @param page Página actual
 * @param limit Límite por página
 */
export function createPaginatedResponse<T>(data: T[], page: number, limit: number) {
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    success: true,
    data: {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit),
        hasNext: endIndex < data.length,
        hasPrev: page > 0
      }
    }
  };
}

/**
 * Genera respuesta de éxito estándar
 * @param data Datos a retornar
 * @param message Mensaje opcional
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true as const,
    data,
    message
  };
}

/**
 * Genera respuesta de error estándar
 * @param message Mensaje de error
 * @param details Detalles adicionales
 */
export function createErrorResponse(message: string, details?: any) {
  return {
    success: false as const,
    message,
    details
  };
}

/**
 * Calcula el dígito verificador para un NIT
 * @param nit Número del NIT sin dígito verificador
 */
export function calculateNitDv(nit: string): number {
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;

  for (let i = 0; i < nit.length; i += 1) {
    const digit = parseInt(nit[nit.length - 1 - i], 10);
    sum += digit * weights[i];
  }

  const remainder = sum % 11;
  return remainder < 2 ? remainder : 11 - remainder;
}
