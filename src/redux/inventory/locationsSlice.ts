import { createSlice } from '@reduxjs/toolkit';
import { getDepartments, getTowns, isMockMode } from '../../api';

interface LocationsState {
  locations: any[];
  municipios: any[]; // { id, name, departmentId }
  departamentos: any[];
  municipiosLoading: boolean;
  departamentosLoading: boolean;
  error: string | null;
  success: boolean | null;
}

const initialState: LocationsState = {
  locations: [],
  municipios: [],
  departamentos: [],
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
      state.error = action.payload as string;
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
      state.error = action.payload as string;
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
      state.error = action.payload as string;
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
      state.error = action.payload as string;
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
      // In mock mode, return static departments and towns
      if (typeof isMockMode === 'function' && isMockMode()) {
        const mockDepartments = [
          {
            id: 1,
            name: 'Departamento Demo',
            towns: [
              { id: 101, name: 'Ciudad A', departmentId: 1 },
              { id: 102, name: 'Ciudad B', departmentId: 1 }
            ]
          },
          {
            id: 2,
            name: 'Departamento Dos',
            towns: [
              { id: 201, name: 'Ciudad C', departmentId: 2 },
              { id: 202, name: 'Ciudad D', departmentId: 2 }
            ]
          }
        ];
        const municipios = mockDepartments.flatMap((d) =>
          (d.towns || []).map((t) => ({ id: t.id, name: t.name, departmentId: d.id }))
        );
        dispatch(getAllDepartamentosSuccess(mockDepartments.map(({ towns: _towns, ...d }) => d)));
        dispatch(getAllMunicipiosSuccess(municipios));
        dispatch(getAllLocationsSuccess(mockDepartments));
        return;
      }

      const departmentsResponse = await getDepartments();
      const departments = (departmentsResponse as any)?.data || [];
      dispatch(getAllDepartamentosSuccess(departments));

      // Fetch towns concurrently and preserve departmentId association
      const townsByDept = await Promise.all(
        (departments || []).map(async (dept: any) => {
          try {
            const res = await getTowns({ departmentId: dept.id });
            const data = (res as any)?.data || [];
            return { deptId: dept.id, towns: data };
          } catch (e) {
            return { deptId: dept.id, towns: [] as any[] };
          }
        })
      );

      const allMunicipios = townsByDept.flatMap(({ deptId, towns }) =>
        (towns || []).map((t: any) => ({ id: t.id, name: t.name, departmentId: deptId }))
      );

      // Build departments with towns included so UI can access department.towns safely
      const departmentsWithTowns = (departments || []).map((dept: any) => {
        const towns = (townsByDept.find((d) => d.deptId === dept.id)?.towns || []) as any[];
        return { ...dept, towns };
      });

      dispatch(getAllMunicipiosSuccess(allMunicipios));
      dispatch(getAllLocationsSuccess(departmentsWithTowns));
    } catch (error: any) {
      const message = error?.message || String(error);
      dispatch(hasError(message));
      dispatch(getAllLocationsError(message));
      dispatch(getAllMunicipiosError(message));
    }
  };
}
