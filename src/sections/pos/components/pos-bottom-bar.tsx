import React from 'react';
import { AppBar, useTheme } from '@mui/material';
import PosBottomTabBar from './pos-bottom-tab-bar';

interface PosBottomBarProps {
  salesWindows: any[];
  openTab: number;
  onChangeTab: (value: number) => void;
  onAddTab: () => void;
  isRegisterOpen: boolean;
  computedWidth: string;
}

/**
 * Barra inferior del POS con tabs de ventanas de venta
 *
 * Componente que maneja la barra fija en la parte inferior
 * con las pestañas de las ventanas de venta activas.
 */
const PosBottomBar: React.FC<PosBottomBarProps> = ({
  salesWindows,
  openTab,
  onChangeTab,
  onAddTab,
  isRegisterOpen,
  computedWidth
}) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        background: theme.palette.background.paper,
        left: 0,
        bottom: 0,
        top: 'auto',
        boxShadow: theme.shadows[1],
        width: computedWidth,
        zIndex: 99,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        })
      }}
    >
      <PosBottomTabBar
        salesWindows={salesWindows}
        openTab={openTab}
        onChangeTab={onChangeTab}
        onAddTab={onAddTab}
        disabled={!isRegisterOpen}
      />
    </AppBar>
  );
};

export default PosBottomBar;
