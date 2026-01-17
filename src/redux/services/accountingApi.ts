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
  AccountingCatalogs
} from 'src/sections/accounting/types';
import { baseQueryWithReauth } from './baseQuery';

export const accountingApi = createApi({
  reducerPath: 'accountingApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AccountingAccount', 'JournalEntry'],
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
          ...(params.search && { search: params.search })
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
    getCatalogs: builder.query<AccountingCatalogs, void>({
      query: () => '/accounting/catalogs'
    })
  })
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetJournalEntriesQuery,
  useGetJournalEntryByIdQuery,
  useGetCatalogsQuery
} = accountingApi;
