import { createSlice } from '@reduxjs/toolkit';
import { getDepartments, getTowns } from '../../api';

const initialState = {
  locations: [],
  municipios: [] as any[],
  departamentos: [] as any[],
  municipiosLoading: false,
  departamentosLoading: false,
  error: null,
  success: null
};

const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    startLoading(state) {
      state.municipiosLoading = true;
      state.departamentosLoading = true;
    },
    hasError(state, action) {
      state.municipiosLoading = false;
      state.departamentosLoading = false;
      state.error = action.payload;
      state.success = false;
    },
    getAllMunicipiosSuccess(state, action) {
      state.municipios = action.payload;
      state.municipiosLoading = false;
      state.error = null;
      state.success = true;
    },
    getAllMunicipiosError(state, action) {
      state.municipios = [];
      state.municipiosLoading = false;
      state.error = action.payload;
      state.success = false;
    },
    getAllDepartamentosSuccess(state, action) {
      state.departamentos = action.payload;
      state.departamentosLoading = false;
      state.error = null;
      state.success = true;
    },
    getAllDepartamentosError(state, action) {
      state.departamentos = [];
      state.departamentosLoading = false;
      state.error = action.payload;
      state.success = false;
    },
    getAllLocationsSuccess(state, action) {
      state.locations = action.payload;
      state.municipiosLoading = false;
      state.departamentosLoading = false;
      state.error = null;
      state.success = true;
    },
    getAllLocationsError(state, action) {
      state.locations = [];
      state.municipiosLoading = false;
      state.departamentosLoading = false;
      state.error = action.payload;
      state.success = false;
    }
  }
});

export const {
  startLoading,
  hasError,
  getAllMunicipiosSuccess,
  getAllMunicipiosError,
  getAllDepartamentosSuccess,
  getAllDepartamentosError,
  getAllLocationsSuccess,
  getAllLocationsError
} = locationsSlice.actions;

export default locationsSlice.reducer;

// Actions

export function getAllMunicipios() {
  return async (dispatch) => {
    dispatch(startLoading());
    try {
      const departmentsResponse = await getDepartments();
      dispatch(getAllDepartamentosSuccess(departmentsResponse.data));

      // Just get the first department's towns for now to avoid complexity
      if (departmentsResponse.data.length > 0) {
        const firstDept = departmentsResponse.data[0];
        const townsResponse = await getTowns({ departmentId: firstDept.id });
        dispatch(getAllMunicipiosSuccess(townsResponse.data));
      } else {
        dispatch(getAllMunicipiosSuccess([]));
      }

      dispatch(getAllLocationsSuccess(departmentsResponse.data));
    } catch (error) {
      dispatch(hasError(error.message || error));
      dispatch(getAllLocationsError(error.message || error));
    }
  };
}
