// ========================================
// 🌍 LOCATIONS API - Departamentos y Ciudades
// ========================================

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseQuery';

// ========================================
// 📋 INTERFACES
// ========================================

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface City {
  id: number;
  name: string;
  code: string;
  department_id: number;
  department_name?: string;
}

export interface DepartmentWithCities extends Department {
  cities: City[];
}

export interface DepartmentsResponse {
  departments: Department[];
  total: number;
}

export interface CitiesResponse {
  cities: City[];
  total: number;
  department_id?: number;
  department_name?: string;
}

// ========================================
// 🔗 API SLICE
// ========================================

export const locationsApi = createApi({
  reducerPath: 'locationsApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Department', 'City'],
  endpoints: (builder) => ({
    // ========================================
    // 📍 DEPARTMENTS
    // ========================================

    getDepartments: builder.query<DepartmentsResponse, void>({
      query: () => '/locations/departments',
      providesTags: ['Department']
    }),

    getDepartmentWithCities: builder.query<DepartmentWithCities, number>({
      query: (departmentId) => `/locations/departments/${departmentId}`,
      providesTags: (result, error, departmentId) => [
        { type: 'Department', id: departmentId },
        { type: 'City', id: 'LIST' }
      ]
    }),

    // ========================================
    // 🏙️ CITIES
    // ========================================

    getCities: builder.query<
      CitiesResponse,
      {
        department_id?: number;
        search?: string;
        limit?: number;
      }
    >({
      query: ({ department_id, search, limit = 100 }) => {
        const params = new URLSearchParams();

        if (department_id) params.append('department_id', department_id.toString());
        if (search) params.append('search', search);
        if (limit) params.append('limit', limit.toString());

        return `/locations/cities?${params.toString()}`;
      },
      providesTags: ['City']
    }),

    // ========================================
    // 📊 SUMMARY
    // ========================================

    getLocationsSummary: builder.query<any, void>({
      query: () => '/locations/summary',
      providesTags: ['Department', 'City']
    })
  })
});

// ========================================
// 📤 EXPORTS
// ========================================

export const {
  useGetDepartmentsQuery,
  useGetDepartmentWithCitiesQuery,
  useGetCitiesQuery,
  useGetLocationsSummaryQuery,
  useLazyGetCitiesQuery,
  useLazyGetDepartmentWithCitiesQuery
} = locationsApi;

export default locationsApi.reducer;
