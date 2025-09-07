import React from 'react';
// @mui
import { Box, Card, Stack, Typography, Avatar, LinearProgress, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
// icons
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AIStatsWidget() {
  const theme = useTheme();

  const aiStats = [
    {
      label: 'Consultas Respondidas',
      value: '1,247',
      growth: '+23%',
      icon: 'material-symbols:chat',
      color: theme.palette.primary.main,
    },
    {
      label: 'Insights Generados',
      value: '89',
      growth: '+15%',
      icon: 'material-symbols:lightbulb',
      color: theme.palette.info.main,
    },
    {
      label: 'Decisiones Optimizadas',
      value: '34',
      growth: '+41%',
      icon: 'material-symbols:trending-up',
      color: theme.palette.success.main,
    },
    {
      label: 'Tiempo Ahorrado',
      value: '127h',
      growth: '+28%',
      icon: 'material-symbols:schedule',
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Card
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.info.main, 0.05)})`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -30,
          right: -30,
          width: 60,
          height: 60,
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
          borderRadius: '50%',
        },
      }}
    >
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
              color: 'common.white',
            }}
          >
            <Iconify icon="hugeicons:ai-brain-04" width={24} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Ally IA - Estadísticas
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Impacto de la inteligencia artificial en tu negocio
            </Typography>
          </Box>
        </Stack>

        {/* Stats Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr 1fr',
              sm: '1fr 1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {aiStats.map((stat, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(stat.color, 0.1),
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha(stat.color, 0.2)}`,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: alpha(stat.color, 0.2),
                  color: stat.color,
                  mb: 1,
                  mx: 'auto',
                }}
              >
                <Iconify icon={stat.icon} width={20} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                {stat.label}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                {stat.growth}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Progress Indicators */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Eficiencia de IA
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
              94%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={94}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Quick Access */}
        <Box
          sx={{
            p: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            borderRadius: 2,
            border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
            textAlign: 'center',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Iconify icon="material-symbols:chat" width={20} color={theme.palette.info.main} />
            <Typography variant="body2" sx={{ color: 'info.main', fontWeight: 600 }}>
              Pregúntale a Ally IA sobre estos datos
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
