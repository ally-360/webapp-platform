import React, { memo, useCallback } from 'react';
// @mui
import {
  Card,
  Typography,
  Grid,
  Button,
  Avatar,
  Stack,
  Container,
  Box,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Fade,
  Grow,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// theme
import { bgGradient } from 'src/theme/css';
// components
import Iconify from 'src/components/iconify';
// auth
import { useAuthContext } from 'src/auth/hooks/use-auth-context';
import { useGetMyCompaniesQuery } from 'src/redux/services/authApi';

// ----------------------------------------------------------------------

interface Company {
  id: string;
  name: string;
  nit: string;
  phone_number: string;
  address?: string | null;
  logo?: string | null;
}

// ----------------------------------------------------------------------

const CompanyCard = memo(
  ({
    company,
    onSelect,
    index,
    isSelecting
  }: {
    company: Company;
    onSelect: (id: string) => void;
    index: number;
    isSelecting: boolean;
  }) => {
    const theme = useTheme();

    return (
      <Grow in timeout={300 + index * 150}>
        <Card
          sx={{
            p: 4,
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            border: '2px solid transparent',
            ...bgGradient({
              direction: '135deg',
              startColor: alpha(theme.palette.grey[100], 0.9),
              endColor: alpha(theme.palette.grey[200], 0.9)
            }),
            '&:hover': {
              transform: 'translateY(-8px), scale(1.05)',
              borderColor: theme.palette.primary.main,
              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`
            }
          }}
          onClick={() => onSelect(company.id)}
        >
          <Stack spacing={3} alignItems="center" sx={{ height: '100%' }}>
            {/* Logo/Avatar Section */}
            <Box sx={{ position: 'relative' }}>
              <Tooltip title={`Logo de ${company.name}`} placement="top">
                <Avatar
                  src={company.logo || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  {company.name.charAt(0)}
                </Avatar>
              </Tooltip>
              <Tooltip title="Empresa verificada y activa" placement="top">
                <Box
                  sx={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                        transform: 'scale(1)'
                      },
                      '50%': {
                        boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.6)}`,
                        transform: 'scale(1.05)'
                      },
                      '100%': {
                        boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                        transform: 'scale(1)'
                      }
                    }
                  }}
                >
                  <Iconify icon="eva:checkmark-fill" width={14} sx={{ color: 'white' }} />
                </Box>
              </Tooltip>
            </Box>

            {/* Company Info */}
            <Stack spacing={2} alignItems="center" sx={{ flex: 1, textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {company.name}
              </Typography>

              <Stack spacing={1} alignItems="center">
                <Chip
                  icon={<Iconify icon="mdi:card-account-details" width={16} />}
                  label={`NIT: ${company.nit}`}
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{
                    '& .MuiChip-icon': {
                      color: theme.palette.primary.main
                    },
                    fontSize: '0.75rem',
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="eva:phone-fill" width={14} sx={{ color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {company.phone_number}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Iconify icon="eva:pin-fill" width={14} sx={{ color: theme.palette.text.secondary }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.8rem',
                      textAlign: 'center',
                      lineHeight: 1.4
                    }}
                  >
                    {company.address || 'Sin dirección'}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* Action Button */}
            <Button
              fullWidth
              variant="contained"
              size="medium"
              disabled={isSelecting}
              startIcon={
                isSelecting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Iconify icon="eva:arrow-forward-fill" width={18} />
                )
              }
              sx={{
                mt: 'auto',
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha(
                    theme.palette.common.white,
                    0.1
                  )}, transparent)`,
                  transition: 'left 0.6s'
                },
                '&:hover:not(:disabled)': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  '&:before': {
                    left: '100%'
                  }
                },
                '&:disabled': {
                  opacity: 0.7,
                  cursor: 'not-allowed'
                }
              }}
            >
              {isSelecting ? 'Seleccionando...' : 'Seleccionar empresa'}
            </Button>
          </Stack>
        </Card>
      </Grow>
    );
  }
);

// ----------------------------------------------------------------------

export default function SelectBusinessPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { selectCompany, changingCompany } = useAuthContext();
  const { data: userCompanies = [] } = useGetMyCompaniesQuery();
  const theme = useTheme();

  const handleSelect = useCallback(
    async (companyId: string) => {
      if (changingCompany) return;

      try {
        enqueueSnackbar('Cambiando empresa...', { variant: 'info' });
        await selectCompany(companyId);
        enqueueSnackbar('Empresa seleccionada con éxito', { variant: 'success' });

        // Navegar al dashboard después del cambio exitoso
        navigate('/dashboard');
      } catch (err) {
        enqueueSnackbar('Error al seleccionar la empresa', { variant: 'error' });
      }
    },
    [selectCompany, enqueueSnackbar, changingCompany, navigate]
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.dark, 0),
          endColor: alpha(theme.palette.primary.dark, 0),
          imgUrl: '/logo/Background.svg'
        })
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          py: { xs: 8, sm: 10, md: 12 }
        }}
      >
        <Fade in timeout={800}>
          <Stack spacing={{ xs: 4, sm: 6 }} alignItems="center">
            {/* Header Section */}
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                  mb: 2
                }}
              >
                <Iconify icon="solar:buildings-2-bold-duotone" width={40} sx={{ color: 'white' }} />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: 'white',
                  textShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.2)}`,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                Selecciona tu empresa
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: alpha(theme.palette.common.white, 0.8),
                  maxWidth: 600,
                  lineHeight: 1.6,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Elige la empresa con la que deseas trabajar hoy. Cada empresa tiene configuraciones y datos únicos para
                una gestión personalizada.
              </Typography>

              <Chip
                label={`${userCompanies.length} empresas disponibles`}
                variant="outlined"
                color="primary"
                icon={<Iconify icon="eva:grid-fill" width={16} />}
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  color: theme.palette.common.white,
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.common.white, 0.3),
                  '& .MuiChip-icon': {
                    color: theme.palette.common.white
                  }
                }}
              />
            </Stack>

            {/* Companies Grid */}
            <Grid container spacing={{ xs: 3, sm: 4 }} justifyContent="center">
              {userCompanies.map((company, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
                  <CompanyCard company={company} onSelect={handleSelect} index={index} isSelecting={changingCompany} />
                </Grid>
              ))}
            </Grid>

            {/* Footer Actions */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ pt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
                onClick={() => navigate('/')}
                sx={{
                  color: 'white',
                  borderColor: alpha(theme.palette.common.white, 0.3),
                  minWidth: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: theme.palette.common.white,
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                Volver al inicio
              </Button>

              <Tooltip title="¿Necesitas ayuda? Contáctanos" placement="top">
                <IconButton
                  sx={{
                    color: alpha(theme.palette.common.white, 0.7),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: theme.palette.common.white,
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <Iconify icon="eva:question-mark-circle-fill" width={24} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Fade>
      </Container>
    </Box>
  );
}
