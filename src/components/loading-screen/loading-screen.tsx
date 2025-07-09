// @mui
import { CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

// ----------------------------------------------------------------------

export default function LoadingScreen({ sx, ...other }: LoadingScreenProps) {
  return (
    <Box
      sx={{
        px: 5,
        width: 1,
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx
      }}
      {...other}
    >
      <CircularProgress />
    </Box>
  );
}

interface LoadingScreenProps {
  sx?: React.CSSProperties;
}
