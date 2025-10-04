import { useState, useMemo, useEffect } from 'react';
import type { Product } from 'src/redux/pos/posSlice';

export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  minStock?: number;
  inStockOnly: boolean;
  sortBy: 'name' | 'price' | 'stock' | 'category';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

/**
 * Hook para manejar filtros y búsqueda de productos
 */
export const useProductFilters = (products: Product[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    categories: [],
    priceRange: [0, 100000],
    minStock: undefined,
    inStockOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    searchTerm: ''
  });

  // Update search term from filters
  useEffect(() => {
    setSearchTerm(filters.searchTerm);
  }, [filters.searchTerm]);

  const handleFilters = (field: keyof ProductFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    const priceRange = products.reduce(
      (acc, product) => [Math.min(acc[0], product.price), Math.max(acc[1], product.price)],
      [Infinity, -Infinity]
    );

    setFilters({
      categories: [],
      priceRange: [priceRange[0], priceRange[1]],
      minStock: undefined,
      inStockOnly: false,
      sortBy: 'name',
      sortOrder: 'asc',
      searchTerm: ''
    });
    setSearchTerm('');
  };

  const canReset =
    filters.categories.length > 0 ||
    filters.inStockOnly ||
    (filters.minStock && filters.minStock > 0) ||
    filters.searchTerm !== '' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Text search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        (product.category && product.category.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;

      // Category filter
      if (filters.categories.length > 0 && product.category) {
        if (!filters.categories.includes(product.category)) return false;
      }

      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Stock filter
      if (filters.inStockOnly && product.stock !== undefined && product.stock <= 0) {
        return false;
      }

      if (filters.minStock !== undefined && product.stock !== undefined && product.stock < filters.minStock) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = (a.stock || 0) - (b.stock || 0);
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [products, searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    handleFilters,
    handleResetFilters,
    canReset,
    filteredAndSortedProducts
  };
};
