/* eslint-disable import/no-extraneous-dependencies */
import { createSlice } from '@reduxjs/toolkit';
import { getProductResponse } from 'src/interfaces/inventory/productsInterface';
import { Dispatch } from 'redux';
import RequestService from '../../axios/services/service';
import { RootState } from '../store';

interface ProductsState {
  products: getProductResponse[];
  productsLoading: boolean;
  error: any;
  success: boolean;
  productsEmpty: boolean;
  popupAssignInventory: boolean;

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
    },
    changeStatusProduct(state, action) {}
  }
});

export default productSlice.reducer;

export const { getAllProductsSuccess, getAllProductsError, setPopupAssignInventory, getProductByIdSuccess } =
  productSlice.actions;

// Actions

export const getAllProducts = () => async (dispatch: Dispatch, getState: RootState) => {
  try {
    dispatch(productSlice.actions.startLoading());
    const resp = await RequestService.getProducts();
    dispatch(productSlice.actions.getAllProductsSuccess(resp.data));
  } catch (error) {
    console.log(error);
    dispatch(productSlice.actions.hasError(error));
  }
};

export const getProductById = (id: string) => async (dispatch: Dispatch) => {
  try {
    // quitar el producto anterior
    dispatch(productSlice.actions.startLoading());
    const resp = await RequestService.getProductById(id);
    dispatch(productSlice.actions.getProductByIdSuccess(resp.data));
  } catch (error) {
    console.log(error);
    dispatch(productSlice.actions.hasError(error));
  }
};

export const deleteProduct = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch(productSlice.actions.startLoading());
    await RequestService.deleteProduct(id);
    dispatch(productSlice.actions.deleteProductSuccess(id));
  } catch (error) {
    console.log(error);
    dispatch(productSlice.actions.deleteProductError(error));
  }
};

export const UpdateProduct =
  ({ id, databody }: { id: string; databody: object }) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch(productSlice.actions.startLoading());
      await RequestService.updateProduct({ id, databody });
      dispatch(getProductById(id));
    } catch (error) {
      console.log(error);
      dispatch(productSlice.actions.hasError(error));
    }
  };
