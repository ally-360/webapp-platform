import { useEffect } from 'react';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  MenuItem,
  Typography,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Components
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// API
import { useCreateMovementMutation } from 'src/redux/services/treasuryApi';

// Types
import type { CreateMovementPayload, MovementType } from 'src/sections/treasury/types';

// Notifications
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
  accounts: Array<{ id: string; name: string; type: string }>;
};

type FormValues = {
  treasury_account_id: string;
  movement_type: MovementType;
  movement_date: Date | null;
  amount: string;
  description: string;
  source_reference: string;
};

const MOVEMENT_TYPE_OPTIONS = [
  { value: 'inflow', label: 'Entrada de Dinero', icon: 'solar:arrow-down-bold', color: 'success.main' },
  { value: 'outflow', label: 'Salida de Dinero', icon: 'solar:arrow-up-bold', color: 'error.main' }
];

// ----------------------------------------------------------------------

export default function MovementForm({ open, onClose, onSuccess, accounts }: Props) {
  // RTK Query hooks
  const [createMovement, { isLoading: isCreating }] = useCreateMovementMutation();

  // Validation schema
  const MovementSchema = Yup.object().shape({
    treasury_account_id: Yup.string().required('La cuenta es requerida'),
    movement_type: Yup.string().oneOf(['inflow', 'outflow'], 'Tipo inválido').required('El tipo es requerido'),
    movement_date: Yup.date().required('La fecha es requerida').nullable(),
    amount: Yup.string()
      .required('El monto es requerido')
      .test('is-positive', 'El monto debe ser mayor a 0', (value) => {
        if (!value) return false;
        const numValue = parseFloat(value);
        return !Number.isNaN(numValue) && numValue > 0;
      }),
    description: Yup.string().required('La descripción es requerida').max(500, 'Máximo 500 caracteres'),
    source_reference: Yup.string().max(100, 'Máximo 100 caracteres').default('')
  });

  // Form methods
  const methods = useForm<FormValues>({
    resolver: yupResolver(MovementSchema),
    defaultValues: {
      treasury_account_id: '',
      movement_type: 'inflow',
      movement_date: new Date(),
      amount: '',
      description: '',
      source_reference: ''
    }
  });

  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        treasury_account_id: '',
        movement_type: 'inflow',
        movement_date: new Date(),
        amount: '',
        description: '',
        source_reference: ''
      });
    }
  }, [open, reset]);

  // Submit handler
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: CreateMovementPayload = {
        treasury_account_id: data.treasury_account_id,
        movement_type: data.movement_type,
        movement_date: data.movement_date!.toISOString().split('T')[0],
        amount: data.amount,
        source_module: 'adjustment',
        description: data.description,
        ...(data.source_reference && { source_reference: data.source_reference })
      };

      await createMovement(payload).unwrap();

      enqueueSnackbar('Movimiento registrado correctamente', { variant: 'success' });

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating movement:', error);

      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al registrar el movimiento';

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = isCreating;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:wallet-money-bold-duotone" width={24} />
          <Typography variant="h6">Nuevo Movimiento de Tesorería</Typography>
        </Stack>
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Info alert */}
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
              <Typography variant="body2">
                Registra entradas o salidas de dinero en tus cuentas de caja o bancos. Este movimiento afectará el saldo
                de la cuenta seleccionada.
              </Typography>
            </Alert>

            {/* Account */}
            <RHFSelect name="treasury_account_id" label="Cuenta de Tesorería" disabled={isLoading} required>
              <MenuItem value="">Seleccionar cuenta...</MenuItem>
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify
                      icon={account.type === 'cash' ? 'solar:wallet-bold' : 'solar:card-bold'}
                      width={18}
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography>{account.name}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Movement Type */}
            <RHFSelect name="movement_type" label="Tipo de Movimiento" disabled={isLoading} required>
              {MOVEMENT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon={option.icon} width={18} sx={{ color: option.color }} />
                    <Typography>{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Date */}
            <Controller
              name="movement_date"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Fecha del Movimiento"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                      required: true
                    }
                  }}
                />
              )}
            />

            {/* Amount */}
            <RHFTextField
              name="amount"
              label="Monto"
              type="number"
              placeholder="0.00"
              disabled={isLoading}
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
              }}
              helperText="Ingresa el monto en pesos colombianos (COP)"
            />

            {/* Description */}
            <RHFTextField
              name="description"
              label="Descripción"
              placeholder="Ej: Retiro para gastos administrativos, Depósito de cliente..."
              disabled={isLoading}
              required
              multiline
              rows={3}
              helperText="Describe el motivo o concepto del movimiento"
            />

            {/* Reference */}
            <RHFTextField
              name="source_reference"
              label="Referencia (Opcional)"
              placeholder="Ej: Factura #1234, Recibo #5678"
              disabled={isLoading}
              helperText="Número de factura, recibo u otra referencia externa"
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
            loading={isLoading || isSubmitting}
            startIcon={<Iconify icon="solar:diskette-bold" />}
          >
            Registrar Movimiento
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
