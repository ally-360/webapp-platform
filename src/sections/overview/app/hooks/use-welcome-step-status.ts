import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';

export interface WelcomeStepStatus {
  isCompleted: boolean;
  hasProducts: boolean;
  hasContacts: boolean;
  hasInvoices: boolean;
  isLoading: boolean;
  completionPercentage: number;
}

export function useWelcomeStepStatus(): WelcomeStepStatus {
  // RTK Query hooks para validar el progreso del usuario
  const { data: products, isLoading: loadingProducts } = useGetProductsQuery({ limit: 1 });
  const { data: contacts, isLoading: loadingContacts } = useGetContactsQuery({ limit: 1 });
  const { data: invoices, isLoading: loadingInvoices } = useGetSalesInvoicesQuery({ limit: 1 });

  // Determinar qué pasos están completados
  const hasProducts = products && products.total > 0;
  const hasContacts = contacts && contacts.length > 0;
  const hasInvoices = invoices && invoices.total > 0;

  // Verificar si todos los pasos están completados
  const isCompleted = hasProducts && hasContacts && hasInvoices;
  const isLoading = loadingProducts || loadingContacts || loadingInvoices;

  // Calcular porcentaje de completado
  const completedSteps = [hasProducts, hasContacts, hasInvoices].filter(Boolean).length;
  const completionPercentage = (completedSteps / 3) * 100;

  return {
    isCompleted: Boolean(isCompleted && !isLoading),
    hasProducts: Boolean(hasProducts),
    hasContacts: Boolean(hasContacts),
    hasInvoices: Boolean(hasInvoices),
    isLoading,
    completionPercentage
  };
}
