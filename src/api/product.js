import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
import { useAppSelector } from 'src/hooks/store';

// ----------------------------------------------------------------------

export function useGetProducts() {
  const URL = endpoints.product.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      products: data?.products || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !data?.products.length
    }),
    [data?.products, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetProduct(productId) {
  const URL = productId ? [endpoints.product.details, { params: { productId } }] : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      product: data?.product,
      productLoading: isLoading,
      productError: error,
      productValidating: isValidating
    }),
    [data?.product, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useSearchProducts(query) {
  const { products, productsLoading, error } = useAppSelector((state) => state.products);

  const filteredProducts = useMemo(() => {
    if (!query) return products;

    return products.filter(
      (product) => product.name.toLowerCase().includes(query.toLowerCase()) // Se asume que cada producto tiene un 'name'
    );
  }, [products, query]);

  const memoizedValue = useMemo(
    () => ({
      searchResults: filteredProducts,
      searchLoading: productsLoading,
      searchError: error,
      searchValidating: false, // No hay validación porque no estamos haciendo una petición
      searchEmpty: !productsLoading && filteredProducts.length === 0
    }),
    [filteredProducts, error, productsLoading]
  );

  return memoizedValue;
}
