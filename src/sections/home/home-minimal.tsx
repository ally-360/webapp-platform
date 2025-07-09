import { m } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// components
import { MotionViewport, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const CARDS = [
  {
    icon: ' /assets/icons/home/ic_make_brand.svg',
    title: 'Control total de tus operaciones',
    description: 'Ventas, compras, inventario y puntos de venta en un solo sistema.'
  },
  {
    icon: ' /assets/icons/home/ic_design.svg',
    title: 'Reportes e indicadores claros',
    description: 'Con información lista para tomar decisiones.'
  },
  {
    icon: ' /assets/icons/home/ic_development.svg',
    title: 'Interfaz intuitiva',
    description: 'Pensada para emprendedores sin experiencia técnica.'
  },
  {
    icon: ' /assets/icons/home/ic_development.svg',
    title: 'Soporte y capacitación',
    description: 'Asistencia personalizada para que tu negocio crezca.'
  }
];

// ----------------------------------------------------------------------

export default function HomeMinimal() {
  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: 10, md: 15 }
      }}
    >
      <Stack
        spacing={3}
        sx={{
          textAlign: 'center',
          mb: { xs: 5, md: 10 }
        }}
      >
        <m.div variants={varFade().inUp}>
          <Typography component="div" variant="overline" sx={{ color: 'text.disabled' }}>
            Ally360
          </Typography>
        </m.div>

        <m.div variants={varFade().inDown}>
          <Typography variant="h2">
            Beneficios
            <br />
          </Typography>
        </m.div>
      </Stack>

      <Box
        gap={{ xs: 3, lg: 5 }}
        display="grid"
        alignItems="center"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(4, 1fr)'
        }}
      >
        {CARDS.map((card, index) => (
          <m.div variants={varFade().inUp} key={card.title}>
            <Card
              sx={{
                textAlign: 'center',
                boxShadow: { md: 'none' },
                bgcolor: 'background.default',
                p: (theme) => theme.spacing(10, 5),
                ...(index < 10 && {
                  boxShadow: (theme) => ({
                    md: `-0px 0px 30px ${
                      theme.palette.mode === 'light'
                        ? alpha(theme.palette.grey[500], 0.16)
                        : alpha(theme.palette.common.black, 0.4)
                    }`
                  })
                })
              }}
            >
              <Box component="img" src={card.icon} alt={card.title} sx={{ mx: 'auto', width: 48, height: 48 }} />

              <Typography variant="h5" sx={{ mt: 8, mb: 2 }}>
                {card.title}
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>{card.description}</Typography>
            </Card>
          </m.div>
        ))}
      </Box>
    </Container>
  );
}
