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

// types
import type { SellerCreate } from 'src/types/pos';

// hooks
import { useCashRegister } from './hooks';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (seller: { id: string; name: string; email?: string }) => void;
}

export default function CreateSellerDialog({ open, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState<SellerCreate>({
    name: '',
    email: '',
    phone: '',
    document: '',
    commission_rate: 0,
    base_salary: 0,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleCreateSeller } = useCashRegister();

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        document: '',
        commission_rate: 0,
        base_salary: 0,
        notes: ''
      });
      setError(null);
    }
  }, [open]);

  const handleInputChange = (field: keyof SellerCreate) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'commission_rate' || field === 'base_salary' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
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

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await handleCreateSeller(formData);

      if (result.success && result.data) {
        onSuccess({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email
        });
        handleClose();
      } else {
        setError(result.error || 'Error al crear el vendedor');
      }
    } catch (err) {
      setError('Error inesperado al crear el vendedor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const canSubmit = formData.name.trim() && !isSubmitting;

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
          <Icon icon="mdi:account-plus" width={28} height={28} />
          <Box>
            <Typography variant="h6" component="div">
              Crear Nuevo Vendedor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete la información del vendedor
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Información básica */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:account-circle" />
              Información Personal
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre completo *"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Ej: Juan Pérez"
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
            />
          </Grid>

          <Grid item xs={12} md={6}>
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

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Documento"
              value={formData.document}
              onChange={handleInputChange('document')}
              placeholder="Ej: 12345678"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:card-account-details" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* Información laboral */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon="mdi:currency-usd" />
              Información Laboral
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
          startIcon={isSubmitting ? <Icon icon="mdi:loading" className="animate-spin" /> : <Icon icon="mdi:check" />}
        >
          {isSubmitting ? 'Creando...' : 'Crear Vendedor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
