import { useState, useEffect } from 'react';
import { useAppDispatch } from 'src/hooks/store';
import { setCustomerToSaleWindow, type Customer, type SaleWindow } from 'src/redux/pos/posSlice';

/**
 * Hook para manejar la selección de clientes en una ventana de venta
 */
export const useCustomerSelection = (sale: SaleWindow) => {
  const dispatch = useAppDispatch();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(sale.customer);

  useEffect(() => {
    if (selectedCustomer !== sale.customer) {
      dispatch(setCustomerToSaleWindow({ windowId: sale.id, customer: selectedCustomer }));
    }
  }, [selectedCustomer, sale.customer, sale.id, dispatch]);

  const handleCustomerChange = (customer: Customer | null) => {
    setSelectedCustomer(customer);
  };

  return {
    selectedCustomer,
    handleCustomerChange
  };
};
