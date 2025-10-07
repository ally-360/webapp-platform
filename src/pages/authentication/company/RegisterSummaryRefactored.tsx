import { useCallback } from 'react';
import { Button, Divider, Grid, Typography, Stack, Box, Alert, Card } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { goToPreviousStep } from 'src/redux/slices/stepByStepSlice';
import { useGetAllPDVsQuery } from 'src/redux/services/authApi';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const companyData = useAppSelector((state) => state.stepByStep.companyData);
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);
  const pdvData = useAppSelector((state) => state.stepByStep.pdvData);
  const pdvResponse = useAppSelector((state) => state.stepByStep.pdvResponse);
  const planData = useAppSelector((state) => state.stepByStep.planData);

  const { data: apiPDVs } = useGetAllPDVsQuery();
  const firstApiPDV = apiPDVs?.pdvs?.[0];

  const handleFinish = useCallback(async () => {
    try {
      if (user?.authId) {
        await updateProfile(user.authId, { firstLogin: false });
      }
      enqueueSnackbar('¡Registro completado exitosamente!', { variant: 'success' });
      navigate(paths.dashboard.root);
    } catch (error) {
      console.error('Error al finalizar el registro:', error);
      enqueueSnackbar('Error al finalizar el registro', { variant: 'error' });
    }
  }, [navigate, enqueueSnackbar, updateProfile, user?.authId]);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" gutterBottom>
        Resumen del Registro
      </Typography>

      <Alert severity="success">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>¡Felicidades! Tu empresa ha sido registrada exitosamente.</Typography>
        </Box>
      </Alert>

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información de la Empresa
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <InfoBlock title="Nombre" value={companyResponse?.name || companyData?.name || company?.name} />
          <InfoBlock title="NIT" value={companyResponse?.nit || companyData?.nit || company?.nit} />
          <InfoBlock title="Teléfono" value={companyResponse?.phone_number || companyData?.phone_number} />
          <InfoBlock title="Dirección" value={companyResponse?.address || companyData?.address || company?.address} />
          <InfoBlock title="Punto de venta único" value={companyResponse?.uniquePDV ? 'Sí' : 'No'} />
        </Grid>
      </Card>

      {(!companyResponse?.uniquePDV || pdvResponse || pdvData || firstApiPDV) &&
        (pdvResponse || pdvData || firstApiPDV || pdvCompany?.[0]) && (
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Punto de Venta Principal
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <InfoBlock
                title="Nombre"
                value={pdvResponse?.name || pdvData?.name || firstApiPDV?.name || pdvCompany?.[0]?.name}
              />
              <InfoBlock
                title="Dirección"
                value={pdvResponse?.address || pdvData?.address || firstApiPDV?.address || pdvCompany?.[0]?.address}
              />
              <InfoBlock
                title="Teléfono"
                value={
                  pdvResponse?.phone_number ||
                  pdvData?.phone_number ||
                  firstApiPDV?.phone_number ||
                  pdvCompany?.[0]?.phone_number
                }
              />
              <InfoBlock title="Principal" value={pdvResponse?.main ? 'Sí' : 'No'} />
              <InfoBlock title="Estado" value={pdvResponse || firstApiPDV ? 'Activo' : '-'} />
            </Grid>
          </Card>
        )}

      {planData && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Plan Seleccionado
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <InfoBlock title="Plan" value={planData.plan_id} />
            <InfoBlock title="Días de prueba" value={planData.trial_days || 0} />
            <InfoBlock title="Renovación automática" value={planData.auto_renewal ? 'Sí' : 'No'} />
          </Grid>
        </Card>
      )}

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={() => dispatch(goToPreviousStep())}>
          Volver
        </Button>
        <Button variant="contained" size="large" sx={{ flexGrow: 1 }} onClick={handleFinish}>
          Finalizar y acceder al dashboard
        </Button>
      </Stack>
    </Stack>
  );
}
