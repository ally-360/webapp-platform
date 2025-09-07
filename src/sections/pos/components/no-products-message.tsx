import React from 'react';
// @mui
import { Box, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

interface NoProductsMessageProps {
  searchTerm?: string;
}

export default function NoProductsMessage({ searchTerm }: NoProductsMessageProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        textAlign: 'center'
      }}
    >
      <Icon icon="mdi:package-variant-off" style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No se encontraron productos
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {searchTerm ? `No hay resultados para "${searchTerm}"` : 'No hay productos disponibles'}
      </Typography>
    </Box>
  );
}
