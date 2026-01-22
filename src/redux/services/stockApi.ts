import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// Types
export interface ProductStock {
  id: string;
  product_id: string;
  pdv_id: string;
  variant_id?: string;
  quantity: number;
  product_name: string;
  product_sku?: string;
  pdv_name: string;
  variant_color?: string;
  variant_size?: string;
}

export interface ProductStockSummary {
  product_id: string;
  product_name: string;
  product_sku?: string;
  total_quantity: number;
  pdv_stocks: ProductStock[];
}

export interface UpdateMinQuantityRequest {
  min_quantity: number;
}

export const stockApi = createApi({
  reducerPath: 'stockApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ProductStock'],
  endpoints: (builder) => ({
    // Get product stock summary
    getProductStockSummary: builder.query<ProductStockSummary, string>({
      query: (productId) => `/stock/product/${productId}/summary`,
      providesTags: (result, error, productId) => [
        { type: 'ProductStock', id: productId },
        { type: 'ProductStock', id: 'LIST' }
      ]
    }),

    // Get product stock by PDV
    getProductStock: builder.query<ProductStock[], string>({
      query: (productId) => `/stock/product/${productId}`,
      providesTags: (result, error, productId) => [
        { type: 'ProductStock', id: productId },
        { type: 'ProductStock', id: 'LIST' }
      ]
    }),

    // Update min quantity for a PDV
    updateMinQuantity: builder.mutation<void, { productId: string; pdvId: string; minQuantity: number }>({
      query: ({ productId, pdvId, minQuantity }) => ({
        url: `/products/${productId}/stock/${pdvId}/min-quantity`,
        method: 'PATCH',
        body: { min_quantity: minQuantity }
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'ProductStock', id: productId },
        { type: 'ProductStock', id: 'LIST' }
      ]
    })
  })
});

export const { useGetProductStockSummaryQuery, useGetProductStockQuery, useUpdateMinQuantityMutation } = stockApi;
