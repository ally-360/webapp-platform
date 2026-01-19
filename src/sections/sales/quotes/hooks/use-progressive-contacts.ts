import { useCallback, useEffect, useMemo, useState } from 'react';

import { useDebounce } from 'src/hooks/use-debounce';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import type { Contact, ContactType } from 'src/redux/services/contactsApi';

type UseProgressiveContactsOptions = {
  limit?: number;
  debounceMs?: number;
  type?: ContactType | 'CUSTOMER' | 'PROVIDER' | 'CLIENT' | 'client' | 'provider';
};

export function useProgressiveContacts(options: UseProgressiveContactsOptions = {}) {
  const { limit = 100, debounceMs = 300, type } = options;

  const normalizedType: ContactType | undefined = useMemo(() => {
    if (!type) return undefined;
    if (type === 'CUSTOMER' || type === 'CLIENT') return 'client';
    if (type === 'PROVIDER') return 'provider';
    return type;
  }, [type]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, debounceMs);

  const [page, setPage] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  const queryArgs = useMemo(
    () => ({
      limit,
      offset,
      search: debouncedSearch || undefined,
      type: normalizedType
    }),
    [limit, offset, debouncedSearch, normalizedType]
  );

  const { data, isFetching, isLoading } = useGetContactsQuery(queryArgs);

  // Calcular si hay más páginas basado en si llegó el límite
  const hasNext = useMemo(() => {
    if (!data || !Array.isArray(data)) return false;
    return data.length === limit;
  }, [data, limit]);

  // Reiniciar página cuando cambia la búsqueda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  // Manejar datos entrantes
  useEffect(() => {
    const incoming = Array.isArray(data) ? data : [];

    setContacts((prev) => {
      if (page === 1) return incoming;

      const existingIds = new Set(prev.map((c) => c.id));
      return [...prev, ...incoming.filter((item) => !existingIds.has(item.id))];
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
    contacts,
    search,
    setSearch,
    hasNext,
    isFetching,
    isLoading,
    loadNextPage,
    listboxProps
  };
}
