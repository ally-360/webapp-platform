import { createSlice } from '@reduxjs/toolkit';
import { getBrands as getBrandsApi, isMockMode } from '../../api';

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
      state.brands = (state.brands || []).filter((b: any) => b.id !== action.payload);
    },
    switchPopupState(state, action) {
      const { payload } = action;
      // Explicit open/close when boolean is passed
      if (typeof payload === 'boolean') {
        state.openPopup = payload;
        state.brandEdit = null;
        state.seeBrand = false;
        return;
      }
      // Open in edit mode when a brand object is provided
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        state.brandEdit = payload;
        state.openPopup = true;
        state.seeBrand = false;
        return;
      }
      // Default: toggle
      state.openPopup = !state.openPopup;
      state.brandEdit = null;
      state.seeBrand = false;
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
      let companyId = auth?.user?.companies?.[0]?.id as string | undefined;

      // In mock mode, try to use stored companyId and don't fail hard if missing
      if (isMockMode() && !companyId && typeof localStorage !== 'undefined') {
        companyId = localStorage.getItem('companyId') || undefined;
      }

      if (!companyId && !isMockMode()) {
        throw new Error('No company selected');
      }

      const response = await getBrandsApi({ companyId: companyId || '' });
      dispatch(slice.actions.getBrands(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
      // In case of error, ensure state is consistent
      dispatch(slice.actions.getBrands([]));
    }
  };
}

export function deleteBrand(_id) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      // In dev/mock simply remove from local state
      if (isMockMode()) {
        const { brands } = getState().brands;
        const id = typeof _id === 'object' ? _id?.id : _id;
        dispatch(slice.actions.getBrands((brands || []).filter((b: any) => b.id !== id)));
        return;
      }
      // Note: Delete functionality would need to be implemented in the API
      // For now, we'll just reload the brands
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}

export function createBrand(data) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      if (isMockMode()) {
        const state = getState();
        const companyId =
          state?.auth?.user?.companies?.[0]?.id ||
          (typeof localStorage !== 'undefined' ? localStorage.getItem('companyId') : 'mock-company') ||
          'mock-company';
        const current = state.brands.brands || [];
        const newBrand = {
          id: `mock-brand-${Date.now()}`,
          name: data?.name || 'Nueva marca',
          description: data?.description || '',
          companyId
        };
        dispatch(slice.actions.getBrands([...current, newBrand]));
        return;
      }
      // Note: Create functionality would need to be implemented in the API
      // For now, we'll just reload the brands
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}

export function editBrand({ id, databody }) {
  return async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      if (isMockMode()) {
        const state = getState();
        const current = state.brands.brands || [];
        const updated = (current || []).map((b: any) => (b.id === id ? { ...b, ...databody } : b));
        dispatch(slice.actions.getBrands(updated));
        return;
      }
      // Note: Edit functionality would need to be implemented in the API
      // For now, we'll just reload the brands
      dispatch(getBrands());
    } catch (error) {
      dispatch(slice.actions.hasError(error?.message || String(error)));
    }
  };
}
