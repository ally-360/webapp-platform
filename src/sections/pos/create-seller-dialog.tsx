import React, { useState } from 'react';
// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  InputAdornment,
  Grid,
  Stack,
  Alert
} from '@mui/material';
import { Icon } from '@iconify/react';
import { enqueueSnackbar } from 'notistack';

// types
import type { SellerInvite } from 'src/types/pos';

// hooks
import { useInviteSellerMutation } from 'src/redux/services/posApi';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateSellerDialog({ open, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<SellerInvite>({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    commission_rate: 0,
    base_salary: 0,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  const [inviteSeller, { isLoading: isSubmitting }] = useInviteSellerMutation();

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        commission_rate: 0,
        base_salary: 0,
        notes: ''
      });
      setError(null);
    }
  }, [open]);

  const handleInputChange = (field: keyof SellerInvite) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'commission_rate' || field === 'base_salary' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!formData.first_name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.last_name.trim()) {
      setError('El apellido es requerido');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(formData.email)) {
      setError('El email no tiene un formato válido');
      return;
    }

    if ((formData.commission_rate ?? 0) < 0 || (formData.commission_rate ?? 0) > 1) {
      setError('La tasa de comisión debe estar entre 0 y 1');
      return;
    }

    if ((formData.base_salary ?? 0) < 0) {
      setError('El salario base no puede ser negativo');
      return;
    }

    setError(null);

    try {
      const result = await inviteSeller(formData).unwrap();

      enqueueSnackbar(result.message || 'Invitación enviada exitosamente', {
        variant: 'success',
        autoHideDuration: 5000
      });

      if (result.note) {
        enqueueSnackbar(result.note, {
          variant: 'info',
          autoHideDuration: 8000
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err: any) {
      console.error('Error inviting seller:', err);
      const message = err?.data?.detail || 'Error al enviar la invitación';
      setError(message);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const canSubmit = formData.email.trim() && formData.first_name.trim() && formData.last_name.trim() && !isSubmitting;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Icon icon="mdi:email-send" width={28} height={28} />
          <Box>
            <Typography variant="h6" component="div">
              Invitar Nuevo Vendedor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              El vendedor recibirá una invitación por email
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Info Alert */}
          <Grid item xs={12}>
            <Alert severity="info" icon={<Icon icon="mdi:information" />}>
              <Typography variant="body2">
                El vendedor recibirá un email de invitación para unirse a tu empresa. Una vez aceptada, aparecerá
                automáticamente en la lista de vendedores.
              </Typography>
            </Alert>
          </Grid>

          {/* Información básica */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:account-circle" />
              Información Personal
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="vendedor@empresa.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:email" />
                  </InputAdornment>
                )
              }}
              helperText="El vendedor recibirá la invitación en este email"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nombre"
              value={formData.first_name}
              onChange={handleInputChange('first_name')}
              placeholder="Ej: Juan"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:account" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Apellido"
              value={formData.last_name}
              onChange={handleInputChange('last_name')}
              placeholder="Ej: Pérez"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:account" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Teléfono"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              placeholder="Ej: +57 300 123 4567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:phone" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Información laboral */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:currency-usd" />
              Configuración POS (Opcional)
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tasa de comisión"
              type="number"
              value={formData.commission_rate}
              onChange={handleInputChange('commission_rate')}
              placeholder="0.05"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:percent" />
                  </InputAdornment>
                )
              }}
              inputProps={{
                min: 0,
                max: 1,
                step: 0.01
              }}
              helperText="Valor entre 0 y 1 (ej: 0.05 = 5%)"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Salario base"
              type="number"
              value={formData.base_salary}
              onChange={handleInputChange('base_salary')}
              placeholder="1000000"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:currency-usd" />
                  </InputAdornment>
                )
              }}
              inputProps={{
                min: 0,
                step: 10000
              }}
              helperText="Salario mensual en COP"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notas adicionales"
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="Información adicional sobre el vendedor..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <Icon icon="mdi:note-text" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Warning Alert */}
          <Grid item xs={12}>
            <Alert severity="warning" icon={<Icon icon="mdi:alert" />}>
              <Typography variant="caption">
                <strong>Nota técnica:</strong> El envío de email está pendiente de implementación. Por ahora, debes
                agregar manualmente al usuario o notificarle por otros medios.
              </Typography>
            </Alert>
          </Grid>
        </Grid>

        {/* Error alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          size="large"
          disabled={isSubmitting}
          startIcon={<Icon icon="mdi:close" />}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="large"
          startIcon={isSubmitting ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:send" />}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Invitación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
