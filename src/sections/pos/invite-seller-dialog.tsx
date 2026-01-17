import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Stack,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Icon } from '@iconify/react';
import { useForm, Controller } from 'react-hook-form';
import { enqueueSnackbar } from 'notistack';
import { useInviteSellerMutation } from 'src/redux/services/posApi';
import type { SellerInvite } from 'src/types/pos';

interface InviteSellerDialogProps {
  open: boolean;
  onClose: () => void;
}

type FormValues = SellerInvite;

export function InviteSellerDialog({ open, onClose }: InviteSellerDialogProps) {
  const [inviteSeller, { isLoading }] = useInviteSellerMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      commission_rate: 0,
      base_salary: 0,
      notes: ''
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        commission_rate: 0,
        base_salary: 0,
        notes: ''
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await inviteSeller(data).unwrap();

      enqueueSnackbar(result.message || 'Invitación enviada exitosamente', {
        variant: 'success'
      });

      if (result.note) {
        enqueueSnackbar(result.note, {
          variant: 'info',
          autoHideDuration: 8000
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error inviting seller:', error);
      const message = error?.data?.detail || 'Error al enviar la invitación';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Icon icon="mdi:account-plus" width={24} />
          <Typography variant="h6">Invitar Vendedor</Typography>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Info Alert */}
            <Alert severity="info" icon={<Icon icon="mdi:information" />}>
              <Typography variant="subtitle2" gutterBottom>
                Sistema de Invitaciones
              </Typography>
              <Typography variant="body2">
                El vendedor recibirá un email de invitación para unirse a tu empresa. Una vez aceptada, aparecerá en la
                lista de vendedores y podrá acceder al sistema POS.
              </Typography>
            </Alert>

            {/* Información Personal */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      required
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message || 'El vendedor recibirá la invitación en este email'}
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:email" />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: 'El nombre es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre"
                        required
                        fullWidth
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        disabled={isLoading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon icon="mdi:account" />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: 'El apellido es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Apellido"
                        required
                        fullWidth
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Teléfono"
                      placeholder="+57 300 123 4567"
                      fullWidth
                      disabled={isLoading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon icon="mdi:phone" />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Configuración POS */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Configuración POS (Opcional)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="commission_rate"
                    control={control}
                    rules={{
                      min: { value: 0, message: 'Mínimo 0%' },
                      max: { value: 1, message: 'Máximo 100%' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Tasa de Comisión"
                        type="number"
                        fullWidth
                        error={!!errors.commission_rate}
                        helperText={errors.commission_rate?.message || 'Ej: 0.05 = 5%'}
                        disabled={isLoading}
                        inputProps={{ step: 0.01, min: 0, max: 1 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon icon="mdi:percent" />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="base_salary"
                    control={control}
                    rules={{ min: { value: 0, message: 'El salario no puede ser negativo' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Salario Base"
                        type="number"
                        fullWidth
                        error={!!errors.base_salary}
                        helperText={errors.base_salary?.message || 'Salario mensual en COP'}
                        disabled={isLoading}
                        inputProps={{ step: 10000, min: 0 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Icon icon="mdi:currency-usd" />
                            </InputAdornment>
                          )
                        }}
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notas"
                      placeholder="Información adicional sobre el vendedor..."
                      multiline
                      rows={3}
                      fullWidth
                      disabled={isLoading}
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* TODO Alert */}
            <Alert severity="warning" icon={<Icon icon="mdi:alert" />}>
              <Typography variant="caption">
                <strong>Nota técnica:</strong> El envío de email está pendiente de implementación. Por ahora, debes
                agregar manualmente al usuario o notificarle por otros medios.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isLoading} startIcon={<Icon icon="mdi:send" />}>
            Enviar Invitación
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
