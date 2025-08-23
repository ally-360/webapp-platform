import React, { memo } from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import { Typography, Stack, Box, useMediaQuery } from '@mui/material';
// theme
import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------
interface AppWelcomeProps {
  title: string;
  description: string;
  action: React.ReactNode;
  img: React.ReactNode;
}
export default function AppWelcome({ title, description, action, img, ...other }: AppWelcomeProps) {
  const theme = useTheme();

  return (
    <Stack
      flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
      sx={{
        height: { xs: 'auto', sm: 'auto', md: 1 },
        minHeight: { xs: 200, sm: 250, md: 'auto' },
        borderRadius: 2,
        position: 'relative',
        color: 'primary.darker',
        overflow: 'hidden',
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.dark, 0.99),
          endColor: alpha(theme.palette.primary.dark, 0.92),
          imgUrl: '/assets/background/shape-square.svg'
        })
      }}
      {...other}
    >
      <Stack
        flexGrow={1}
        justifyContent="center"
        alignItems={{ xs: 'center', md: 'flex-start' }}
        sx={{
          p: {
            xs: theme.spacing(2, 2, 1, 2),
            sm: theme.spacing(3, 3, 2, 3),
            md: theme.spacing(4)
          },
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        <Typography
          paragraph
          variant="h4"
          sx={{
            whiteSpace: 'pre-line', 
            color: '#04A5D1',
            fontSize: {
              xs: '1.25rem',
              sm: '1.5rem',
              md: '2.125rem'
            },
            mb: { xs: 1, sm: 2, md: 3 }
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            sx={{
              opacity: 0.8,
              maxWidth: { xs: '100%', sm: 300, md: 360 },
              mb: { xs: 2, sm: 2.5, md: 3, xl: 5 },
              fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                md: '0.875rem'
              }
            }}
          >
            {description}
          </Typography>
        )}

        {action && (
          <Stack sx={{ '& .MuiButton-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}>{action}</Stack>
        )}
      </Stack>

      {img && (
        <Stack
          component="span"
          justifyContent="center"
          alignItems="center"
          sx={{
            p: { xs: 2, sm: 3, md: 3 },
            maxWidth: { xs: '100%', sm: 280, md: 360 },
            mx: 'auto',
            display: { xs: 'none', sm: 'flex' } // Ocultar imagen en móviles para ahorrar espacio
          }}
        >
          {img}
        </Stack>
      )}
    </Stack>
  );
}
