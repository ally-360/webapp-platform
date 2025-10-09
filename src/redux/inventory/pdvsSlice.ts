import { createSlice } from '@reduxjs/toolkit';
import RequestService from '../../axios/services/service';

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
  pdvs: any[];
  pdvsLoading: boolean;
  error: string | null;
  success: boolean;
  pdvsEmpty: boolean;
  openPopup: boolean;
  editId: string | false;
  seePDV: boolean;
}

const initialState: PDVState = {
  pdvs: [],
  pdvsLoading: false,
  error: null,
  success: false,
  pdvsEmpty: false,
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
      state.success = false;
      state.pdvsEmpty = true;
    },
    getAllPDVSSuccess(state, action) {
      state.pdvs = action.payload;
      state.pdvsLoading = false;
      state.error = null;
      state.success = true;
      state.pdvsEmpty = false;
    },
    getAllPDVSError(state, action) {
      state.pdvs = [];
      state.pdvsLoading = false;
      state.error = serializeError(action.payload);
      state.success = false;
      state.pdvsEmpty = true;
    },
    deletePDVSuccess(state, action) {
      state.pdvs = state.pdvs.filter((pdv: any) => pdv.id !== action.payload);
      state.pdvsLoading = false;
      state.error = null;
      state.success = true;
      state.pdvsEmpty = false;
    },
    deletePDVError(state, action) {
      state.pdvsLoading = false;
      state.error = serializeError(action.payload);
      state.success = false;
      state.pdvsEmpty = true;
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

export const {
  startLoading,
  hasError,
  getAllPDVSSuccess,
  getAllPDVSError,
  deletePDVSuccess,
  deletePDVError,
  switchPopup,
  setSeePDV,
  setEditId,
  resetPDVsState
} = pdvsSlice.actions;

export default pdvsSlice.reducer;

// Actions

export const getAllPDVS = () => async (dispatch) => {
  try {
    dispatch(pdvsSlice.actions.startLoading());
    const response = await RequestService.getPDVS({ r: true });

    dispatch(getAllPDVSSuccess(response.data));
  } catch (error) {
    dispatch(getAllPDVSError(error));
  }
};

export const getAllPDVSWhitoutLoading = () => async (dispatch) => {
  try {
    const response = await RequestService.getPDVS({ r: true });
    dispatch(getAllPDVSSuccess(response.data));
  } catch (error) {
    dispatch(getAllPDVSError(error));
  }
};

export const createPDV = (pdv) => async (dispatch) => {
  try {
    dispatch(pdvsSlice.actions.startLoading());
    const response = await RequestService.createPDV(pdv);
    dispatch(getAllPDVSSuccess(response.data));
    dispatch(getAllPDVS());
    return response.data;
  } catch (error) {
    dispatch(getAllPDVSError(error));
    return error;
  }
};

export const getPDVById = (id) => async (dispatch) => {
  try {
    const response = await RequestService.getPDVById(id);
    return response.data;
  } catch (error) {
    dispatch(getAllPDVSError(error));
    return error;
  }
};

export const deletePDV = (id) => async (dispatch) => {
  try {
    dispatch(pdvsSlice.actions.startLoading());
    await RequestService.deletePDV(id);
    dispatch(deletePDVSuccess(id));
  } catch (error) {
    dispatch(deletePDVError(error));
  }
};
