import { sum, map, filter, uniqBy, reject, get } from 'lodash';
// utils
import { createSlice } from '@reduxjs/toolkit';
import RequestService from '../../axios/services/service';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  categories: [],
  openPopup: false,
  products: [],
  categoryEdit: null,
  seeCategory: false,
  isEmpty: false
};

const slice = createSlice({
  name: 'categories',
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

    getCategories(state, action) {
      state.isLoading = false;
      state.categories = action.payload;
      state.isEmpty = action.payload.length === 0;
    },

    getProducts(state, action) {
      state.isLoading = false;
      state.products = action.payload;
    },
    deleteCategory(state, action) {
      state.isLoading = false;
      state.categories = reject(state.categories, { id: action.payload });
    },
    switchPopupState(state, action) {
      state.openPopup = !state.openPopup;
      state.seeCategory = false;
      if (action.payload) {
        state.categoryEdit = action.payload;
      } else {
        state.categoryEdit = null;
      }
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { switchPopupState } = slice.actions;

// ----------------------------------------------------------------------

export function getCategories() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await RequestService.getCategories();
      dispatch(slice.actions.getCategories(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function deleteCategory(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await RequestService.deleteCategory(id);
      dispatch(getCategories());
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function createCategory(databody) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      await RequestService.createCategory(databody);
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function switchPopup() {
  return async (dispatch) => {
    dispatch(slice.actions.switchPopupState());
  };
}

// ----------------------------------------------------------------------

export function getProductsInCategory(name) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await RequestService.getProducts(name);
      dispatch(slice.actions.getProducts(response.data));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}
