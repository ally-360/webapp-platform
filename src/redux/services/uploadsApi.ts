import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HOST_API } from 'src/config-global';
import type {
  PresignUploadRequest,
  PresignUploadResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  StagedUpload,
  ListUploadsFilters,
  ListUploadsResponse,
  UpdateUploadRequest
} from 'src/interfaces/api/uploads';

// ========================================
// 📤 UPLOADS API - RTK QUERY
// ========================================

/**
 * RTK Query API para gestionar Staged Uploads
 *
 * FLUJO COMPLETO:
 * 1. presignUpload → Obtener URL presignada
 * 2. PUT directo a MinIO (fetch nativo, NO RTK Query)
 * 3. confirmUpload → Marcar como disponible
 * 4. Usar upload_ids al crear producto/entidad
 */
export const uploadsApi = createApi({
  reducerPath: 'uploadsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${HOST_API}/uploads`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    }
  }),
  tagTypes: ['Upload', 'UploadList'],
  endpoints: (builder) => ({
    // ========================================
    // 🔐 PRESIGN - Obtener URL presignada
    // ========================================
    presignUpload: builder.mutation<PresignUploadResponse, PresignUploadRequest>({
      query: (body) => ({
        url: '/presign',
        method: 'POST',
        body
      }),
      invalidatesTags: ['UploadList']
    }),

    // ========================================
    // ✅ CONFIRM - Confirmar subida exitosa
    // ========================================
    confirmUpload: builder.mutation<ConfirmUploadResponse, ConfirmUploadRequest>({
      query: (body) => ({
        url: '/confirm',
        method: 'POST',
        body
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Upload', id: arg.upload_id }, 'UploadList']
    }),

    // ========================================
    // 📋 GET - Obtener un upload por ID
    // ========================================
    getUpload: builder.query<StagedUpload, string>({
      query: (uploadId) => `/${uploadId}`,
      providesTags: (result, error, id) => [{ type: 'Upload', id }]
    }),

    // ========================================
    // 📋 LIST - Listar uploads con filtros
    // ========================================
    listUploads: builder.query<ListUploadsResponse, ListUploadsFilters | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters?.entity_type) params.append('entity_type', filters.entity_type);
        if (filters?.entity_id) params.append('entity_id', filters.entity_id);
        if (filters?.purpose) params.append('purpose', filters.purpose);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.is_orphaned !== undefined) params.append('is_orphaned', String(filters.is_orphaned));
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.page_size) params.append('page_size', String(filters.page_size));

        return `?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [...result.items.map(({ id }) => ({ type: 'Upload' as const, id })), { type: 'UploadList', id: 'LIST' }]
          : [{ type: 'UploadList', id: 'LIST' }]
    }),

    // ========================================
    // 🔄 UPDATE - Actualizar metadata de upload
    // ========================================
    updateUpload: builder.mutation<StagedUpload, { id: string } & UpdateUploadRequest>({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Upload', id: arg.id }, 'UploadList']
    }),

    // ========================================
    // 🗑️ DELETE - Eliminar upload
    // ========================================
    deleteUpload: builder.mutation<void, string>({
      query: (uploadId) => ({
        url: `/${uploadId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Upload', id }, 'UploadList']
    })
  })
});

// ========================================
// 🎣 EXPORTS - Hooks generados automáticamente
// ========================================
export const {
  usePresignUploadMutation,
  useConfirmUploadMutation,
  useGetUploadQuery,
  useListUploadsQuery,
  useUpdateUploadMutation,
  useDeleteUploadMutation
} = uploadsApi;
