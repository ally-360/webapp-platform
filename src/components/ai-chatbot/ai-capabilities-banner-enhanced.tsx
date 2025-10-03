import React from 'react';
// @mui
import { Box, Card, Stack, Typography, Avatar, Button, useTheme } from '@mui/material';
import { keyframes } from '@mui/material/styles';
// components
import Iconify from '../iconify';

// Enhanced animations
const gradientFlow = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

const floatGently = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
`;

const shimmerEffect = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 176, 240, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 176, 240, 0.4);
  }
`;

// ----------------------------------------------------------------------

const aiCapabilities = [
  {
    icon: 'ph:chart-line-up-duotone',
    title: 'Análisis Predictivo',
    description: 'Predice tendencias y patrones de tu negocio',
    color: '#FF6B6B'
  },
  {
    icon: 'ph:robot-duotone',
    title: 'Asistente Inteligente',
    description: 'Respuestas instantáneas a tus consultas',
    color: '#4ECDC4'
  },
  {
    icon: 'ph:lightbulb-duotone',
    title: 'Insights Automáticos',
    description: 'Recomendaciones personalizadas en tiempo real',
    color: '#45B7D1'
  },
  {
    icon: 'ph:brain-duotone',
    title: 'Machine Learning',
    description: 'Aprendizaje continuo de tus datos',
    color: '#96CEB4'
  }
];

interface AICapabilitiesBannerEnhancedProps {
  onChatClick?: () => void;
}

export default function AICapabilitiesBannerEnhanced({ onChatClick }: AICapabilitiesBannerEnhancedProps) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        position: 'relative',
        p: 4,
        background: `linear-gradient(135deg, 
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.05) 50%,
          rgba(255, 255, 255, 0.02) 100%)`,
        backdropFilter: 'blur(40px)',
        borderRadius: 4,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, 
            transparent 30%, 
            rgba(255, 255, 255, 0.05) 50%, 
            transparent 70%)`,
          animation: `${shimmerEffect} 4s ease-in-out infinite`
        }
      }}
    >
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: `linear-gradient(135deg, 
            rgba(0, 176, 240, 0.1) 0%,
            rgba(0, 150, 220, 0.2) 100%)`,
          filter: 'blur(20px)'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, 
            rgba(156, 39, 176, 0.1) 0%,
            rgba(123, 31, 162, 0.2) 100%)`,
          filter: 'blur(15px)'
        }}
      />

      <Stack spacing={4} position="relative" zIndex={1}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, 
                rgba(0, 176, 240, 0.2) 0%,
                rgba(0, 150, 220, 0.4) 50%,
                rgba(0, 120, 200, 0.6) 100%)`,
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#4CAF50',
                border: '3px solid white'
              }
            }}
          >
            <Iconify icon="ph:sparkle-duotone" width={32} sx={{ color: 'white' }} />
          </Avatar>

          <Box flex={1}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 0.5
              }}
            >
              🚀 Potencia tu negocio con IA
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              Descubre las capacidades avanzadas de inteligencia artificial
            </Typography>
          </Box>
        </Stack>

        {/* Capabilities Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          {aiCapabilities.map((capability, index) => (
            <Box
              key={capability.title}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.08) 0%,
                  rgba(255, 255, 255, 0.04) 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.15) 0%,
                    rgba(255, 255, 255, 0.08) 100%)`,
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  '&::before': {
                    opacity: 1
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, 
                    ${capability.color}15 0%,
                    ${capability.color}25 100%)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }
              }}
            >
              <Stack spacing={1.5} position="relative" zIndex={1}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: `linear-gradient(135deg, 
                      ${capability.color}20 0%,
                      ${capability.color}40 100%)`,
                    border: `2px solid ${capability.color}30`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Iconify icon={capability.icon} width={24} sx={{ color: capability.color }} />
                </Avatar>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 0.5
                    }}
                  >
                    {capability.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      lineHeight: 1.4,
                      fontSize: '0.75rem'
                    }}
                  >
                    {capability.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>

        {/* Call to Action */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, 
              rgba(0, 176, 240, 0.1) 0%,
              rgba(0, 150, 220, 0.15) 100%)`,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 176, 240, 0.2)'
          }}
        >
          <Box flex={1}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              💬 ¡Comienza a chatear ahora!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                opacity: 0.8
              }}
            >
              Haz tu primera consulta y descubre el poder de la IA
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={onChatClick}
            startIcon={<Iconify icon="ph:chat-circle-duotone" width={20} />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, 
                rgba(0, 176, 240, 0.9) 0%,
                rgba(0, 150, 220, 1) 100%)`,
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 176, 240, 0.3)',
              fontWeight: 700,
              fontSize: '0.95rem',
              textTransform: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                background: `linear-gradient(135deg, 
                  rgba(0, 176, 240, 1) 0%,
                  rgba(0, 130, 200, 1) 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(0, 176, 240, 0.4)'
              },
              '&:active': {
                transform: 'translateY(0px)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, 
                  transparent 0%,
                  rgba(255, 255, 255, 0.2) 50%,
                  transparent 100%)`
              }
            }}
          >
            Empezar Chat
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
