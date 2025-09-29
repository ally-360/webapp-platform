/**
 * Acciones globales para el cambio de empresa
 * Estas acciones limpian todos los estados cuando se cambia de empresa
 */

import { createAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store';

// Importar todas las acciones de reset
import { resetProductsState } from '../inventory/productsSlice';
import { resetCategoriesState } from '../inventory/categoriesSlice';
import { resetBrandsState } from '../inventory/brandsSlice';
import { resetPDVsState } from '../inventory/pdvsSlice';
import { resetPOSState } from '../pos/posSlice';

// Importar APIs RTK Query para limpiar cache
import { authApi } from '../services/authApi';
import { categoriesApi } from '../services/categoriesApi';
import { brandsApi } from '../services/brandsApi';

/**
 * Acción que se dispara cuando se cambia de empresa
 * Limpia todo el estado de la aplicación para empezar fresco
 */
export const switchCompany = createAction<string>('global/switchCompany');

/**
 * Thunk que ejecuta la limpieza completa del estado al cambiar empresa
 */
export const clearAllStateOnCompanySwitch = () => async (dispatch: AppDispatch) => {
  console.log('🧹 Clearing all application state for company switch...');

  try {
    // 1. Resetear todos los slices de estado local
    dispatch(resetProductsState());
    dispatch(resetCategoriesState());
    dispatch(resetBrandsState());
    dispatch(resetPDVsState());
    dispatch(resetPOSState());

    // 2. Limpiar caches de RTK Query
    dispatch(authApi.util.resetApiState());
    dispatch(categoriesApi.util.resetApiState());
    dispatch(brandsApi.util.resetApiState());

    // 3. Limpiar localStorage específico (manteniendo auth token)
    const authToken = localStorage.getItem('accessToken');
    const authUser = localStorage.getItem('user');

    // Limpiar datos específicos de empresa
    const keysToRemove = [
      'pos_registers',
      'pos_sales_windows',
      'pos_completed_sales',
      'company_products',
      'company_categories',
      'company_brands',
      'company_pdvs',
      'company_locations',
      'company_contacts'
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Restaurar datos de auth
    if (authToken) localStorage.setItem('accessToken', authToken);
    if (authUser) localStorage.setItem('user', authUser);

    console.log('✅ Application state cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing application state:', error);
  }
};
