import { Backdrop, CircularProgress, Typography, Stack, Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface CompanyChangeLoadingProps {
  open: boolean;
  companyName?: string;
}

export default function CompanyChangeLoading({ open, companyName }: CompanyChangeLoadingProps) {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (thm) => thm.zIndex.modal + 1,
        backdropFilter: 'blur(6px)',
        backgroundColor: alpha(theme.palette.background.default, 0.8)
      }}
      open={open}
    >
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
            position: 'relative'
          }}
        >
          <CircularProgress
            size={100}
            thickness={2}
            sx={{
              position: 'absolute',
              color: theme.palette.primary.light,
              animationDuration: '550ms'
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'white',
              fontSize: '1.2rem'
            }}
          >
            🏢
          </Typography>
        </Box>

        <Stack spacing={1} alignItems="center">
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            Cambiando empresa...
          </Typography>

          {companyName && (
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 400
              }}
            >
              Configurando <strong>{companyName}</strong>
            </Typography>
          )}

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: 400,
              mt: 1
            }}
          >
            Limpiando datos previos y cargando nueva configuración...
          </Typography>
        </Stack>
      </Stack>
    </Backdrop>
  );
}
