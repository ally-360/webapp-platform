import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  error: false,
  salesWindows: [
    {
      id: 1,
      name: 'Venta 1',
      products: [
        {
          id: 1,
          name: 'Producto 1',
          price: 100,
          quantity: 1
        },
        {
          id: 2,
          name: 'Producto 2',
          price: 200,
          quantity: 2
        }
      ],
      customer: 'Cliente 1',
      date: '',
      seller: 'Vendedor 1'
    }
  ] // Agregando esto para manejar las ventanas de venta
  // ...otros estados que ya tienes
};
const posSlice = createSlice({
  name: 'posIndex',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    addSaleWindow(state) {
      // state.salesWindows.push({
      //   id: state.salesWindows.length + 1,
      //   products: [],
      //   customer: '',
      //   date: '',
      //   seller: '',
      //   name: `venta ${state.salesWindows.length}`
      // });
    },
    updateSaleWindow(state, action) {
      const index = state.salesWindows.findIndex((window) => window.id === action.payload.id);
      if (index !== -1) {
        state.salesWindows[index] = { ...state.salesWindows[index], ...action.payload.data };
      }
    },
    initializeSalesFromStorage(state, action) {
      state.salesWindows = action.payload;
    }
  }
});

// Reducer
export default posSlice.reducer;
// actions
export const { addSaleWindow, updateSaleWindow, initializeSalesFromStorage } = posSlice.actions;
