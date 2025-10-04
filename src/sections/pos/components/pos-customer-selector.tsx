import React, { memo } from 'react';
// @mui
import { Box, Typography, TextField, Autocomplete } from '@mui/material';
import { Icon } from '@iconify/react';
// types & data
import type { Customer } from 'src/redux/pos/posSlice';

interface Props {
  selectedCustomer: Customer | null;
  customers: Customer[];
  onCustomerChange: (customer: Customer | null) => void;
}

const PosCustomerSelector = memo(({ selectedCustomer, customers, onCustomerChange }: Props) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="subtitle2" gutterBottom>
      Cliente
    </Typography>
    <Autocomplete
      size="small"
      options={customers}
      getOptionLabel={(option) => option.name}
      value={selectedCustomer}
      onChange={(_, newValue) => onCustomerChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Seleccionar cliente"
          InputProps={{
            ...params.InputProps,
            startAdornment: <Icon icon="mdi:account" style={{ marginRight: 8, opacity: 0.6 }} />
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Box>
            <Typography variant="body2">{option.name}</Typography>
            {option.document && (
              <Typography variant="caption" color="text.secondary">
                {option.document_type}: {option.document}
              </Typography>
            )}
          </Box>
        </li>
      )}
    />
  </Box>
));

PosCustomerSelector.displayName = 'PosCustomerSelector';

export default PosCustomerSelector;
