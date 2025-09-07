import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box, Tooltip, Stack, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import { alpha, keyframes } from '@mui/material/styles';
import BarcodeScanner from './barcode-scanner';

// Animation for scanner button
const scannerPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
  100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
`;

interface ProductSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBarcodeDetected?: (barcode: string) => void;
}

/**
 * Enhanced search bar with barcode scanner integration
 */
const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ searchTerm, onSearchChange, onBarcodeDetected }) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const handleScanSuccess = (barcode: string) => {
    setLastScannedCode(barcode);
    onSearchChange(barcode);
    if (onBarcodeDetected) {
      onBarcodeDetected(barcode);
    }
    setScannerOpen(false);
  };

  const handleScanError = (error: string) => {
    console.error('Scanner error:', error);
    // You could show a toast notification here
  };

  const clearLastScan = () => {
    setLastScannedCode(null);
    onSearchChange('');
  };

  return (
    <>
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Stack spacing={1}>
          {/* Search Field with Scanner Button */}
          <TextField
            fullWidth
            placeholder="Buscar productos por nombre, código o categoría..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon icon="mdi:magnify" style={{ color: '#666' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Escanear código de barras" placement="top">
                    <IconButton
                      onClick={() => setScannerOpen(true)}
                      size="small"
                      sx={{
                        bgcolor: alpha('#2196f3', 0.1),
                        color: 'primary.main',
                        border: '2px solid',
                        borderColor: alpha('#2196f3', 0.3),
                        transition: 'all 0.3s ease',
                        animation: `${scannerPulse} 2s infinite`,
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderColor: 'primary.main',
                          transform: 'scale(1.05)',
                          animation: 'none'
                        }
                      }}
                    >
                      <Icon icon="mdi:barcode-scan" fontSize="1.2rem" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'background.paper',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                },
                '&.Mui-focused': {
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)'
                }
              }
            }}
          />

          {/* Last Scanned Code Indicator */}
          {lastScannedCode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Último código: ${lastScannedCode}`}
                icon={<Icon icon="mdi:barcode" />}
                size="small"
                variant="outlined"
                onDelete={clearLastScan}
                sx={{
                  bgcolor: alpha('#4caf50', 0.1),
                  color: '#2e7d32',
                  borderColor: alpha('#4caf50', 0.3),
                  '& .MuiChip-icon': {
                    color: '#4caf50'
                  },
                  '& .MuiChip-deleteIcon': {
                    color: '#4caf50',
                    '&:hover': {
                      color: '#2e7d32'
                    }
                  }
                }}
              />
            </Box>
          )}
        </Stack>
      </Box>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        onError={handleScanError}
      />
    </>
  );
};

export default ProductSearchBar;
