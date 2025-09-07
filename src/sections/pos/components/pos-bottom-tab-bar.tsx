import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { type SaleWindow } from 'src/redux/pos/posSlice';
import { useScrollState, useAutoScroll } from '../hooks';
import ScrollButton from './scroll-button';
import TabButton from './tab-button';
import AddTabButton from './add-tab-button';

interface Props {
  salesWindows: SaleWindow[];
  openTab: number;
  onChangeTab: (tabId: number) => void;
  onAddTab: () => void;
  disabled?: boolean;
}

export default function PosBottomTabBar({ salesWindows, openTab, onChangeTab, onAddTab, disabled = false }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Custom hooks
  const { scrollContainerRef, showScrollButtons, canScrollLeft, canScrollRight, handleScroll } =
    useScrollState(salesWindows);
  useAutoScroll(openTab, salesWindows, scrollContainerRef);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Left scroll button */}
      <ScrollButton direction="left" show={showScrollButtons} canScroll={canScrollLeft} onScroll={handleScroll} />

      {/* Scrollable tabs container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: showScrollButtons ? 6 : 2,
          py: 1.5,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          // Smooth scroll behavior
          scrollBehavior: 'smooth'
        }}
      >
        {salesWindows.map((tab) => (
          <TabButton key={tab.id} tab={tab} isActive={openTab === tab.id} onClick={onChangeTab} />
        ))}

        {/* Add new tab button */}
        <AddTabButton onAdd={onAddTab} disabled={disabled} />
      </Box>

      {/* Right scroll button */}
      <ScrollButton direction="right" show={showScrollButtons} canScroll={canScrollRight} onScroll={handleScroll} />

      {/* Tab count indicator for mobile */}
      {isMobile && salesWindows.length > 3 && (
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            zIndex: 1
          }}
        >
          {salesWindows.length}
        </Box>
      )}
    </Box>
  );
}
