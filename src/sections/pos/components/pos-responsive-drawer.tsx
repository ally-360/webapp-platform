import React from 'react';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import { SxProps, Theme, useMediaQuery, useTheme } from '@mui/material';
import { useDrawerWidth, DRAWER_WIDTH_CONFIG, DrawerBreakpoint, DrawerWidthConfig } from '../hooks/useDrawerWidth';

export type { DrawerBreakpoint, DrawerWidthConfig } from '../hooks/useDrawerWidth';

interface Props {
  open: boolean;
  onClose: () => void;
  anchor?: DrawerProps['anchor'];
  children: React.ReactNode;
  persistentBreakpoint?: Exclude<DrawerBreakpoint, 'xs'>; // desde este breakpoint será 'persistent'
  width?: DrawerWidthConfig; // configuración de ancho por breakpoint
  paperSx?: SxProps<Theme>; // estilos extra para el Paper
}

export default function PosResponsiveDrawer({
  open,
  onClose,
  anchor = 'right',
  children,
  persistentBreakpoint = 'md',
  width,
  paperSx
}: Props) {
  const theme = useTheme();
  const { drawerWidth, isDrawerPersistent } = useDrawerWidth(persistentBreakpoint, width);

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      variant={isDrawerPersistent ? 'persistent' : 'temporary'}
      PaperProps={{
        sx: {
          width: drawerWidth,
          top: 0,
          height: '100%',
          borderLeft: (t: Theme) => `1px solid ${t.palette.divider}`,
          ...paperSx
        }
      }}
    >
      {children}
    </Drawer>
  );
}
