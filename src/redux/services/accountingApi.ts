import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  AccountingAccount,
  GetAccountsResponse,
  GetAccountsParams,
  CreateAccountPayload,
  UpdateAccountPayload,
  JournalEntryDetail,
  GetJournalEntriesResponse,
  GetJournalEntriesParams,
  AccountingCatalogs,
  CostCenter,
  CreateJournalEntryRequest,
  CreateJournalEntryResponse
} from 'src/sections/accounting/types';
import { baseQueryWithReauth } from './baseQuery';

export const accountingApi = createApi({
  reducerPath: 'accountingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AccountingAccount', 'JournalEntry', 'CostCenter'],
  endpoints: (builder) => ({
    // Accounts endpoints
    getAccounts: builder.query<GetAccountsResponse, GetAccountsParams | void>({
      query: (params = {}) => ({
        url: '/accounting/accounts',
        params: {
          skip: params.skip ?? 0,
          limit: params.limit ?? 500,
          ...(params.account_type && { account_type: params.account_type }),
          ...(params.parent_id && { parent_id: params.parent_id }),
          ...(params.is_active !== undefined && { is_active: params.is_active }),
          ...(params.search && { search: params.search }),
          ...(params.use && { use: params.use })
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.accounts.map(({ id }) => ({ type: 'AccountingAccount' as const, id })),
              { type: 'AccountingAccount', id: 'LIST' }
            ]
          : [{ type: 'AccountingAccount', id: 'LIST' }]
    }),
    getAccountById: builder.query<AccountingAccount, string>({
      query: (id) => `/accounting/accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'AccountingAccount', id }]
    }),
    createAccount: builder.mutation<AccountingAccount, CreateAccountPayload>({
      query: (payload) => ({
        url: '/accounting/accounts',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'AccountingAccount', id: 'LIST' }]
    }),
    updateAccount: builder.mutation<AccountingAccount, { id: string; payload: UpdateAccountPayload }>({
      query: ({ id, payload }) => ({
        url: `/accounting/accounts/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AccountingAccount', id },
        { type: 'AccountingAccount', id: 'LIST' }
      ]
    }),
    deleteAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounting/accounts/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'AccountingAccount', id: 'LIST' }]
    }),

    // Journal Entries endpoints
    getJournalEntries: builder.query<GetJournalEntriesResponse, GetJournalEntriesParams | void>({
      query: (params = {}) => ({
        url: '/accounting/journal-entries',
        params: {
          skip: params.skip ?? 0,
          limit: params.limit ?? 50,
          ...(params.start_date && { start_date: params.start_date }),
          ...(params.end_date && { end_date: params.end_date }),
          ...(params.entry_type && { entry_type: params.entry_type }),
          ...(params.status && { status: params.status }),
          ...(params.reference_number && { reference_number: params.reference_number }),
          ...(params.search && { search: params.search })
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.journal_entries.map(({ id }) => ({ type: 'JournalEntry' as const, id })),
              { type: 'JournalEntry', id: 'LIST' }
            ]
          : [{ type: 'JournalEntry', id: 'LIST' }]
    }),
    getJournalEntryById: builder.query<JournalEntryDetail, string>({
      query: (id) => `/accounting/journal-entries/${id}`,
      providesTags: (result, error, id) => [{ type: 'JournalEntry', id }]
    }),
    createJournalEntry: builder.mutation<CreateJournalEntryResponse, CreateJournalEntryRequest>({
      query: (payload) => ({
        url: '/accounting/journal-entries',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'JournalEntry', id: 'LIST' }]
    }),
    getCatalogs: builder.query<AccountingCatalogs, void>({
      query: () => '/accounting/catalogs'
    }),

    // Cost Centers endpoints
    getCostCenters: builder.query<CostCenter[], void>({
      query: () => '/accounting/cost-centers',
      transformResponse: (response: any): CostCenter[] => {
        const list =
          (Array.isArray(response) && response) ||
          (Array.isArray(response?.cost_centers) && response.cost_centers) ||
          (Array.isArray(response?.items) && response.items) ||
          (Array.isArray(response?.data) && response.data) ||
          [];

        return list.map((cc: any) => ({
          id: String(cc.id),
          code: cc.code ? String(cc.code) : undefined,
          name: cc.name ?? cc.description ?? cc.label ?? String(cc.id),
          is_active: cc.is_active !== undefined ? Boolean(cc.is_active) : undefined
        }));
      },
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'CostCenter' as const, id })), { type: 'CostCenter', id: 'LIST' }]
          : [{ type: 'CostCenter', id: 'LIST' }]
    }),

    getCostCenterById: builder.query<CostCenter, string>({
      query: (id) => `/accounting/cost-centers/${id}`,
      providesTags: (result, error, id) => [{ type: 'CostCenter', id }]
    }),

    createCostCenter: builder.mutation<CostCenter, Omit<CostCenter, 'id'>>({
      query: (payload) => ({
        url: '/accounting/cost-centers',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'CostCenter', id: 'LIST' }]
    }),

    updateCostCenter: builder.mutation<CostCenter, { id: string; payload: Partial<Omit<CostCenter, 'id'>> }>({
      query: ({ id, payload }) => ({
        url: `/accounting/cost-centers/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CostCenter', id },
        { type: 'CostCenter', id: 'LIST' }
      ]
    }),

    deleteCostCenter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounting/cost-centers/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: [{ type: 'CostCenter', id: 'LIST' }]
    })
  })
});

export const {
  useGetAccountsQuery,
  useLazyGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetJournalEntriesQuery,
  useGetJournalEntryByIdQuery,
  useCreateJournalEntryMutation,
  useGetCatalogsQuery,
  useGetCostCentersQuery,
  useGetCostCenterByIdQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation
} = accountingApi;
