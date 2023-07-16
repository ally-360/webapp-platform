/* eslint-disable import/no-extraneous-dependencies */
import { createSlice } from '@reduxjs/toolkit';
import RequestService from '../../axios/services/service';

// constantes
const initialState = {
  products: [
    {
      id: '2339afda-7f2c-4ee2-a27f-c13f188736d2',
      name: 'Quatro',
      description: 'Esta es la descripcion de la Quatro',
      code: '224511963',
      images: ['https://th.bing.com/th/id/OIP.BIAIQ1b7jooENmUDLQlgWQAAAA?pid=ImgDet&rs=1'],
      typeProduct: 2,
      state: true,
      sellInNegative: true,
      taxesOption: 19,
      sku: 'A156548C',
      priceSale: 19500,
      priceBase: 12300,
      globalStock: 60,
      pdvs: [
        {
          name: 'Cali',
          minQuantity: 10,
          maxQuantity: 200,
          quantity: 60
        }
      ],
      category: 'Cerveza'
    },
    {
      id: '7339afda-7f2c-4ee2-a27f-c13f188736d2',
      name: 'auatro',
      description: 'Esta es la descripcion de la Quatro',
      code: '224511963',
      images: ['https://th.bing.com/th/id/OIP.BIAIQ1b7jooENmUDLQlgWQAAAA?pid=ImgDet&rs=1'],
      typeProduct: 2,
      state: true,
      sellInNegative: true,
      taxesOption: 19,
      sku: 'B156548C',
      priceSale: 19500,
      priceBase: 12300,
      globalStock: 0,
      pdvs: [
        {
          name: 'Cali',
          minQuantity: 10,
          maxQuantity: 200,
          quantity: 60
        }
      ],
      category: 'Cerveza'
    },
    {
      id: '1339afda-7f2c-4ee2-a27f-c13f188736d2',
      name: 'buatro',
      description: 'Esta es la descripcion de la Quatro',
      code: '224511963',
      images: ['https://th.bing.com/th/id/OIP.BIAIQ1b7jooENmUDLQlgWQAAAA?pid=ImgDet&rs=1'],
      typeProduct: 2,
      state: true,
      sellInNegative: true,
      taxesOption: 19,
      sku: 'A156548C',
      priceSale: 39500,
      priceBase: 12300,
      globalStock: 20,
      pdvs: [
        {
          name: 'Cali',
          minQuantity: 10,
          maxQuantity: 200,
          quantity: 60
        },
        {
          name: 'Palmira',
          minQuantity: 10,
          maxQuantity: 200,
          quantity: 60
        }
      ],
      category: 'Cerveza'
    }
  ],
  productsLoading: false,
  error: null,
  success: null,
  productsEmpty: true
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
      state.productsEmpty = false;
    },
    getAllProductsError(state, action) {
      state.products = [];
      state.productsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.productsEmpty = true;
    }
  }
});

export default productSlice.reducer;

export const { getAllProductsSuccess, getAllProductsError } = productSlice.actions;

// Actions

export const getAllProducts = () => async (dispatch, getState) => {
  try {
    dispatch(productSlice.actions.startLoading());
    const resp = await RequestService.getProducts();
    dispatch(productSlice.actions.getAllProductsSuccess(resp.data));
  } catch (error) {
    console.log(error);
    dispatch(productSlice.actions.hasError(error));
  }
};
