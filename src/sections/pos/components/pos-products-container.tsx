import React, { memo, useMemo } from 'react';
// @mui
import { Grid, useTheme, useMediaQuery } from '@mui/material';

interface Props {
  openDrawer: boolean;
  children: React.ReactNode;
}

const PosProductsContainer = memo(({ openDrawer, children }: Props) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';

  const containerWidth = useMemo(() => {
    if (!openDrawer) return '100%';
    return isLargeScreen ? `calc(100% - ${drawerWidthLg}) !important` : `calc(100% - ${drawerWidth}) !important`;
  }, [openDrawer, isLargeScreen]);

  return (
    <Grid
      item
      xs={12}
      sx={{
        width: containerWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        })
      }}
    >
      {children}
    </Grid>
  );
});

PosProductsContainer.displayName = 'PosProductsContainer';

export default PosProductsContainer;
