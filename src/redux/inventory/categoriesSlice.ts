import { reject } from 'lodash';
// utils
import { createSlice } from '@reduxjs/toolkit';
import { getCategories as getCategoriesApi } from '../../api';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  categories: [],
  openPopup: false,
  products: [],
  categoryEdit: null,
  seeCategory: false,
  isEmpty: false,

  // Detail category
  viewCategoryById: null,
  viewCategoryProducts: [],
  viewCategoryByIdLoading: false,
  viewCategoryByIdError: false
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
    },

    // Detail category
    startLoadingViewCategoryById(state) {
      state.viewCategoryByIdLoading = true;
    },
    hasErrorViewCategoryById(state, action) {
      state.viewCategoryByIdLoading = false;
      state.viewCategoryByIdError = action.payload;
    },
    getViewCategoryById(state, action) {
      state.viewCategoryByIdLoading = false;
      state.viewCategoryById = action.payload;
    },
    getViewCategoryProducts(state, action) {
      state.viewCategoryProducts = action.payload;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { switchPopupState } = slice.actions;

// ----------------------------------------------------------------------

export function getCategories() {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { auth } = getState();
      const companyId = auth?.user?.companies?.[0]?.id;

      if (!companyId) {
        throw new Error('No company selected');
      }

      const response = await getCategoriesApi({ companyId });
      dispatch(slice.actions.getCategories(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

export function deleteCategory(_id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Note: Delete functionality would need to be implemented in the API
      dispatch(getCategories());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

export function createCategory(_databody) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Note: Create functionality would need to be implemented in the API
      dispatch(getCategories());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

export function switchPopup() {
  return async (dispatch) => {
    dispatch(slice.actions.switchPopupState(null));
  };
}

// ----------------------------------------------------------------------

export function getProductsInCategory(_name) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // Note: This would need to be implemented to get products by category
      dispatch(slice.actions.getProducts([]));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error.message || error));
    }
  };
}

// ----------------------------------------------------------------------

export function getViewCategoryById(_id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoadingViewCategoryById());
    try {
      // Note: This would need to be implemented to get category by ID
      dispatch(slice.actions.getViewCategoryById(null));
      dispatch(slice.actions.getViewCategoryProducts([]));
    } catch (error) {
      dispatch(slice.actions.hasErrorViewCategoryById(error.message || error));
    }
  };
}
