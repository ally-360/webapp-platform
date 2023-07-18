import { createSlice } from '@reduxjs/toolkit';
import RequestService from '../../axios/services/service';

const initialState = {
  pdvs: [],
  pdvsLoading: false,
  error: null,
  success: null,
  pdvsEmpty: false
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
      state.error = action.payload;
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
      state.error = action.payload;
      state.success = false;
      state.pdvsEmpty = true;
    },
    deletePDVSuccess(state, action) {
      state.pdvs = state.pdvs.filter((pdv) => pdv.id !== action.payload);
      state.pdvsLoading = false;
      state.error = null;
      state.success = true;
      state.pdvsEmpty = false;
    },
    deletePDVError(state, action) {
      state.pdvsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.pdvsEmpty = true;
    }
  }
});

export const { startLoading, hasError, getAllPDVSSuccess, getAllPDVSError, deletePDVSuccess, deletePDVError } =
  pdvsSlice.actions;

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
