import React, { memo, useState } from 'react';
// @mui
import { Box, Typography, TextField, Autocomplete, Button, CircularProgress, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
// types & data
import type { Customer } from 'src/redux/pos/posSlice';

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
    searchTerm = '',
    minSearchLength = 4,
    isWritingButNotReady = false
  }: Props) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event: any, newInputValue: string) => {
      setInputValue(newInputValue);
      if (onSearchCustomers) {
        onSearchCustomers(newInputValue);
      }
    };

    const getHelperText = () => {
      if (isWritingButNotReady) {
        return `Mínimo ${minSearchLength} caracteres para buscar`;
      }
      if (searchTerm && customers.length === 1 && customers[0]?.id === 0) {
        return 'No se encontraron clientes. ¿Crear nuevo cliente?';
      }
      return '';
    };

    const showCreateOption = searchTerm && customers.length === 1 && customers[0]?.id === 0 && onCreateCustomer;

    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Cliente
        </Typography>
        <Autocomplete
          size="small"
          options={customers}
          getOptionLabel={(option) => option.name}
          value={selectedCustomer}
          inputValue={inputValue}
          onChange={(_, newValue) => onCustomerChange(newValue)}
          onInputChange={handleInputChange}
          loading={isLoading}
          filterOptions={(options, state) => {
            if (onSearchCustomers) {
              return options;
            }
            const filtered = options.filter((option) =>
              option.name.toLowerCase().includes(state.inputValue.toLowerCase())
            );
            return filtered;
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
                  {option.id === 0 && <Chip label="Por defecto" size="small" color="default" variant="outlined" />}
                </Box>
              </Box>
            </li>
          )}
          noOptionsText={
            isWritingButNotReady ? `Escribe al menos ${minSearchLength} caracteres` : 'No se encontraron clientes'
          }
        />

        {showCreateOption && (
          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon icon="mdi:plus" />}
              onClick={onCreateCustomer}
              size="small"
              fullWidth
            >
              Crear nuevo cliente
            </Button>
          </Box>
        )}
      </Box>
    );
  }
);

PosCustomerSelector.displayName = 'PosCustomerSelector';

export default PosCustomerSelector;
