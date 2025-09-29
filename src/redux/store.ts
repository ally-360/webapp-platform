import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './inventory/productsSlice';
import pdvsReducer from './inventory/pdvsSlice';
import locationsReducer from './inventory/locationsSlice';
import categoriesReducer from './inventory/categoriesSlice';
import brandsReducer from './inventory/brandsSlice';
import userReducer from './inventory/user';
import contactsReducer from './inventory/contactsSlice';
import stepByStepReducer from './inventory/stepByStepSlice';
import posReducer from './pos/posSlice';
// RTK Query & Auth
import { authApi } from './services/authApi';
import { categoriesApi } from './services/categoriesApi';
import { brandsApi } from './services/brandsApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // 🔐 Auth & API
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,

    products: productsReducer,
    pdvs: pdvsReducer,
    locations: locationsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    user: userReducer,
    contacts: contactsReducer,
    stepByStep: stepByStepReducer,
    pos: posReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, categoriesApi.middleware, brandsApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
