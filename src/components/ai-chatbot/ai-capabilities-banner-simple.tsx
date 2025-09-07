import React from 'react';
// @mui
import { Box, Card, Stack, Typography, Avatar, useTheme, Fade, Zoom } from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
// icons
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

// Animations
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 20px rgba(0, 176, 240, 0.2); }
  50% { box-shadow: 0 0 30px rgba(0, 176, 240, 0.4); }
  100% { box-shadow: 0 0 20px rgba(0, 176, 240, 0.2); }
`;

const pulseAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const aiCapabilities = [
  {
    icon: 'material-symbols:analytics',
    title: 'Análisis Inteligente',
    description: 'Genero insights profundos analizando múltiples variables de tu negocio',
  },
  {
    icon: 'material-symbols:inventory',
    title: 'Gestión de Inventario',
    description: 'Te ayudo a optimizar tu stock e identificar productos con baja rotación',
  },
  {
    icon: 'material-symbols:trending-up',
    title: 'Predicciones de Ventas',
    description: 'Analizo patrones históricos para predecir tendencias futuras',
  },
  {
    icon: 'material-symbols:recommend',
    title: 'Recomendaciones Personalizadas',
    description: 'Sugiero estrategias específicas basadas en los datos de tu empresa',
  },
];

// ----------------------------------------------------------------------

export default function AICapabilitiesBanner() {
  const theme = useTheme();

  return (
    <Card
      sx={{
        position: 'relative',
        p: 4,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 176, 240, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.1) 0%, rgba(0, 76, 151, 0.1) 100%)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 200,
          height: 200,
          background: 'radial-gradient(circle, rgba(0, 176, 240, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0,
          animation: `${floatAnimation} 6s ease-in-out infinite`,
        },
      }}
    >
      <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in={true} timeout={800}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.1) 0%, rgba(0, 76, 151, 0.1) 100%)',
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0, 176, 240, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={3}>
              <Zoom in={true} timeout={1000}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
                    color: 'common.white',
                    animation: `${glowAnimation} 4s ease-in-out infinite`,
                    boxShadow: '0 8px 25px rgba(0, 176, 240, 0.4)',
                  }}
                >
                  <Iconify icon="hugeicons:ai-brain-04" width={36} />
                </Avatar>
              </Zoom>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: '#fff',
                  fontSize: { xs: '1.8rem', md: '2.2rem' },
                  mb: 1,
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}>
                  Ally IA - Asistente Virtual
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                }}>
                  Tu asesor digital inteligente para tomar mejores decisiones de negocio
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  animation: `${pulseAnimation} 2s infinite`,
                  boxShadow: '0 0 15px #4CAF50',
                }}
              />
            </Stack>
          </Box>
        </Fade>

        {/* Capabilities Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: '1fr 1fr 1fr 1fr',
            },
            gap: 3,
          }}
        >
          {aiCapabilities.map((capability, index) => (
            <Fade key={index} in={true} timeout={1000 + index * 200}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(0, 176, 240, 0.3)',
                    transform: 'translateY(-5px) scale(1.02)',
                    boxShadow: '0 15px 35px rgba(0, 176, 240, 0.2)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #00B0F0, #004C97)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.2) 0%, rgba(0, 76, 151, 0.2) 100%)',
                    color: '#00B0F0',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 176, 240, 0.3)',
                    animation: `${floatAnimation} ${4 + index}s ease-in-out infinite`,
                  }}
                >
                  <Iconify icon={capability.icon} width={28} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: '#fff',
                    fontSize: '1.1rem',
                  }}>
                    {capability.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                  }}>
                    {capability.description}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          ))}
        </Box>

        {/* Call to Action */}
        <Fade in={true} timeout={1600}>
          <Box
            sx={{
              textAlign: 'center',
              p: 3,
              background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.1) 0%, rgba(0, 76, 151, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: '1px dashed rgba(0, 176, 240, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent, rgba(0, 176, 240, 0.05), transparent)',
                animation: `${glowAnimation} 3s ease-in-out infinite`,
              },
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #00B0F0, #004C97)',
                  animation: `${pulseAnimation} 2s infinite`,
                }}
              >
                <Iconify icon="material-symbols:chat" width={20} />
              </Avatar>
              <Typography variant="body1" sx={{ 
                color: '#00B0F0', 
                fontWeight: 600,
                fontSize: '1.1rem',
              }}>
                ¡Haz clic en el asistente flotante para empezar a chatear con Ally IA!
              </Typography>
            </Stack>
          </Box>
        </Fade>
      </Stack>
    </Card>
  );
}
