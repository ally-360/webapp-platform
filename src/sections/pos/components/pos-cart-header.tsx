import React, { memo } from 'react';
// @mui
import { CardHeader, Typography, Stack, Chip, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
// types
import type { SaleWindow } from 'src/redux/pos/posSlice';

interface Props {
  sale: SaleWindow;
  onCloseDrawer: () => void;
}

const PosCartHeader = memo(({ sale, onCloseDrawer }: Props) => (
  <CardHeader
    title={
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">
          {sale.name}
          <Chip
            size="small"
            label={sale.status}
            color={(() => {
              if (sale.status === 'paid') return 'success';
              if (sale.status === 'pending_payment') return 'warning';
              return 'default';
            })()}
            sx={{ ml: 1 }}
          />
        </Typography>
        <IconButton onClick={onCloseDrawer}>
          <Icon icon="mdi:close" />
        </IconButton>
      </Stack>
    }
    sx={{ pb: 1 }}
  />
));

PosCartHeader.displayName = 'PosCartHeader';

export default PosCartHeader;
