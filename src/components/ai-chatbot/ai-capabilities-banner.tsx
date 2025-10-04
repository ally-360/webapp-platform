import React from 'react';
// @mui
import { Box, Card, Stack, Typography, Avatar, useTheme } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// icons
import Iconify from 'src/components/iconify';
// mock data
import { aiCapabilities } from 'src/components/ai-chatbot/mock-data';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(
    theme.palette.info.main,
    0.1
  )})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 20,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)}, ${alpha(
      theme.palette.info.main,
      0.03
    )})`,
    zIndex: 0
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
    borderRadius: '50%',
    zIndex: 0
  }
}));

const CapabilityItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderColor: alpha(theme.palette.primary.main, 0.3),
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
  }
}));

// ----------------------------------------------------------------------

export default function AICapabilitiesBanner() {
  const theme = useTheme();

  return (
    <StyledCard>
      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              color: 'common.white'
            }}
          >
            <Iconify icon="hugeicons:ai-brain-04" width={32} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Ally IA - Asistente Virtual
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Tu asesor digital inteligente para tomar mejores decisiones de negocio
            </Typography>
          </Box>
        </Stack>

        {/* Capabilities Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr',
              lg: '1fr 1fr 1fr 1fr'
            },
            gap: 2
          }}
        >
          {aiCapabilities.map((capability, index) => (
            <CapabilityItem key={index}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }}
              >
                <Iconify icon={capability.icon} width={24} />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {capability.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  {capability.description}
                </Typography>
              </Box>
            </CapabilityItem>
          ))}
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            textAlign: 'center',
            p: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
            💬 ¡Haz clic en el asistente flotante para empezar a chatear con Ally IA!
          </Typography>
        </Box>
      </Stack>
    </StyledCard>
  );
}
