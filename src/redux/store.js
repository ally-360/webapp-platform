import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './inventory/productsSlice';
import pdvsReducer from './inventory/pdvsSlice';
import locationsReducer from './inventory/locationsSlice';
import categoriesReducer from './inventory/categoriesSlice';
import brandsReducer from './inventory/brandsSlice';
import userReducer from './inventory/user';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    pdvs: pdvsReducer,
    locations: locationsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    user: userReducer
  }
});
