import { createSlice } from '@reduxjs/toolkit';
import { reject } from 'lodash';
import RequestService from '../../axios/services/service';

const initialState = {
  isLoading: false,
  error: false,
  brands: [],
  openPopup: false,
  products: [],
  brandEdit: null,
  seeBrand: false,
  brandsEmpty: false
};

const slice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // GET BRANDS
    getBrands(state, action) {
      state.isLoading = false;
      state.brands = action.payload;
      state.brandsEmpty = action.payload.length === 0;
    },
    getProducts(state, action) {
      state.isLoading = false;
      state.products = action.payload;
    },
    deleteBrand(state, action) {
      state.isLoading = false;
      state.brands = reject(state.brands, { id: action.payload });
    },
    switchPopupState(state, action) {
      state.openPopup = !state.openPopup;
      if (action.payload) {
        state.brandEdit = action.payload;
      } else {
        state.brandEdit = null;
      }
    }
  }
});

// Reducer
export default slice.reducer;

// Actions

export const { switchPopupState } = slice.actions;

export function getBrands() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await RequestService.getBrands({ r: true });
      dispatch(slice.actions.getBrands(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deleteBrand(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await RequestService.deleteBrand(id);
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function createBrand(data) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await RequestService.createBrand(data);
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function editBrand({ id, databody }) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await RequestService.editBrand({ id, databody });
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
