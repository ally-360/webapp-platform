import { createSlice } from '@reduxjs/toolkit';
import { getCategories as getCategoriesApi, isMockMode } from '../../api';

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
      state.categories = (state.categories || []).filter((c: any) => c.id !== action.payload);
    },
    switchPopupState(state, action) {
      const { payload } = action;
      // Deterministic open/close
      if (typeof payload === 'boolean') {
        state.openPopup = payload;
        state.seeCategory = false;
        state.categoryEdit = null;
        return;
      }
      // Open in edit mode with provided category object
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        state.categoryEdit = payload;
        state.openPopup = true;
        state.seeCategory = false;
        return;
      }
      // Default: toggle
      state.openPopup = !state.openPopup;
      state.seeCategory = false;
      state.categoryEdit = null;
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
    },
    resetCategoriesState(_state) {
      // Reset al estado inicial cuando se cambia de empresa
      return initialState;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { switchPopupState, resetCategoriesState } = slice.actions;

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
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}

export function deleteCategory(_id) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      if (isMockMode()) {
        const { categories } = getState().categories;
        const id = typeof _id === 'object' ? _id?.id : _id;
        dispatch(slice.actions.getCategories((categories || []).filter((c: any) => c.id !== id)));
        return;
      }
      // Note: Delete functionality would need to be implemented in the API
      dispatch(getCategories());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}

export function createCategory(databody) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      if (isMockMode()) {
        const state = getState();
        const companyId = state?.auth?.user?.companies?.[0]?.id || 'mock-company';
        const current = state.categories.categories || [];
        const newCategory = {
          id: `mock-category-${Date.now()}`,
          name: databody?.name || 'Nueva categoría',
          description: databody?.description || '',
          categoryMainCategory: databody?.categoryMainCategory || null,
          companyId
        };
        dispatch(slice.actions.getCategories([...current, newCategory]));
        return;
      }
      // Note: Create functionality would need to be implemented in the API
      dispatch(getCategories());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}

export function editCategory({ id, databody }) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      if (isMockMode()) {
        const state = getState();
        const current = state.categories.categories || [];
        const updated = (current || []).map((c: any) => (c.id === id ? { ...c, ...databody } : c));
        dispatch(slice.actions.getCategories(updated));
        return;
      }
      // Note: Edit functionality would need to be implemented in the API
      dispatch(getCategories());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
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
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}

// ----------------------------------------------------------------------

export function getViewCategoryById(id) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoadingViewCategoryById());
    try {
      if (isMockMode()) {
        const { categories } = getState().categories;
        const category = (categories || []).find((c: any) => c.id === id) || null;
        dispatch(slice.actions.getViewCategoryById(category));
        dispatch(slice.actions.getViewCategoryProducts([]));
        return;
      }
      // Note: This would need to be implemented to get category by ID
      dispatch(slice.actions.getViewCategoryById(null));
      dispatch(slice.actions.getViewCategoryProducts([]));
    } catch (error) {
      dispatch(slice.actions.hasErrorViewCategoryById(error?.message || String(error)));
    }
  };
}
