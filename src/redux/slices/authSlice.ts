// ========================================
// 🔐 AUTH SLICE - Redux Toolkit
// ========================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserOut, UserCompanyOut } from '../services/authApi';

// ========================================
// 🏷️ INTERFACES
// ========================================

interface AuthState {
  token: string | null;
  user: UserOut | null;
  companies: UserCompanyOut[];
  selectedCompany: UserCompanyOut | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  loading: boolean;
}

// ========================================
// 🔧 INITIAL STATE
// ========================================

const initialState: AuthState = {
  token: localStorage.getItem('accessToken') || null,
  user: null,
  companies: [],
  selectedCompany: null,
  isAuthenticated: false,
  isFirstLogin: false,
  loading: true
};

// ========================================
// 🎯 AUTH SLICE
// ========================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login exitoso
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: UserOut;
        companies: UserCompanyOut[];
      }>
    ) => {
      const { token, user, companies } = action.payload;

      state.token = token;
      state.user = user;
      state.companies = companies;
      state.isAuthenticated = true;
      state.loading = false;

      if (companies.length === 1) {
        state.selectedCompany = companies[0];
      }

      state.isFirstLogin = user.first_login;

      localStorage.setItem('accessToken', token);
    },

    // Seleccionar empresa
    setSelectedCompany: (state, action: PayloadAction<UserCompanyOut>) => {
      state.selectedCompany = action.payload;
      // Guardar el ID de la empresa seleccionada
      localStorage.setItem('selectedCompanyId', action.payload.company_id);
    },

    // Actualizar solo el token (por ejemplo, tras select-company)
    setToken: (state, action: PayloadAction<string>) => {
      const token = action.payload;
      state.token = token;
      localStorage.setItem('accessToken', token);
    },

    // Actualizar usuario
    setUser: (state, action: PayloadAction<UserOut>) => {
      state.user = action.payload;
      state.loading = false;
    },

    // Logout
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.companies = [];
      state.selectedCompany = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
      state.loading = false;

      // Limpiar localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('selectedCompanyId');
    },

    // Establecer estado de carga
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Inicializar desde localStorage
    initializeFromStorage: (state) => {
      const token = localStorage.getItem('accessToken');
      const selectedCompanyId = localStorage.getItem('selectedCompanyId');

      if (token) {
        state.token = token;
        // El usuario se cargará mediante getCurrentUser query
      }

      if (selectedCompanyId && state.companies.length > 0) {
        const company = state.companies.find((c) => c.company_id === selectedCompanyId);
        if (company) {
          state.selectedCompany = company;
        }
      }
    }
  }
});

// ========================================
// 📤 EXPORTS
// ========================================

export const {
  setCredentials,
  setSelectedCompany,
  setUser,
  clearCredentials,
  setLoading,
  initializeFromStorage,
  setToken
} = authSlice.actions;

export default authSlice.reducer;

// ========================================
// 🔍 SELECTORS
// ========================================

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectCompanies = (state: { auth: AuthState }) => state.auth.companies;
export const selectSelectedCompany = (state: { auth: AuthState }) => state.auth.selectedCompany;
export const selectIsFirstLogin = (state: { auth: AuthState }) => state.auth.isFirstLogin;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
