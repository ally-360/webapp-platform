import { useState, useEffect, useMemo } from 'react';
import { Customer } from 'src/redux/pos/posSlice';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useDebounce } from 'src/hooks/use-debounce';

/**
 * Hook para manejar clientes en el POS
 * Integra la API real de contactos con la funcionalidad del POS
 * Incluye búsqueda con debounce y validación de caracteres mínimos
 */
export const usePosCustomers = () => {
  const [posCustomers, setPosCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce para evitar demasiadas peticiones
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Solo buscar si hay 4 o más caracteres o si está vacío (para mostrar cliente por defecto)
  const shouldSearch = debouncedSearchTerm === '' || debouncedSearchTerm.length >= 4;
  const finalSearchTerm = shouldSearch ? debouncedSearchTerm : '';

  // Indicador de si el usuario está escribiendo pero no ha llegado al mínimo
  const isWritingButNotReady = searchTerm.length > 0 && searchTerm.length < 4;

  // Obtener contactos de la API con búsqueda inteligente
  const {
    data: contactsData,
    isLoading,
    error,
    refetch
  } = useGetContactsQuery(
    {
      search: finalSearchTerm,
      type: 'client', // Solo clientes
      is_active: true, // Solo clientes activos
      limit: 50
    },
    {
      skip: !shouldSearch || isWritingButNotReady
    }
  );

  // Cliente por defecto (sin documento) - memoizado para evitar re-renders
  const defaultCustomer: Customer = useMemo(
    () => ({
      id: '0', // Cambiar a string para coincidir con el tipo
      name: 'Cliente Final',
      document_type: undefined,
      document: '',
      email: '',
      phone: '',
      address: ''
    }),
    []
  );

  // Transformar contactos de la API al formato esperado por el POS
  useEffect(() => {
    let apiContacts: any[] = [];

    // Manejar diferentes formatos de respuesta
    if (contactsData) {
      if (Array.isArray(contactsData)) {
        apiContacts = contactsData;
      } else if ((contactsData as any).items && Array.isArray((contactsData as any).items)) {
        apiContacts = (contactsData as any).items;
      } else if ((contactsData as any).data && Array.isArray((contactsData as any).data)) {
        apiContacts = (contactsData as any).data;
      }
    }

    if (apiContacts.length > 0) {
      const transformedCustomers: Customer[] = apiContacts.map((apiContact) => ({
        id: apiContact.id,
        name: apiContact.name,
        document_type: apiContact.id_type as 'CC' | 'NIT' | 'CE' | 'PP' | undefined,
        document: apiContact.id_number || '',
        email: apiContact.email || '',
        phone: apiContact.phone_primary || apiContact.mobile || '',
        address: apiContact.billing_address?.address || ''
      }));

      // Agregar el cliente por defecto al inicio
      setPosCustomers([defaultCustomer, ...transformedCustomers]);
    } else {
      // Si no hay datos, solo mostrar cliente por defecto
      setPosCustomers([defaultCustomer]);
    }
  }, [contactsData, defaultCustomer]);

  // Función para buscar clientes
  const searchCustomers = (search: string) => {
    setSearchTerm(search);
  };

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    // Datos
    customers: posCustomers,
    defaultCustomer,
    totalCustomers: contactsData?.length || 0,

    // Estados
    isLoading: isLoading && shouldSearch && !isWritingButNotReady,
    error,

    // Información de búsqueda
    searchTerm,
    isSearchValid: shouldSearch,
    minSearchLength: 4,
    isWritingButNotReady,

    // Acciones
    searchCustomers,
    clearSearch,
    refetch
  };
};
