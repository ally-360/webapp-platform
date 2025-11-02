import React from 'react';
// @mui
import { useTheme, alpha } from '@mui/material/styles';
import { Typography, Stack } from '@mui/material';
// theme
import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------
interface AppWelcomeProps {
  title: string;
  description: string;
  action: React.ReactNode;
  img?: React.ReactNode;
}
export default function AppWelcome({ title, description, action, img, ...other }: AppWelcomeProps) {
  const theme = useTheme();

  return (
    <Stack
      flexDirection={{ xs: 'column', sm: 'column', md: 'row' }}
      sx={{
        height: { xs: 'auto', sm: 'auto', md: 1 },
        minHeight: { xs: 160, sm: 200, md: 'auto' },
        borderRadius: { xs: 1.5, sm: 2 },
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
            xs: theme.spacing(1.5, 2, 1, 2),
            sm: theme.spacing(2.5, 3, 1.5, 3),
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
            color: 'primary.contrastText',
            fontSize: {
              xs: '1.1rem',
              sm: '1.3rem',
              md: '2rem'
            },
            lineHeight: { xs: 1.3, sm: 1.4, md: 1.2 },
            mb: { xs: 0.5, sm: 1.5, md: 2 },
            fontWeight: { xs: 600, md: 'normal' }
          }}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="primary.contrastText"
            sx={{
              opacity: 0.8,
              mb: { xs: 1.5, sm: 2, md: 3, xl: 5 },
              fontSize: {
                xs: '0.7rem',
                sm: '0.8rem',
                md: '0.875rem'
              },
              display: { xs: description ? 'block' : 'none', sm: 'block' }
            }}
          >
            {description}
          </Typography>
        )}

        {action && (
          <Stack
            sx={{
              '& .MuiButton-root': {
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                py: { xs: 0.8, sm: 1, md: 1.2 },
                px: { xs: 2, sm: 2.5, md: 3 },
                minHeight: { xs: 32, sm: 36, md: 40 }
              }
            }}
          >
            {action}
          </Stack>
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
