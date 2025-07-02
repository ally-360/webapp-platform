import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
// routes
// components
import Iconify from 'src/components/iconify';
import { useTheme } from '@emotion/react';
// ----------------------------------------------------------------------

export default function PosCartIcon({ rightDrawer, totalItems, ...other }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        right: rightDrawer,
        top: 112,
        zIndex: 999,
        display: 'flex',
        cursor: 'pointer',
        position: 'fixed',
        color: 'text.primary',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        bgcolor: 'background.paper',
        padding: (themee) => themee.spacing(1, 3, 1, 2),
        boxShadow: (themee) => themee.customShadows.dropdown,
        // transition: (theme) => theme.transitions.create(['opacity']),
        '&:hover': { opacity: 0.72 },
        transform: 'translateX(1px)',
        transition: theme.transitions.create('right', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen
        })
      }}
      {...other}
    >
      <Badge showZero badgeContent={totalItems} color="error" max={99}>
        <Iconify icon="solar:cart-3-bold" width={24} />
      </Badge>
    </Box>
  );
}

PosCartIcon.propTypes = {
  totalItems: PropTypes.number
};
