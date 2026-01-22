import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Product } from 'src/api/types';
import { useDebounce } from 'src/hooks/use-debounce';
import { useGetProductsQuery } from 'src/redux/services/productsApi';

type UseProgressiveProductsOptions = {
  limit?: number;
  debounceMs?: number;
};

export function useProgressiveProducts(options: UseProgressiveProductsOptions = {}) {
  const { limit = 100, debounceMs = 300 } = options;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, debounceMs);

  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);

  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined
    }),
    [page, limit, debouncedSearch]
  );

  const { data, isFetching, isLoading } = useGetProductsQuery(queryArgs);

  const hasNext = !!data?.hasNext;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  useEffect(() => {
    const incoming = data?.data ?? [];

    setProducts((prev) => {
      if (page === 1) return incoming;

      const existingIds = new Set(prev.map((p) => p.id));
      const merged = [...prev];

      for (const item of incoming) {
        if (!existingIds.has(item.id)) {
          merged.push(item);
        }
      }

      return merged;
    });
  }, [data, page]);

  const loadNextPage = useCallback(() => {
    if (isFetching) return;
    if (!hasNext) return;
    setPage((p) => p + 1);
  }, [hasNext, isFetching]);

  const listboxProps = useMemo(
    () => ({
      onScroll: (event: any) => {
        const target = event.currentTarget as HTMLElement | null;
        if (!target) return;

        const scrollPosition = target.scrollTop + target.clientHeight;
        const threshold = target.scrollHeight - 48;

        if (scrollPosition >= threshold) {
          loadNextPage();
        }
      }
    }),
    [loadNextPage]
  );

  return {
    products,
    search,
    setSearch,
    hasNext,
    isFetching,
    isLoading,
    loadNextPage,
    listboxProps
  };
}
