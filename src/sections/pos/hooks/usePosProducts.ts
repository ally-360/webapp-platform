import { useState, useEffect } from 'react';
import { Product as PosProduct } from 'src/redux/pos/posSlice';
import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { Product as ApiProduct, ProductFilters as ApiProductFilters } from 'src/api/types';
import { useDebounce } from 'src/hooks/use-debounce';

interface ProductFilters {
  search?: string;
  category_id?: string;
  brand_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  pdv_id?: string; // Filtrar por PDV para stock específico
}

/**
 * Hook para manejar productos en el POS
 * Integra la API real de productos con la funcionalidad del POS
 * Filtra productos por PDV para mostrar stock específico por ubicación
 */
export const usePosProducts = (filters: ProductFilters = {}, currentPDVId?: string) => {
  const [localFilters, setLocalFilters] = useState<ProductFilters>({
    ...filters,
    pdv_id: currentPDVId || filters.pdv_id,
    is_active: true // Solo productos activos por defecto
  });
  const [posProducts, setPosProducts] = useState<PosProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const shouldSearch = debouncedSearchTerm === '' || debouncedSearchTerm.length >= 2;

  const finalSearchTerm = shouldSearch ? debouncedSearchTerm : '';

  const isWritingButNotReady = searchTerm.length > 0 && searchTerm.length < 2;

  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useGetProductsQuery({
    search: finalSearchTerm,
    category_id: localFilters.category_id,
    brand_id: localFilters.brand_id,
    is_active: localFilters.is_active,
    page: localFilters.page || 1,
    limit: localFilters.limit || 50
  } as ApiProductFilters);

  useEffect(() => {
    if (productsData?.data) {
      const transformedProducts: PosProduct[] = productsData.data.map((apiProduct: ApiProduct) => {
        // Buscar stock específico del PDV actual
        const pdvStock = apiProduct.productPdv?.find((pdv) => pdv.pdv_id === currentPDVId);
        const stockQuantity = pdvStock?.quantity || 0; // Si no existe en productPdv, stock = 0

        // Extraer primera imagen si existe el array
        const firstImage = apiProduct.images?.[0]?.url || apiProduct.images?.[0] || '';

        return {
          id: apiProduct.id,
          name: apiProduct.name,
          price: apiProduct.priceSale || apiProduct.priceBase || 0,
          quantity: 1, // Cantidad por defecto al agregar al carrito
          sku: apiProduct.sku || '',
          tax_rate: apiProduct.taxesOption === 1 ? 0.19 : 0, // Asumir 19% si taxesOption es 1
          category: apiProduct.category?.name || 'Sin categoría',
          stock: stockQuantity, // Stock en el PDV actual
          globalStock: apiProduct.globalStock || apiProduct.quantityStock || 0, // Stock global
          quantityStock: apiProduct.quantityStock || 0, // Stock total del producto
          productPdv: apiProduct.productPdv || [], // ✅ ARRAY COMPLETO de stock por PDV
          image: firstImage,
          images: apiProduct.images?.map((img: any) => img?.url || img) || [], // ✅ Todas las imágenes
          // Información adicional del producto API
          barCode: apiProduct.barCode,
          description: apiProduct.description,
          brand: apiProduct.brand?.name,
          sellInNegative: apiProduct.sellInNegative || false
        };
      });

      // Si es la primera página o nueva búsqueda, reemplazar productos
      // Si es load more (página > 1), acumular productos
      if ((localFilters.page || 1) === 1) {
        setPosProducts(transformedProducts);
      } else {
        setPosProducts((prev) => {
          // Evitar duplicados verificando por ID
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = transformedProducts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [productsData, currentPDVId, localFilters.page]);

  // Funciones para manejar filtros
  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    setLocalFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Mantener el PDV actual si no se especifica uno nuevo
      pdv_id: newFilters.pdv_id || prev.pdv_id || currentPDVId
    }));
  };

  const clearFilters = () => {
    setLocalFilters({
      pdv_id: currentPDVId,
      is_active: true
    });
    setSearchTerm('');
  };

  const searchProducts = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    updateFilters({ page: 1 });
  };

  const filterByCategory = (categoryId: string) => {
    updateFilters({ category_id: categoryId, page: 1 });
  };

  const filterByBrand = (brandId: string) => {
    updateFilters({ brand_id: brandId, page: 1 });
  };

  const goToPage = (page: number) => {
    updateFilters({ page });
  };

  return {
    // Datos
    products: posProducts,
    totalProducts: productsData?.total || 0,
    currentPage: localFilters.page || 1,
    totalPages: Math.ceil((productsData?.total || 0) / (localFilters.limit || 50)),
    hasMore: productsData?.hasNext || false,

    // Estados
    isLoading: isLoading && shouldSearch && !isWritingButNotReady, // Solo mostrar loading cuando realmente está buscando
    error,

    // Información de búsqueda
    searchTerm,
    isSearchValid: shouldSearch,
    minSearchLength: 2,

    // Filtros actuales
    filters: localFilters,

    // Acciones
    updateFilters,
    clearFilters,
    searchProducts,
    filterByCategory,
    filterByBrand,
    goToPage,
    refetch
  };
};
