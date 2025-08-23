import React, { memo, useMemo } from 'react';
// @mui
import { Drawer, Card, useTheme, useMediaQuery } from '@mui/material';

interface Props {
  open: boolean;
  children: React.ReactNode;
}

const PosCartDrawer = memo(({ open, children }: Props) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const drawerWidth = useMemo(() => (isLargeScreen ? '30vw' : '500px'), [isLargeScreen]);

  return (
    <Drawer
      anchor="right"
      open={open}
      variant="persistent"
      PaperProps={{
        sx: {
          width: drawerWidth,
          borderLeft: `1px solid ${theme.palette.divider}`,
          top: 0,
          height: '100%'
        }
      }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>{children}</Card>
    </Drawer>
  );
});

PosCartDrawer.displayName = 'PosCartDrawer';

export default PosCartDrawer;
