import { useCallback } from 'react';
import { Button, Card, Divider, Grid, Typography, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useAppDispatch } from 'src/hooks/store';
import { setStep } from 'src/redux/inventory/stepByStepSlice';

/**
 * Renderiza un bloque de información con título y contenido.
 */
function InfoBlock({ title, value }: { title: string; value?: string | number }) {
  return (
    <Grid item xs={12} md={4}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" gutterBottom>
        {value || '-'}
      </Typography>
    </Grid>
  );
}

/**
 * Componente resumen del registro para empresa y PDV principal.
 */
export default function RegisterSummary() {
  const { updateProfile, company, pdvCompany, user } = useAuthContext();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleFinish = useCallback(async () => {
    try {
      await updateProfile(user.id, { firstLogin: false });
      enqueueSnackbar('Registro completado', { variant: 'success' });
      navigate(paths.dashboard.root);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al registrar', { variant: 'error' });
    }
  }, [updateProfile, user.id, enqueueSnackbar, navigate]);

  const handleBack = () => {
    dispatch(setStep(1));
  };

  const pdv = Array.isArray(pdvCompany) ? pdvCompany[0] : pdvCompany;

  return (
    <Stack spacing={3} sx={{ mt: 2 }}>
      <Card sx={{ p: 3 }}>
        <Typography variant="h5">Información de la empresa</Typography>
        <Divider sx={{ mb: 3, mt: 0.5 }} />
        <Grid container spacing={2}>
          <InfoBlock title="Nombre" value={company?.name} />
          <InfoBlock title="NIT" value={company?.nit} />
          <InfoBlock title="Dirección" value={company?.address} />
          <InfoBlock title="Teléfono" value={company?.phoneNumber} />
          <InfoBlock title="Cantidad de empleados" value={company?.quantityEmployees} />
        </Grid>
      </Card>

      {pdv && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h5">Punto de venta principal</Typography>
          <Divider sx={{ mb: 3, mt: 0.5 }} />
          <Grid container spacing={2}>
            <InfoBlock title="Nombre" value={pdv.name} />
            <InfoBlock title="Descripción" value={pdv.description} />
            <InfoBlock title="Dirección" value={pdv.address} />
            <InfoBlock title="Teléfono" value={pdv.phoneNumber} />
          </Grid>
        </Card>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button onClick={handleBack} variant="outlined" component="label" color="primary">
          Volver
        </Button>
        <Button onClick={handleFinish} variant="contained" color="primary" fullWidth>
          Finalizar
        </Button>
      </Stack>
    </Stack>
  );
}
