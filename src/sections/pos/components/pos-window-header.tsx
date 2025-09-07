import React from 'react';
import { CardHeader, Typography, Stack, IconButton, Chip } from '@mui/material';
import { Icon } from '@iconify/react';
import { type SaleWindow } from 'src/redux/pos/posSlice';

interface PosWindowHeaderProps {
  sale: SaleWindow;
  onClose: () => void;
}

/**
 * Header de la ventana de POS con información de la venta
 */
const PosWindowHeader: React.FC<PosWindowHeaderProps> = ({ sale, onClose }) => {
  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'success';
    if (status === 'pending_payment') return 'warning';
    return 'default';
  };

  return (
    <CardHeader
      title={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {sale.name}
            <Chip size="small" label={sale.status} color={getStatusColor(sale.status)} sx={{ ml: 1 }} />
          </Typography>
          <IconButton onClick={onClose}>
            <Icon icon="mdi:close" />
          </IconButton>
        </Stack>
      }
      sx={{ pb: 1 }}
    />
  );
};

export default PosWindowHeader;
