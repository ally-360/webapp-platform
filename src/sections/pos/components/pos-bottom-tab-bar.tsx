import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, IconButton, Typography, Chip, useTheme, useMediaQuery, Tooltip, Fade } from '@mui/material';
import { Icon } from '@iconify/react';
import { SaleWindow } from 'src/redux/pos/posSlice';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check if scroll is needed and update scroll button states
  const updateScrollState = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowScrollButtons(scrollWidth > clientWidth);
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      return () => container.removeEventListener('scroll', updateScrollState);
    }
  }, [salesWindows]);

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const activeTabIndex = salesWindows.findIndex((tab) => tab.id === openTab);
    if (activeTabIndex >= 0) {
      const container = scrollContainerRef.current;
      const tabElements = container.querySelectorAll('[data-tab-button]');
      const activeElement = tabElements[activeTabIndex] as HTMLElement;

      if (activeElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = activeElement.getBoundingClientRect();

        // Check if element is outside visible area
        if (elementRect.right > containerRect.right || elementRect.left < containerRect.left) {
          activeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
      }
    }
  }, [openTab, salesWindows]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.7; // Scroll 70% of visible width
    const newScrollLeft =
      direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const getTabDisplayName = (tab: SaleWindow): string => {
    if (isMobile && tab.name.length > 8) {
      return `${tab.name.substring(0, 6)}...`;
    }
    return tab.name;
  };

  const getTabTooltip = (tab: SaleWindow): string => {
    const productCount = tab.products.length;
    const { total } = tab;
    return `${tab.name}\nProductos: ${productCount}\nTotal: $${total.toLocaleString()}`;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Left scroll button */}
      <Fade in={showScrollButtons && canScrollLeft}>
        <IconButton
          onClick={() => handleScroll('left')}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[4],
            '&:hover': {
              bgcolor: 'action.hover'
            },
            width: 32,
            height: 32
          }}
          size="small"
        >
          <Icon icon="mdi:chevron-left" />
        </IconButton>
      </Fade>

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
          <Tooltip key={tab.id} title={getTabTooltip(tab)} placement="top" arrow>
            <Button
              data-tab-button
              variant={openTab === tab.id ? 'contained' : 'outlined'}
              startIcon={<Icon icon="mdi:cart" />}
              onClick={() => onChangeTab(tab.id)}
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
                      bgcolor: openTab === tab.id ? 'rgba(255,255,255,0.2)' : 'action.hover'
                    }}
                  />
                )}
              </Box>
            </Button>
          </Tooltip>
        ))}

        {/* Add new tab button */}
        <Tooltip title="Crear nueva venta" placement="top" arrow>
          <Box>
            <IconButton
              onClick={onAddTab}
              color="primary"
              disabled={disabled}
              sx={{
                flexShrink: 0,
                bgcolor: 'action.hover',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground'
                }
              }}
            >
              <Icon icon="mdi:plus" />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>

      {/* Right scroll button */}
      <Fade in={showScrollButtons && canScrollRight}>
        <IconButton
          onClick={() => handleScroll('right')}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[4],
            '&:hover': {
              bgcolor: 'action.hover'
            },
            width: 32,
            height: 32
          }}
          size="small"
        >
          <Icon icon="mdi:chevron-right" />
        </IconButton>
      </Fade>

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
