import { Card, Typography, Grid, Button, Avatar, Stack, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { companies } from 'src/_mock/business';

// Mock empresas (reemplazar luego por datos reales del backend)

export default function SelectBusinessPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSelect = useCallback(
    async (companyId: string) => {
      try {
        // const newToken = 'mocked-new-token-based-on-company';
        // window.localStorage.setItem('accessToken', newToken);
        enqueueSnackbar('Empresa seleccionada con éxito', { variant: 'success' });
        navigate('/dashboard');
      } catch (err) {
        enqueueSnackbar('Error al seleccionar la empresa', { variant: 'error' });
      }
    },
    [navigate, enqueueSnackbar]
  );

  return (
    <Container maxWidth="md" sx={{ pt: 10 }}>
      <Stack spacing={3} textAlign="center">
        <Typography variant="h4">🏢 Elige con qué empresa deseas trabajar hoy</Typography>
        <Typography variant="body1" color="text.secondary">
          Selecciona una empresa para ingresar al panel de gestión. Cada empresa puede tener configuraciones y datos
          diferentes.
        </Typography>
      </Stack>

      <Grid container spacing={4} mt={3}>
        {companies.map((company) => (
          <Grid item xs={12} md={6} key={company.id}>
            <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar src={company.logo} sx={{ width: 64, height: 64 }} />
              <Typography variant="h6">{company.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                NIT: {company.nit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tel: {company.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {company.address}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                size="small"
                onClick={() => handleSelect(company.id)}
                sx={{ mt: 2 }}
              >
                Seleccionar empresa
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
