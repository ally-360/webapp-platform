import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  CreateDebitNoteRequest,
  UpdateDebitNoteRequest,
  DebitNoteListResponse,
  DebitNoteResponse
} from 'src/interfaces/api/debit-note';
import type { DebitNoteFilters } from 'src/types/debit-note';
import { baseQueryWithReauth } from './baseQuery';

// ----------------------------------------------------------------------

export const debitNotesApi = createApi({
  reducerPath: 'debitNotesApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DebitNote', 'DebitNoteList'],
  endpoints: (builder) => ({
    // Listar notas débito
    getDebitNotes: builder.query<DebitNoteListResponse, DebitNoteFilters>({
      query: (params) => ({
        url: '/debit-notes/',
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'DebitNote' as const, id })),
              { type: 'DebitNoteList', id: 'LIST' }
            ]
          : [{ type: 'DebitNoteList', id: 'LIST' }]
    }),

    // Obtener nota débito por ID
    getDebitNoteById: builder.query<DebitNoteResponse, string>({
      query: (id) => `/debit-notes/${id}`,
      providesTags: (result, error, id) => [{ type: 'DebitNote', id }]
    }),

    // Crear nota débito
    createDebitNote: builder.mutation<DebitNoteResponse, CreateDebitNoteRequest>({
      query: (data) => ({
        url: '/debit-notes/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: [{ type: 'DebitNoteList', id: 'LIST' }]
    }),

    // Actualizar nota débito (solo si status = open)
    updateDebitNote: builder.mutation<DebitNoteResponse, { id: string; data: UpdateDebitNoteRequest }>({
      query: ({ id, data }) => ({
        url: `/debit-notes/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DebitNote', id },
        { type: 'DebitNoteList', id: 'LIST' }
      ]
    }),

    // Anular nota débito
    voidDebitNote: builder.mutation<DebitNoteResponse, string>({
      query: (id) => ({
        url: `/debit-notes/${id}/void`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DebitNote', id },
        { type: 'DebitNoteList', id: 'LIST' }
      ]
    }),

    // Eliminar nota débito (solo si status = open)
    deleteDebitNote: builder.mutation<void, string>({
      query: (id) => ({
        url: `/debit-notes/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'DebitNoteList', id: 'LIST' }]
    }),

    // Obtener asiento contable de nota débito
    getDebitNoteJournalEntry: builder.query<any, string>({
      query: (id) => `/debit-notes/${id}/journal-entry`,
      providesTags: (result, error, id) => [{ type: 'DebitNote', id }]
    })
  })
});

export const {
  useGetDebitNotesQuery,
  useGetDebitNoteByIdQuery,
  useCreateDebitNoteMutation,
  useUpdateDebitNoteMutation,
  useVoidDebitNoteMutation,
  useDeleteDebitNoteMutation,
  useGetDebitNoteJournalEntryQuery
} = debitNotesApi;
