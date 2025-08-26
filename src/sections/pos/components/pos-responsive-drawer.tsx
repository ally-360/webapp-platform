import React from 'react';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import { SxProps, Theme, useMediaQuery, useTheme } from '@mui/material';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type WidthConfig = Partial<Record<Breakpoint, number | string>>;

interface Props {
  open: boolean;
  onClose: () => void;
  anchor?: DrawerProps['anchor'];
  children: React.ReactNode;
  persistentBreakpoint?: Exclude<Breakpoint, 'xs'>; // desde este breakpoint será 'persistent'
  width?: WidthConfig; // configuración de ancho por breakpoint
  paperSx?: SxProps<Theme>; // estilos extra para el Paper
}

const defaultWidth: WidthConfig = {
  xs: '100vw',
  sm: '92vw',
  md: 480,
  lg: '36vw',
  xl: '30vw'
};

export default function PosResponsiveDrawer({
  open,
  onClose,
  anchor = 'right',
  children,
  persistentBreakpoint = 'md',
  width = defaultWidth,
  paperSx
}: Props) {
  const theme = useTheme();

  // Determinar si el drawer debe ser persistente o temporal según breakpoint
  const isPersistent = useMediaQuery(theme.breakpoints.up(persistentBreakpoint));

  // Construir objeto de width con breakpoints de MUI
  const widthSx: SxProps<Theme> = {
    width: {
      xs: width.xs ?? defaultWidth.xs,
      sm: width.sm ?? defaultWidth.sm,
      md: width.md ?? defaultWidth.md,
      lg: width.lg ?? defaultWidth.lg,
      xl: width.xl ?? defaultWidth.xl
    }
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      variant={isPersistent ? 'persistent' : 'temporary'}
      PaperProps={{
        sx: {
          ...widthSx,
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
