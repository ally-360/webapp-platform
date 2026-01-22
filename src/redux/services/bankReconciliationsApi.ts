import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  BankReconciliation,
  BankReconciliationDetail,
  GetReconciliationsResponse,
  ReconciliationFilters,
  CreateReconciliationPayload,
  MatchTransactionPayload,
  RemoveMatchPayload,
  CompleteReconciliationPayload,
  ReverseReconciliationPayload,
  AutoMatchResponse,
  GetMatchesResponse,
  MatchesFilters,
  GetUnmatchedLinesResponse,
  GetUnmatchedMovementsResponse,
  ReconciliationReport,
  GetTimelineResponse
} from 'src/sections/treasury/types';
import { baseQueryWithReauth } from './baseQuery';

export const bankReconciliationsApi = createApi({
  reducerPath: 'bankReconciliationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['BankReconciliation'],
  endpoints: (builder) => ({
    // Create new reconciliation
    createReconciliation: builder.mutation<BankReconciliation, CreateReconciliationPayload>({
      query: (payload) => ({
        url: '/bank-reconciliations/',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'BankReconciliation', id: 'LIST' }]
    }),

    getReconciliations: builder.query<GetReconciliationsResponse, ReconciliationFilters | void>({
      query: (params) => ({
        url: '/bank-reconciliations/',
        params: params
          ? {
              ...(params.bank_account_id && { bank_account_id: params.bank_account_id }),
              ...(params.status_filter && { status_filter: params.status_filter }),
              ...(params.from_date && { from_date: params.from_date }),
              ...(params.to_date && { to_date: params.to_date }),
              ...(params.limit && { limit: params.limit }),
              ...(params.offset !== undefined && { offset: params.offset })
            }
          : {}
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.reconciliations.map(({ id }) => ({
                type: 'BankReconciliation' as const,
                id
              })),
              { type: 'BankReconciliation', id: 'LIST' }
            ]
          : [{ type: 'BankReconciliation', id: 'LIST' }]
    }),

    getReconciliationById: builder.query<BankReconciliation, string>({
      query: (id) => `/bank-reconciliations/${id}`,
      transformResponse: (response: any) => {
        // Si el backend devuelve { reconciliation: {...} }, extraer el campo
        if (response && typeof response === 'object' && 'reconciliation' in response) {
          return response.reconciliation;
        }
        // Si ya viene el objeto directamente, devolverlo tal cual
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'BankReconciliation', id }]
    }),

    // Get detailed reconciliation with all data for processing
    getReconciliationDetail: builder.query<BankReconciliationDetail, string>({
      query: (id) => `/bank-reconciliations/${id}/detail`,
      providesTags: (result, error, id) => [{ type: 'BankReconciliation', id }]
    }),

    // Match statement line with accounting transaction(s)
    matchTransaction: builder.mutation<void, { reconciliationId: string; payload: MatchTransactionPayload }>({
      query: ({ reconciliationId, payload }) => ({
        url: `/bank-reconciliations/${reconciliationId}/match`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: (result, error, { reconciliationId }) => [
        { type: 'BankReconciliation', id: reconciliationId },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Remove a match
    removeMatch: builder.mutation<void, { reconciliationId: string; payload: RemoveMatchPayload }>({
      query: ({ reconciliationId, payload }) => ({
        url: `/bank-reconciliations/${reconciliationId}/unmatch`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: (result, error, { reconciliationId }) => [
        { type: 'BankReconciliation', id: reconciliationId },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Run auto-matching
    runAutoMatch: builder.mutation<AutoMatchResponse, string>({
      query: (reconciliationId) => ({
        url: `/bank-reconciliations/${reconciliationId}/auto-match`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, reconciliationId) => [
        { type: 'BankReconciliation', id: reconciliationId },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Import statement from file (CSV/XLSX)
    importStatementFile: builder.mutation<
      { imported_lines: number; message: string },
      { reconciliationId: string; file: File }
    >({
      query: ({ reconciliationId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/bank-reconciliations/${reconciliationId}/import-statement-file`,
          method: 'POST',
          body: formData
        };
      },
      invalidatesTags: (result, error, { reconciliationId }) => [
        { type: 'BankReconciliation', id: reconciliationId },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Import statement from JSON
    importStatementJson: builder.mutation<
      { imported_lines: number; message: string },
      { reconciliationId: string; lines: any[] }
    >({
      query: ({ reconciliationId, lines }) => ({
        url: `/bank-reconciliations/${reconciliationId}/import-statement`,
        method: 'POST',
        body: { lines }
      }),
      invalidatesTags: (result, error, { reconciliationId }) => [
        { type: 'BankReconciliation', id: reconciliationId },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Get unmatched statement lines
    getUnmatchedLines: builder.query<
      GetUnmatchedLinesResponse,
      { reconciliationId: string; limit?: number; offset?: number }
    >({
      query: ({ reconciliationId, limit = 20, offset = 0 }) => ({
        url: `/bank-reconciliations/${reconciliationId}/unmatched-lines`,
        params: { limit, offset }
      }),
      providesTags: (result, error, { reconciliationId }) => [{ type: 'BankReconciliation', id: reconciliationId }]
    }),

    // Get unmatched movements
    getUnmatchedMovements: builder.query<
      GetUnmatchedMovementsResponse,
      { reconciliationId: string; limit?: number; offset?: number }
    >({
      query: ({ reconciliationId, limit = 20, offset = 0 }) => ({
        url: `/bank-reconciliations/${reconciliationId}/unmatched-movements`,
        params: { limit, offset }
      }),
      providesTags: (result, error, { reconciliationId }) => [{ type: 'BankReconciliation', id: reconciliationId }]
    }),

    // Get matches
    getMatches: builder.query<GetMatchesResponse, { reconciliationId: string; filters?: MatchesFilters }>({
      query: ({ reconciliationId, filters }) => ({
        url: `/bank-reconciliations/${reconciliationId}/matches`,
        params: filters
          ? {
              ...(filters.match_type && { match_type: filters.match_type }),
              ...(filters.min_score !== undefined && { min_score: filters.min_score }),
              ...(filters.max_score !== undefined && { max_score: filters.max_score }),
              ...(filters.limit && { limit: filters.limit }),
              ...(filters.offset !== undefined && { offset: filters.offset })
            }
          : {}
      }),
      providesTags: (result, error, { reconciliationId }) => [{ type: 'BankReconciliation', id: reconciliationId }]
    }),

    // Complete reconciliation
    completeReconciliation: builder.mutation<
      BankReconciliation,
      { id: string; payload?: CompleteReconciliationPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/bank-reconciliations/${id}/complete`,
        method: 'POST',
        body: payload || {}
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BankReconciliation', id },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Reverse reconciliation
    reverseReconciliation: builder.mutation<BankReconciliation, { id: string; payload: ReverseReconciliationPayload }>({
      query: ({ id, payload }) => ({
        url: `/bank-reconciliations/${id}/reverse`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BankReconciliation', id },
        { type: 'BankReconciliation', id: 'LIST' }
      ]
    }),

    // Delete reconciliation (only draft status)
    deleteReconciliation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bank-reconciliations/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'BankReconciliation', id: 'LIST' }]
    }),

    // Get reconciliation report
    getReconciliationReport: builder.query<ReconciliationReport, string>({
      query: (id) => `/bank-reconciliations/${id}/report`,
      providesTags: (result, error, id) => [{ type: 'BankReconciliation', id: `${id}-report` }]
    }),

    // Get reconciliation timeline
    getReconciliationTimeline: builder.query<GetTimelineResponse, string>({
      query: (id) => `/bank-reconciliations/${id}/timeline`,
      providesTags: (result, error, id) => [{ type: 'BankReconciliation', id: `${id}-timeline` }]
    })
  })
});

export const {
  useCreateReconciliationMutation,
  useGetReconciliationsQuery,
  useGetReconciliationByIdQuery,
  useGetReconciliationDetailQuery,
  useMatchTransactionMutation,
  useRemoveMatchMutation,
  useRunAutoMatchMutation,
  useImportStatementFileMutation,
  useImportStatementJsonMutation,
  useGetUnmatchedLinesQuery,
  useLazyGetUnmatchedLinesQuery,
  useGetUnmatchedMovementsQuery,
  useLazyGetUnmatchedMovementsQuery,
  useGetMatchesQuery,
  useLazyGetMatchesQuery,
  useCompleteReconciliationMutation,
  useReverseReconciliationMutation,
  useDeleteReconciliationMutation,
  useGetReconciliationReportQuery,
  useLazyGetReconciliationReportQuery,
  useGetReconciliationTimelineQuery,
  useLazyGetReconciliationTimelineQuery
} = bankReconciliationsApi;
