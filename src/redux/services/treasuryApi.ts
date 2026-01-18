import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  TreasuryAccount,
  TreasuryMovement,
  TreasuryTransfer,
  GetAccountsResponse,
  GetMovementsResponse,
  GetBalancesResponse,
  CreateAccountPayload,
  UpdateAccountPayload,
  CreateMovementPayload,
  CreateTransferPayload,
  AccountFilters,
  MovementFilters,
  TreasurySummaryReport,
  AccountBalanceReport,
  AccountBalanceReportParams,
  TreasuryCatalogs,
  AccountLookupParams,
  AccountsLookupResponse,
  AvailableAccountsParams,
  AccountSummary,
  MovementsBySourceParams,
  ValidateMovementPayload,
  MovementValidationResponse,
  JournalEntry
} from 'src/sections/treasury/types';
import { baseQueryWithReauth } from './baseQuery';

export const treasuryApi = createApi({
  reducerPath: 'treasuryApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TreasuryAccount', 'TreasuryMovement', 'TreasuryBalance'],
  endpoints: (builder) => ({
    // Accounts
    getAccounts: builder.query<GetAccountsResponse, AccountFilters | void>({
      query: (params) => ({
        url: '/treasury/accounts',
        params: params
          ? {
              ...(params.type && { type: params.type }),
              ...(params.is_active !== undefined && { is_active: params.is_active })
            }
          : {}
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.accounts.map(({ id }) => ({ type: 'TreasuryAccount' as const, id })),
              { type: 'TreasuryAccount', id: 'LIST' }
            ]
          : [{ type: 'TreasuryAccount', id: 'LIST' }]
    }),

    getAccountById: builder.query<TreasuryAccount, string>({
      query: (id) => `/treasury/accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'TreasuryAccount', id }]
    }),

    createAccount: builder.mutation<TreasuryAccount, CreateAccountPayload>({
      query: (payload) => ({
        url: '/treasury/accounts',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    createSimpleAccount: builder.mutation<{ account: TreasuryAccount; opening_entry_id?: string }, any>({
      query: (payload) => ({
        url: '/treasury/accounts/simple',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    updateAccount: builder.mutation<TreasuryAccount, { id: string; payload: UpdateAccountPayload }>({
      query: ({ id, payload }) => ({
        url: `/treasury/accounts/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TreasuryAccount', id },
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    // Balances
    getBalances: builder.query<GetBalancesResponse, void>({
      query: () => '/treasury/accounts/balances',
      providesTags: [{ type: 'TreasuryBalance', id: 'SUMMARY' }]
    }),

    // Movements
    getMovements: builder.query<GetMovementsResponse, MovementFilters | void>({
      query: (params) => ({
        url: '/treasury/movements',
        params: {
          ...(params && params.treasury_account_id && { treasury_account_id: params.treasury_account_id }),
          ...(params && params.cash_session_id && { cash_session_id: params.cash_session_id }),
          ...(params && params.movement_type && { movement_type: params.movement_type }),
          ...(params && params.source_module && { source_module: params.source_module }),
          ...(params && params.start_date && { start_date: params.start_date }),
          ...(params && params.end_date && { end_date: params.end_date }),
          ...(params &&
            params.include_reversed !== undefined && {
              include_reversed: params.include_reversed
            }),
          page: params?.page ?? 1,
          size: params?.size ?? 100
        }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.movements.map(({ id }) => ({ type: 'TreasuryMovement' as const, id })),
              { type: 'TreasuryMovement', id: 'LIST' }
            ]
          : [{ type: 'TreasuryMovement', id: 'LIST' }]
    }),

    getMovementById: builder.query<TreasuryMovement, string>({
      query: (id) => `/treasury/movements/${id}`,
      providesTags: (result, error, id) => [{ type: 'TreasuryMovement', id }]
    }),

    createMovement: builder.mutation<TreasuryMovement, CreateMovementPayload>({
      query: (payload) => ({
        url: '/treasury/movements',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        { type: 'TreasuryMovement', id: 'LIST' },
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    voidMovement: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/treasury/movements/${id}/void`,
        method: 'POST',
        body: { reason }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TreasuryMovement', id },
        { type: 'TreasuryMovement', id: 'LIST' },
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    reverseMovement: builder.mutation<void, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/treasury/movements/${id}/reverse`,
        method: 'POST',
        body: { reason }
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TreasuryMovement', id },
        { type: 'TreasuryMovement', id: 'LIST' },
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    // Transfers
    createTransfer: builder.mutation<TreasuryTransfer, CreateTransferPayload>({
      query: (payload) => ({
        url: '/treasury/transfers',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [
        { type: 'TreasuryMovement', id: 'LIST' },
        { type: 'TreasuryAccount', id: 'LIST' },
        { type: 'TreasuryBalance', id: 'SUMMARY' }
      ]
    }),

    // Reports
    getSummaryReport: builder.query<TreasurySummaryReport, void>({
      query: () => '/treasury/reports/summary',
      providesTags: [{ type: 'TreasuryBalance', id: 'SUMMARY' }]
    }),

    getAccountBalanceReport: builder.query<
      AccountBalanceReport,
      { accountId: string; params: AccountBalanceReportParams }
    >({
      query: ({ accountId, params }) => ({
        url: `/treasury/reports/account-balance/${accountId}`,
        params
      }),
      providesTags: (result, error, { accountId }) => [{ type: 'TreasuryAccount', id: accountId }]
    }),

    // Catalogs & Lookups
    getCatalogs: builder.query<TreasuryCatalogs, void>({
      query: () => '/treasury/catalogs'
    }),

    getAccountsLookup: builder.query<AccountsLookupResponse, AccountLookupParams | void>({
      query: (params) => ({
        url: '/treasury/accounts/lookup',
        params
      }),
      providesTags: [{ type: 'TreasuryAccount', id: 'LOOKUP' }]
    }),

    getAvailableAccounts: builder.query<AccountsLookupResponse, AvailableAccountsParams | void>({
      query: (params) => ({
        url: '/treasury/accounts/available-for-operation',
        params
      }),
      providesTags: [{ type: 'TreasuryAccount', id: 'AVAILABLE' }]
    }),

    getAccountSummary: builder.query<AccountSummary, string>({
      query: (accountId) => `/treasury/accounts/${accountId}/summary`,
      providesTags: (result, error, accountId) => [{ type: 'TreasuryAccount', id: accountId }]
    }),

    // Movement queries
    getMovementsBySource: builder.query<GetMovementsResponse, MovementsBySourceParams>({
      query: (params) => ({
        url: '/treasury/movements/by-source',
        params
      }),
      providesTags: [{ type: 'TreasuryMovement', id: 'BY_SOURCE' }]
    }),

    validateMovement: builder.mutation<MovementValidationResponse, ValidateMovementPayload>({
      query: (payload) => ({
        url: '/treasury/movements/validate',
        method: 'POST',
        body: payload
      })
    }),

    getMovementJournalEntry: builder.query<JournalEntry, string>({
      query: (movementId) => `/treasury/movements/${movementId}/journal-entry`
    })
  })
});

export const {
  // Accounts
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useCreateSimpleAccountMutation,
  useUpdateAccountMutation,
  // Balances
  useGetBalancesQuery,
  // Movements
  useGetMovementsQuery,
  useGetMovementByIdQuery,
  useCreateMovementMutation,
  useVoidMovementMutation,
  useReverseMovementMutation,
  useGetMovementsBySourceQuery,
  useValidateMovementMutation,
  useGetMovementJournalEntryQuery,
  // Transfers
  useCreateTransferMutation,
  // Reports
  useGetSummaryReportQuery,
  useGetAccountBalanceReportQuery,
  // Catalogs & Lookups
  useGetCatalogsQuery,
  useGetAccountsLookupQuery,
  useGetAvailableAccountsQuery,
  useGetAccountSummaryQuery
} = treasuryApi;
