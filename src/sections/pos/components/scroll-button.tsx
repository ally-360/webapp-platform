import React from 'react';
import { IconButton, Fade, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';

interface ScrollButtonProps {
  direction: 'left' | 'right';
  show: boolean;
  canScroll: boolean;
  onScroll: (direction: 'left' | 'right') => void;
}

/**
 * Botón de scroll para el tab bar
 */
const ScrollButton: React.FC<ScrollButtonProps> = ({ direction, show, canScroll, onScroll }) => {
  const theme = useTheme();

  return (
    <Fade in={show && canScroll}>
      <IconButton
        onClick={() => onScroll(direction)}
        sx={{
          position: 'absolute',
          [direction]: 8,
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
        <Icon icon={`mdi:chevron-${direction}`} />
      </IconButton>
    </Fade>
  );
};

export default ScrollButton;
