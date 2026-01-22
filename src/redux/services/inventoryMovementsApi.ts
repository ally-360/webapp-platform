import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  InventoryMovement,
  MovementsListParams,
  CreateMovementPayload,
  TransferStockPayload,
  MovementJournalEntry
} from 'src/types/inventory-movements';
import { baseQueryWithReauth } from './baseQuery';

export const inventoryMovementsApi = createApi({
  reducerPath: 'inventoryMovementsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['InventoryMovement'],
  endpoints: (builder) => ({
    // List movements with filters
    listMovements: builder.query<InventoryMovement[], MovementsListParams | void>({
      query: (params) => ({
        url: '/movements/',
        params: params
          ? {
              ...(params.product_id && { product_id: params.product_id }),
              ...(params.pdv_id && { pdv_id: params.pdv_id }),
              ...(params.movement_type && { movement_type: params.movement_type }),
              limit: params.limit || 50,
              offset: params.offset || 0
            }
          : { limit: 50, offset: 0 }
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'InventoryMovement' as const,
                id
              })),
              { type: 'InventoryMovement', id: 'LIST' }
            ]
          : [{ type: 'InventoryMovement', id: 'LIST' }]
    }),

    // Get movement by ID
    getMovementById: builder.query<InventoryMovement, string>({
      query: (id) => `/movements/${id}`,
      providesTags: (result, error, id) => [{ type: 'InventoryMovement', id }]
    }),

    // Create manual movement (IN/OUT)
    createMovement: builder.mutation<InventoryMovement, CreateMovementPayload>({
      query: (payload) => ({
        url: '/movements/',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'InventoryMovement', id: 'LIST' }]
    }),

    // Transfer stock between PDVs
    transferStock: builder.mutation<any, TransferStockPayload>({
      query: (payload) => ({
        url: '/movements/transfer',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: [{ type: 'InventoryMovement', id: 'LIST' }]
    }),

    // Get journal entry for movement (TODO: implement when ready)
    getMovementJournalEntry: builder.query<MovementJournalEntry, string>({
      query: (movementId) => `/movements/${movementId}/journal-entry`
    })
  })
});

export const {
  useListMovementsQuery,
  useLazyListMovementsQuery,
  useGetMovementByIdQuery,
  useCreateMovementMutation,
  useTransferStockMutation,
  useGetMovementJournalEntryQuery,
  useLazyGetMovementJournalEntryQuery
} = inventoryMovementsApi;
