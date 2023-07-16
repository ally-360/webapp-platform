/* eslint-disable import/no-extraneous-dependencies */
// import { createStore, combineReducers, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import { composeWithDevTools } from 'redux-devtools-extension';

// import productsReducer from './productsDucks';

// const rootReducer = combineReducers({
//   products: productsReducer
// });

// export default function generateStore() {
//   const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
//   return store;
// }

import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './inventory/productsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer
  }
});
