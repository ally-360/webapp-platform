/* eslint-disable import/no-extraneous-dependencies */
import { createSlice } from '@reduxjs/toolkit';
import { getProductResponse } from 'src/interfaces/inventory/productsInterface';
import { Dispatch } from 'redux';
import { POS_PRODUCTS } from 'src/_mock/pos-products';
// import RequestService from '../../axios/services/service';

interface ProductsState {
  products: getProductResponse[];
  productsLoading: boolean;
  error: any;
  success: boolean;
  productsEmpty: boolean;
  popupAssignInventory: boolean;
  totalProducts: number;

  // Product detail
  product: getProductResponse | null;
}

// constantes
const initialState: ProductsState = {
  products: [],
  productsLoading: false,
  error: false,
  success: false,
  productsEmpty: false,
  popupAssignInventory: false,
  totalProducts: 0,

  // Product detail
  product: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    startLoading(state) {
      state.productsLoading = true;
    },
    hasError(state, action) {
      state.productsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.productsEmpty = true;
    },
    getAllProductsSuccess(state, action) {
      state.products = action.payload;
      state.productsLoading = false;
      state.error = null;
      state.success = true;
      // TODO: cambiar por el total de productos que se obtengan
      state.totalProducts = 1000;
      state.productsEmpty = action.payload.length === 0;
    },
    getProductByIdSuccess(state, action) {
      state.product = action.payload;
      state.productsLoading = false;
      state.error = null;
      state.success = true;
      state.productsEmpty = false;
    },
    getAllProductsError(state, action) {
      state.products = [];
      state.productsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.productsEmpty = true;
    },
    deleteProductSuccess(state, action) {
      state.products = state.products.filter((product) => product.id !== action.payload);
      state.productsLoading = false;
      state.error = null;
      state.success = true;
      state.productsEmpty = false;
    },
    deleteProductError(state, action) {
      state.productsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.productsEmpty = true;
    },
    setPopupAssignInventory(state, action) {
      state.popupAssignInventory = action.payload;
    }
    // changeStatusProduct(state, action) {}
  }
});

export default productSlice.reducer;

export const { getAllProductsSuccess, getAllProductsError, setPopupAssignInventory, getProductByIdSuccess } =
  productSlice.actions;

// Actions

export const getAllProducts =
  ({ page: _page, pageSize: _pageSize }: { page: number; pageSize: number }) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(productSlice.actions.startLoading());
      // Usar datos mockeados temporalmente
      setTimeout(() => {
        dispatch(productSlice.actions.getAllProductsSuccess(POS_PRODUCTS));
      }, 500); // Simular delay de red
    } catch (error) {
      console.log(error);
      dispatch(productSlice.actions.hasError(error));
    }
  };

export const getProductById = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(productSlice.actions.startLoading());
    // Buscar producto mockeado por ID
    const product = POS_PRODUCTS.find((p) => p.id === id);
    if (product) {
      dispatch(productSlice.actions.getProductByIdSuccess(product));
    } else {
      dispatch(productSlice.actions.hasError('Product not found'));
    }
  } catch (error) {
    console.log(error);
    dispatch(productSlice.actions.hasError(error));
  }
};

export const deleteProduct = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(productSlice.actions.startLoading());
    // Simular eliminación exitosa
    dispatch(productSlice.actions.deleteProductSuccess(id));
  } catch (error) {
    console.log(error);
    dispatch(productSlice.actions.deleteProductError(error));
  }
};

export const UpdateProduct =
  ({ id, databody: _databody }: { id: string; databody: object }) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(productSlice.actions.startLoading());
      // Simular actualización exitosa
      dispatch(getProductById(id) as any);
    } catch (error) {
      console.log(error);
      dispatch(productSlice.actions.hasError(error));
    }
  };
