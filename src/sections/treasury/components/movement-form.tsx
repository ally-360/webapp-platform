import { useEffect, useMemo } from 'react';
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
  Alert,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Components
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// API
import { useCreateMovementMutation } from 'src/redux/services/treasuryApi';

// Types
import type { CreateMovementPayload, MovementType, TreasuryAccount, PaymentMethod } from 'src/sections/treasury/types';

// Utils
import { fCurrency } from 'src/utils/format-number';

// Notifications
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
  account: TreasuryAccount;
};

type FormValues = {
  movement_type: MovementType;
  movement_date: Date | null;
  amount: string;
  payment_method: PaymentMethod;
  description: string;
  source_reference: string;
};

const MOVEMENT_TYPE_OPTIONS = [
  {
    value: 'inflow',
    label: 'Entrada de Dinero',
    icon: 'eva:arrow-downward-fill',
    color: 'success.main'
  },
  {
    value: 'outflow',
    label: 'Salida de Dinero',
    icon: 'eva:arrow-upward-fill',
    color: 'error.main'
  }
];

const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Efectivo', icon: 'solar:wallet-money-bold' },
  { value: 'card', label: 'Tarjeta', icon: 'solar:card-bold' },
  { value: 'transfer', label: 'Transferencia', icon: 'solar:transfer-horizontal-bold' },
  { value: 'check', label: 'Cheque', icon: 'solar:document-add-bold' },
  { value: 'other', label: 'Otro', icon: 'solar:menu-dots-bold' }
];

// Helper function to get account type info
const getAccountTypeInfo = (type: string) => {
  switch (type) {
    case 'cash':
      return { icon: 'solar:wallet-bold-duotone', label: 'Caja', color: 'primary' };
    case 'bank':
      return { icon: 'solar:card-bold-duotone', label: 'Banco', color: 'info' };
    case 'pos':
      return { icon: 'solar:card-transfer-bold-duotone', label: 'POS', color: 'warning' };
    default:
      return { icon: 'solar:wallet-bold-duotone', label: 'Cuenta', color: 'default' };
  }
};

// ----------------------------------------------------------------------

