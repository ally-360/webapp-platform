import React, { memo, useState } from 'react';
// @mui
import { Box, Typography, TextField, Autocomplete, CircularProgress, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
// types & data
import type { Customer } from 'src/redux/pos/posSlice';

// Tipo extendido para incluir la opción de crear cliente
interface CustomerOption extends Customer {
  isCreateOption?: boolean;
}

interface Props {
  selectedCustomer: Customer | null;
  customers: Customer[];
  onCustomerChange: (customer: Customer | null) => void;
  onSearchCustomers?: (searchTerm: string) => void;
  onCreateCustomer?: () => void;
  isLoading?: boolean;
  searchTerm?: string;
  minSearchLength?: number;
  isWritingButNotReady?: boolean;
}

const PosCustomerSelector = memo(
  ({
    selectedCustomer,
    customers,
    onCustomerChange,
    onSearchCustomers,
    onCreateCustomer,
    isLoading = false,
    minSearchLength = 4,
    isWritingButNotReady = false
  }: Props) => {
    const [inputValue, setInputValue] = useState('');

    // Cliente especial para crear nuevo
    const createNewOption: CustomerOption = {
      id: 'create-new',
      name: '+ Crear nuevo cliente',
      document_type: undefined,
      document: '',
      email: '',
      phone: '',
      address: '',
      isCreateOption: true
    };

    // Opciones combinadas: clientes + opción de crear (siempre al final)
    const allOptions: CustomerOption[] = [...customers, createNewOption];

    const handleInputChange = (event: any, newInputValue: string) => {
      setInputValue(newInputValue);
      if (onSearchCustomers) {
        onSearchCustomers(newInputValue);
      }
    };

    const handleSelectionChange = (event: any, newValue: CustomerOption | null) => {
      // Si selecciona la opción de crear cliente
      if (newValue && newValue.id === 'create-new') {
        if (onCreateCustomer) {
          onCreateCustomer();
        }
        // No cambiar la selección, mantener la anterior
        return;
      }

      // Limpiar input cuando se selecciona un cliente real
      setInputValue('');
      onCustomerChange(newValue);
    };

    const getHelperText = () => {
      if (isWritingButNotReady) {
        return `Mínimo ${minSearchLength} caracteres para buscar`;
      }
      return '';
    };

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cliente
        </Typography>
        <Autocomplete
          size="small"
          options={allOptions}
          getOptionLabel={(option) => option.name}
          value={selectedCustomer}
          inputValue={inputValue}
          onChange={handleSelectionChange}
          onInputChange={handleInputChange}
          loading={isLoading}
          filterOptions={(options, { inputValue: searchValue }) => {
            if (!searchValue.trim()) {
              // Sin búsqueda, mostrar todos los clientes reales + opción de crear
              const realCustomers = (allOptions as CustomerOption[]).filter((option) => !option.isCreateOption);
              const createOption = (allOptions as CustomerOption[]).filter((option) => option.isCreateOption);
              return [...realCustomers, ...createOption];
            }

            // Con búsqueda, filtrar clientes reales y agregar opción crear
            const filtered = (allOptions as CustomerOption[]).filter((option) => !option.isCreateOption);
            const matchingCustomers = filtered.filter((customer) =>
              customer.name.toLowerCase().includes(searchValue.toLowerCase())
            );

            // Siempre incluir la opción crear al final
            if ((allOptions as CustomerOption[]).find((option) => option.isCreateOption)) {
              return [...matchingCustomers, createNewOption];
            }
            return matchingCustomers;
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Buscar cliente (mín. 4 caracteres)"
              helperText={getHelperText()}
              error={isWritingButNotReady}
              InputProps={{
                ...params.InputProps,
                startAdornment: <Icon icon="mdi:account" style={{ marginRight: 8, opacity: 0.6 }} />,
                endAdornment: (
                  <>
                    {isLoading ? <CircularProgress size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box sx={{ width: '100%' }}>
                {(option as any).isCreateOption ? (
                  // Opción especial para crear cliente
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <Icon icon="mdi:plus" style={{ marginRight: 8, color: 'primary.main' }} />
                    <Typography variant="body2" color="primary.main" fontWeight="medium">
                      {option.name}
                    </Typography>
                  </Box>
                ) : (
                  // Cliente normal
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      {option.document && (
                        <Typography variant="caption" color="text.secondary">
                          {option.document_type}: {option.document}
                        </Typography>
                      )}
                      {option.email && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                    {option.id === '0' && <Chip label="Por defecto" size="small" color="default" variant="outlined" />}
                  </Box>
                )}
              </Box>
            </li>
          )}
          noOptionsText={
            isWritingButNotReady ? `Escribe al menos ${minSearchLength} caracteres` : 'No se encontraron clientes'
          }
        />
      </Box>
    );
  }
);

PosCustomerSelector.displayName = 'PosCustomerSelector';

export default PosCustomerSelector;
