/* eslint-disable import/no-duplicates */

import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';

// Components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// API
import { useVoidMovementMutation } from 'src/redux/services/treasuryApi';

// Types
import type { TreasuryMovement } from 'src/sections/treasury/types';

// Notifications
import { enqueueSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
  movement: TreasuryMovement | null;
};

type FormValues = {
  reason: string;
};

// ----------------------------------------------------------------------

export default function VoidMovementDialog({ open, onClose, onSuccess, movement }: Props) {
  // RTK Query hooks
  const [voidMovement, { isLoading: isVoiding }] = useVoidMovementMutation();

  // Validation schema
  const VoidSchema = Yup.object().shape({
    reason: Yup.string()
      .required('El motivo es requerido')
      .min(10, 'Mínimo 10 caracteres')
      .max(500, 'Máximo 500 caracteres')
  });

  // Form methods
  const methods = useForm<FormValues>({
    resolver: yupResolver(VoidSchema),
    defaultValues: {
      reason: ''
    }
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // Submit handler
  const onSubmit = handleSubmit(async (data) => {
    if (!movement) return;

    try {
      await voidMovement({
        id: movement.id,
        reason: data.reason
      }).unwrap();

      enqueueSnackbar('Movimiento anulado correctamente', { variant: 'success' });

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error voiding movement:', error);

      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al anular el movimiento';

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!movement) return null;

  const isLoading = isVoiding;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:close-circle-bold-duotone" width={24} sx={{ color: 'error.main' }} />
          <Typography variant="h6">Anular Movimiento</Typography>
        </Stack>
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Warning alert */}
            <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />}>
              <Typography variant="subtitle2" gutterBottom>
                ¿Estás seguro de anular este movimiento?
              </Typography>
              <Typography variant="body2">
                Esta acción revertirá el saldo de la cuenta afectada. El movimiento quedará marcado como anulado y no
                podrá reactivarse.
              </Typography>
            </Alert>

            {/* Movement details */}
            <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Fecha:
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {format(new Date(movement.movement_date), 'dd/MM/yyyy', { locale: es })}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tipo:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={movement.movement_type === 'inflow' ? 'success.main' : 'error.main'}
                >
                  {movement.movement_type === 'inflow' ? 'Entrada' : 'Salida'}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Monto:
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  color={movement.movement_type === 'inflow' ? 'success.main' : 'error.main'}
                >
                  {movement.movement_type === 'inflow' ? '+' : '-'} {fCurrency(parseFloat(movement.amount))}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Descripción:
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 300 }} textAlign="right">
                  {movement.description || '-'}
                </Typography>
              </Stack>
            </Stack>

            {/* Reason */}
            <RHFTextField
              name="reason"
              label="Motivo de la Anulación"
              placeholder="Ej: Error en el registro, Movimiento duplicado, Corrección contable..."
              disabled={isLoading}
              required
              multiline
              rows={4}
              helperText="Explica por qué estás anulando este movimiento"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={handleClose} disabled={isLoading} color="inherit">
            Cancelar
          </Button>

          <LoadingButton
            type="submit"
            variant="contained"
            color="error"
            loading={isLoading || isSubmitting}
            startIcon={<Iconify icon="solar:close-circle-bold" />}
          >
            Anular Movimiento
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