export default function MovementForm({ open, onClose, onSuccess, account }: Props) {
  // RTK Query hooks
  const [createMovement, { isLoading: isCreating }] = useCreateMovementMutation();

  // Check if user has permission (admin, owner, accountant)
  // TODO: Update when backend implements role field in BackendUser
  const hasPermission = useMemo(() => true, []);

  // Parse current balance
  const currentBalance = useMemo(() => parseFloat(account?.current_balance || '0'), [account?.current_balance]);

  // Validation schema
  const MovementSchema = Yup.object().shape({
    movement_type: Yup.string().oneOf(['inflow', 'outflow'], 'Tipo inválido').required('El tipo es requerido'),
    movement_date: Yup.date().required('La fecha es requerida').nullable(),
    amount: Yup.string()
      .required('El monto es requerido')
      .test('is-positive', 'El monto debe ser mayor a 0', (value) => {
        if (!value) return false;
        const numValue = parseFloat(value);
        return !Number.isNaN(numValue) && numValue > 0;
      }),
    payment_method: Yup.string()
      .oneOf(['cash', 'card', 'transfer', 'check', 'other'], 'Método inválido')
      .required('El método de pago es requerido'),
    description: Yup.string().required('La descripción es requerida').max(500, 'Máximo 500 caracteres'),
    source_reference: Yup.string().max(100, 'Máximo 100 caracteres').default('')
  });

  // Form methods
  const methods = useForm<FormValues>({
    resolver: yupResolver(MovementSchema),
    defaultValues: {
      movement_type: 'inflow',
      movement_date: new Date(),
      amount: '',
      payment_method: 'cash',
      description: '',
      source_reference: ''
    }
  });

  const {
    reset,
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // Watch values for validation
  const movementType = watch('movement_type');
  const amount = watch('amount');

  // Check if outflow exceeds balance
  const exceedsBalance = useMemo(() => {
    if (movementType !== 'outflow' || !amount) return false;
    const numAmount = parseFloat(amount);
    return !Number.isNaN(numAmount) && numAmount > currentBalance;
  }, [movementType, amount, currentBalance]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        movement_type: 'inflow',
        movement_date: new Date(),
        amount: '',
        payment_method: 'cash',
        description: '',
        source_reference: ''
      });
    }
  }, [open, reset]);

  // Submit handler
  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload: CreateMovementPayload = {
        treasury_account_id: account.id,
        movement_type: data.movement_type,
        movement_date: data.movement_date!.toISOString().split('T')[0],
        amount: data.amount,
        source_module: 'adjustment',
        payment_method: data.payment_method as any,
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
  const isFormDisabled = isLoading || !account?.is_active || !hasPermission;

  const accountTypeInfo = getAccountTypeInfo(account?.type);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:wallet-money-bold-duotone" width={24} />
          <Typography variant="h6">Registrar Movimiento</Typography>
        </Stack>
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Inactive account alert */}
            {!account?.is_active && (
              <Alert severity="error" icon={<Iconify icon="solar:danger-bold" />}>
                <Typography variant="body2">
                  <strong>Cuenta inactiva:</strong> No se pueden registrar movimientos en esta cuenta. Actívala primero
                  para continuar.
                </Typography>
              </Alert>
            )}

            {/* Permission alert */}
            {!hasPermission && (
              <Alert severity="warning" icon={<Iconify icon="solar:shield-warning-bold" />}>
                <Typography variant="body2">
                  <strong>Permisos insuficientes:</strong> Solo administradores, propietarios y contadores pueden
                  registrar movimientos manuales.
                </Typography>
              </Alert>
            )}

            {/* Info alert */}
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
              <Typography variant="body2">
                Registra entradas o salidas de dinero. Este movimiento afectará el saldo de la cuenta seleccionada.
              </Typography>
            </Alert>

            {/* Account Info - Fixed */}
            <Box
              sx={{
                p: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'background.neutral'
              }}
            >
              <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Cuenta de Tesorería
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Iconify icon={accountTypeInfo.icon} width={32} sx={{ color: `${accountTypeInfo.color}.main` }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">{account?.name}</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Chip label={accountTypeInfo.label} size="small" color={accountTypeInfo.color as any} />
                    {account?.code && (
                      <Typography variant="caption" color="text.secondary">
                        Código: {account.code}
                      </Typography>
                    )}
                    {account?.account_number && (
                      <Typography variant="caption" color="text.secondary">
                        N°: {account.account_number}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    Saldo actual
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {fCurrency(currentBalance)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Movement Type */}
            <RHFSelect name="movement_type" label="Tipo de Movimiento" disabled={isFormDisabled} required>
              {MOVEMENT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon={option.icon} width={18} sx={{ color: option.color }} />
                    <Typography>{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Balance warning for outflows */}
            {exceedsBalance && (
              <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold" />}>
                <Typography variant="body2">
                  <strong>Advertencia:</strong> El monto de salida ({fCurrency(parseFloat(amount))}) excede el saldo
                  actual ({fCurrency(currentBalance)}). Esto dejará la cuenta en negativo.
                </Typography>
              </Alert>
            )}

            {/* Date */}
            <Controller
              name="movement_date"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Fecha del Movimiento"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isFormDisabled}
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
              disabled={isFormDisabled}
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
              }}
              helperText="Ingresa el monto en pesos colombianos (COP)"
            />

            {/* Payment Method */}
            <RHFSelect name="payment_method" label="Método de Pago" disabled={isFormDisabled} required>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Iconify icon={option.icon} width={18} sx={{ color: 'text.secondary' }} />
                    <Typography>{option.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Description */}
            <RHFTextField
              name="description"
              label="Descripción"
              placeholder="Ej: Retiro para gastos administrativos, Depósito de cliente..."
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
            disabled={isFormDisabled}
            startIcon={<Iconify icon="solar:diskette-bold" />}
          >
            Registrar Movimiento
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
