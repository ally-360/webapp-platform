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

export const store = configureStore({
  reducer: {
    products: productsReducer,
    pdvs: pdvsReducer,
    locations: locationsReducer,
    categories: categoriesReducer,
    brands: brandsReducer,
    user: userReducer,
    contacts: contactsReducer,
    stepByStep: stepByStepReducer,
    pos: posReducer
  }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
