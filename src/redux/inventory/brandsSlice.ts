import { createSlice } from '@reduxjs/toolkit';
import { reject } from 'lodash';
import { getBrands as getBrandsApi } from '../../api';

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
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { auth } = getState();
      const companyId = auth?.user?.companies?.[0]?.id;

      if (!companyId) {
        throw new Error('No company selected');
      }

      const response = await getBrandsApi({ companyId });
      dispatch(slice.actions.getBrands(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

export function deleteBrand(_id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Note: Delete functionality would need to be implemented in the API
      // For now, we'll just reload the brands
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

export function createBrand(_data) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Note: Create functionality would need to be implemented in the API
      // For now, we'll just reload the brands
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

export function editBrand({ id: _id, databody: _databody }) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Note: Edit functionality would need to be implemented in the API
      // For now, we'll just reload the brands
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}
