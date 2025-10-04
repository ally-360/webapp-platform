// ========================================
// 🎭 INDICADOR MOCK - ALLY360 POS
// ========================================

import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { isMockMode } from '../api';

// ========================================
// 🎨 ESTILOS PARA EL INDICADOR
// ========================================
const mockIndicatorStyles = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 9999,
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '8px 12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(255, 152, 0, 0.3)',
  background: 'rgba(255, 152, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.2)'
  }
};

// ========================================
// 🏷️ COMPONENTE INDICADOR MOCK
// ========================================
export const MockIndicator: React.FC = () => {
  const theme = useTheme();
  const isMock = isMockMode();

  // Solo mostrar si el mock está activo
  if (!isMock) {
    return null;
  }

  return (
    <Box sx={mockIndicatorStyles}>
      <Chip
        label="🎭 MOCK ON"
        variant="filled"
        size="small"
        sx={{
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
          fontWeight: 'bold',
          fontSize: '11px',
          height: '24px',
          '& .MuiChip-label': {
            paddingX: '8px'
          }
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.warning.dark,
          fontWeight: 500,
          fontSize: '10px',
          opacity: 0.8,
          whiteSpace: 'nowrap'
        }}
      >
        Datos simulados
      </Typography>
    </Box>
  );
};

// ========================================
// 📱 COMPONENTE MODO DESARROLLO
// ========================================
export const DevelopmentBadge: React.FC = () => {
  const theme = useTheme();
  const isMock = isMockMode();
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && !isMock) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'flex-end'
      }}
    >
      {isDev && (
        <Chip
          label="🚧 DEV"
          variant="filled"
          size="small"
          sx={{
            backgroundColor: theme.palette.info.main,
            color: theme.palette.info.contrastText,
            fontWeight: 'bold',
            fontSize: '10px'
          }}
        />
      )}
      {isMock && (
        <Chip
          label="🎯 OFFLINE"
          variant="filled"
          size="small"
          sx={{
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
            fontWeight: 'bold',
            fontSize: '10px'
          }}
        />
      )}
    </Box>
  );
};

export default MockIndicator;
