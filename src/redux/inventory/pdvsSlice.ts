import { createSlice } from '@reduxjs/toolkit';

// Ensure we only store serializable errors in Redux state
const serializeError = (err: any): string | null => {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err?.data?.detail) {
    if (Array.isArray(err.data.detail)) {
      return err.data.detail.map((e: any) => e?.msg || 'Error').join(', ');
    }
    if (typeof err.data.detail === 'string') return err.data.detail;
  }
  if (err?.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

interface PDVState {
  pdvsLoading: boolean;
  error: string | null;
  openPopup: boolean;
  editId: string | false;
  seePDV: boolean;
}

const initialState: PDVState = {
  pdvsLoading: false,
  error: null,
  openPopup: false,
  editId: false,
  seePDV: false
};

const pdvsSlice = createSlice({
  name: 'pdvs',
  initialState,
  reducers: {
    startLoading(state) {
      state.pdvsLoading = true;
    },
    hasError(state, action) {
      state.pdvsLoading = false;
      state.error = serializeError(action.payload);
    },
    switchPopup(state, action) {
      state.openPopup = !state.openPopup;
      state.seePDV = false;
      if (action.payload) {
        state.editId = action.payload;
      } else {
        state.editId = false;
      }
    },
    setSeePDV(state, action) {
      state.seePDV = action.payload.seePDV;
      state.openPopup = true;
      state.editId = action.payload.id;
    },
    setEditId(state, action) {
      state.editId = action.payload;
    },
    resetPDVsState(_state) {
      // Reset al estado inicial cuando se cambia de empresa
      return initialState;
    }
  }
});

export const { startLoading, hasError, switchPopup, setSeePDV, setEditId, resetPDVsState } = pdvsSlice.actions;

export default pdvsSlice.reducer;
