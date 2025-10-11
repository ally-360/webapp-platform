import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import { useAuthContext } from 'src/auth/hooks';

export interface WelcomeStepStatus {
  isCompleted: boolean;
  hasProducts: boolean;
  hasContacts: boolean;
  hasInvoices: boolean;
  isLoading: boolean;
  isInitialLoad: boolean;
  completionPercentage: number;
}

export function useWelcomeStepStatus(): WelcomeStepStatus {
  const { company, pdvCompany } = useAuthContext();

  // Solo hacer las queries si hay empresa y PDV configurados
  const shouldSkipQueries = !company?.id || !pdvCompany?.id;

  console.log(
    '🔍 WelcomeStepStatus - Company:',
    company?.id,
    'PDV:',
    pdvCompany?.id,
    'Should skip:',
    shouldSkipQueries
  );

  // RTK Query hooks para validar el progreso del usuario
  const {
    data: products,
    isLoading: loadingProducts,
    error: productsError
  } = useGetProductsQuery({ limit: 1 }, { skip: shouldSkipQueries });

  const {
    data: contacts,
    isLoading: loadingContacts,
    error: contactsError
  } = useGetContactsQuery({ limit: 1 }, { skip: shouldSkipQueries });

  const {
    data: invoices,
    isLoading: loadingInvoices,
    error: invoicesError
  } = useGetSalesInvoicesQuery({ limit: 1 }, { skip: shouldSkipQueries });

  // Log errors for debugging
  if (productsError) console.warn('❌ Products query error:', productsError);
  if (contactsError) console.warn('❌ Contacts query error:', contactsError);
  if (invoicesError) console.warn('❌ Invoices query error:', invoicesError);

  // Determinar qué pasos están completados
  const hasProducts = products && products.total > 0;
  const hasContacts = contacts && contacts.length > 0;
  const hasInvoices = invoices && invoices.total > 0;

  // Verificar si todos los pasos están completados
  const isCompleted = hasProducts && hasContacts && hasInvoices;
  const isLoading = loadingProducts || loadingContacts || loadingInvoices;

  const isInitialLoad = shouldSkipQueries || isLoading || (!products && !contacts && !invoices);

  const completedSteps = [hasProducts, hasContacts, hasInvoices].filter(Boolean).length;
  const completionPercentage = (completedSteps / 3) * 100;

  return {
    isCompleted: Boolean(isCompleted && !isLoading),
    hasProducts: Boolean(hasProducts),
    hasContacts: Boolean(hasContacts),
    hasInvoices: Boolean(hasInvoices),
    isLoading,
    isInitialLoad,
    completionPercentage
  };
}
