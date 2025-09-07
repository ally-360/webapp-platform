import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Icon } from '@iconify/react';

interface ProductSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

/**
 * Simple search bar for products
 */
const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ searchTerm, onSearchChange }) => (
  <TextField
    fullWidth
    sx={{ minWidth: 240, maxWidth: 480 }}
    placeholder="Buscar productos por nombre, código o categoría..."
    value={searchTerm}
    onChange={(e) => onSearchChange(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Icon icon="mdi:magnify" />
        </InputAdornment>
      )
    }}
    size="small"
  />
);

export default ProductSearchBar;
