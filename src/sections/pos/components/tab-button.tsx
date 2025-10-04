import React from 'react';
import { Button, Tooltip, Box, Typography, Chip, useTheme, useMediaQuery } from '@mui/material';
import { Icon } from '@iconify/react';
import { type SaleWindow } from 'src/redux/pos/posSlice';

interface TabButtonProps {
  tab: SaleWindow;
  isActive: boolean;
  onClick: (tabId: number) => void;
}

/**
 * Botón de tab individual en el tab bar
 */
const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getTabDisplayName = (saleWindow: SaleWindow): string => {
    if (isMobile && saleWindow.name.length > 8) {
      return `${saleWindow.name.substring(0, 6)}...`;
    }
    return saleWindow.name;
  };

  const getTabTooltip = (saleWindow: SaleWindow): string => {
    const productCount = saleWindow.products.length;
    const { total } = saleWindow;
    return `${saleWindow.name}\nProductos: ${productCount}\nTotal: $${total.toLocaleString()}`;
  };

  return (
    <Tooltip title={getTabTooltip(tab)} placement="top" arrow>
      <Button
        data-tab-button
        variant={isActive ? 'contained' : 'outlined'}
        startIcon={<Icon icon="mdi:cart" />}
        onClick={() => onClick(tab.id)}
        size="small"
        sx={{
          minWidth: isMobile ? 'auto' : 120,
          flexShrink: 0,
          position: 'relative',
          '&.MuiButton-contained': {
            boxShadow: theme.shadows[2]
          },
          // Add a subtle indicator for active tab
          '&.MuiButton-contained::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 20,
            height: 3,
            bgcolor: 'primary.main',
            borderRadius: 1.5
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="button" sx={{ textTransform: 'none' }}>
            {getTabDisplayName(tab)}
          </Typography>
          {tab.products.length > 0 && (
            <Chip
              label={tab.products.length}
              size="small"
              sx={{
                height: 20,
                minWidth: 20,
                '& .MuiChip-label': {
                  px: 0.5,
                  fontSize: '0.75rem'
                },
                bgcolor: isActive ? 'rgba(255,255,255,0.2)' : 'action.hover'
              }}
            />
          )}
        </Box>
      </Button>
    </Tooltip>
  );
};

export default TabButton;
