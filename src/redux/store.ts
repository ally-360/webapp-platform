import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './inventory/productsSlice';
import pdvsReducer from './inventory/pdvsSlice';
import locationsReducer from './inventory/locationsSlice';
import categoriesReducer from './inventory/categoriesSlice';
import brandsReducer from './inventory/brandsSlice';
import userReducer from './inventory/user';
import contactsReducer from './inventory/contactsSlice';
import stepByStepReducer from './slices/stepByStepSlice';
import posReducer from './pos/posSlice';
// RTK Query & Auth
import { authApi } from './services/authApi';
import { categoriesApi } from './services/categoriesApi';
import { brandsApi } from './services/brandsApi';
import { productsApi } from './services/productsApi';
import { catalogApi } from './services/catalogApi';
import { contactsApi } from './services/contactsApi';
import { invoicesApi } from './services/invoicesApi';
import { salesInvoicesApi } from './services/salesInvoicesApi';
import { billsApi } from './services/billsApi';
import { pdvsApi } from './services/pdvsApi';
import { dashboardApi } from './services/dashboardApi';
import { userProfileApi } from './services/userProfileApi';
import { locationsApi } from './services/locationsApi';
import { subscriptionsApi } from './services/subscriptionsApi';
import { posApi } from './services/posApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [brandsApi.reducerPath]: brandsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [invoicesApi.reducerPath]: invoicesApi.reducer,
    [salesInvoicesApi.reducerPath]: salesInvoicesApi.reducer,
    [billsApi.reducerPath]: billsApi.reducer,
    [pdvsApi.reducerPath]: pdvsApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [userProfileApi.reducerPath]: userProfileApi.reducer,
    [locationsApi.reducerPath]: locationsApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    [posApi.reducerPath]: posApi.reducer,

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
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoriesApi.middleware,
      brandsApi.middleware,
      productsApi.middleware,
      catalogApi.middleware,
      contactsApi.middleware,
      invoicesApi.middleware,
      salesInvoicesApi.middleware,
      billsApi.middleware,
      pdvsApi.middleware,
      dashboardApi.middleware,
      userProfileApi.middleware,
      locationsApi.middleware,
      subscriptionsApi.middleware,
      posApi.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
