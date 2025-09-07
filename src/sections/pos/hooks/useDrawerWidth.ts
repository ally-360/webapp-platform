import { useMemo } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export type DrawerBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DrawerWidthConfig = Partial<Record<DrawerBreakpoint, number | string>>;

// Configuración centralizada de anchos del drawer
export const DRAWER_WIDTH_CONFIG: DrawerWidthConfig = {
  xs: '100vw',
  sm: '92vw',
  md: 480,
  lg: '36vw',
  xl: '30vw'
};

export interface UseDrawerWidthReturn {
  drawerWidth: string | number;
  isDrawerPersistent: boolean;
  computeContentWidth: (isDrawerOpen: boolean) => string;
}

/**
 * Hook centralizado para manejar el ancho del drawer responsive
 * y calcular el ancho del contenido principal de forma consistente
 */
export function useDrawerWidth(
  persistentBreakpoint: Exclude<DrawerBreakpoint, 'xs'> = 'md',
  customWidths?: DrawerWidthConfig
): UseDrawerWidthReturn {
  const theme = useTheme();

  const widthConfig = customWidths || DRAWER_WIDTH_CONFIG;

  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  const isDrawerPersistent = useMediaQuery(theme.breakpoints.up(persistentBreakpoint));

  const drawerWidth = useMemo(() => {
    if (isXl) return widthConfig.xl ?? DRAWER_WIDTH_CONFIG.xl!;
    if (isLg) return widthConfig.lg ?? DRAWER_WIDTH_CONFIG.lg!;
    if (isMd) return widthConfig.md ?? DRAWER_WIDTH_CONFIG.md!;
    if (isSm) return widthConfig.sm ?? DRAWER_WIDTH_CONFIG.sm!;
    return widthConfig.xs ?? DRAWER_WIDTH_CONFIG.xs!;
  }, [isSm, isMd, isLg, isXl, widthConfig]);

  const computeContentWidth = useMemo(
    () =>
      (isDrawerOpen: boolean): string => {
        if (!isDrawerOpen || !isDrawerPersistent) {
          return '100%';
        }

        const width = drawerWidth;
        if (typeof width === 'number') {
          return `calc(100% - ${width}px)`;
        }
        return `calc(100% - ${width})`;
      },
    [drawerWidth, isDrawerPersistent]
  );

  return {
    drawerWidth,
    isDrawerPersistent,
    computeContentWidth
  };
}
