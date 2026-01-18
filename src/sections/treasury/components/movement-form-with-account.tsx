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
  Autocomplete,
  TextField,
  CircularProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Components
import FormProvider, { RHFTextField, RHFSelect } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// API
import { useCreateMovementMutation, useGetAccountsQuery } from 'src/redux/services/treasuryApi';

// Types
import type { CreateMovementPayload, MovementType, PaymentMethod } from 'src/sections/treasury/types';

// Utils
import { fCurrency } from 'src/utils/format-number';

// Notifications
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
};

type FormValues = {
  treasury_account_id: string;
  movement_type: MovementType;
  movement_date: Date | null;
  amount: string;
  payment_method: PaymentMethod;
  description: string;
  source_reference: string;
};

const MOVEMENT_TYPE_OPTIONS = [
  { value: 'inflow', label: 'Entrada de Dinero', icon: 'eva:arrow-downward-fill', color: 'success.main' },
  { value: 'outflow', label: 'Salida de Dinero', icon: 'eva:arrow-upward-fill', color: 'error.main' }
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

export default function MovementFormWithAccount({ open, onClose, onSuccess }: Props) {
  // RTK Query hooks
  const [createMovement, { isLoading: isCreating }] = useCreateMovementMutation();
  const { data: accountsData, isLoading: isLoadingAccounts } = useGetAccountsQuery({
    is_active: true
  });

  // Check if user has permission (admin, owner, accountant)
  // TODO: Update when backend implements role field in BackendUser
  const hasPermission = useMemo(() => true, []);

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
      treasury_account_id: '',
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
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  // Watch values for validation
  const movementType = watch('movement_type');
  const amount = watch('amount');
  const selectedAccountId = watch('treasury_account_id');

  // Get selected account
  const selectedAccount = useMemo(() => {
    if (!selectedAccountId || !accountsData?.accounts) return null;
    return accountsData.accounts.find((acc) => acc.id === selectedAccountId) || null;
  }, [selectedAccountId, accountsData]);

  // Parse current balance
  const currentBalance = useMemo(
    () => parseFloat(selectedAccount?.current_balance || '0'),
    [selectedAccount?.current_balance]
  );

  // Check if outflow exceeds balance
  const exceedsBalance = useMemo(() => {
    if (movementType !== 'outflow' || !amount || !selectedAccount) return false;
    const numAmount = parseFloat(amount);
    return !Number.isNaN(numAmount) && numAmount > currentBalance;
  }, [movementType, amount, currentBalance, selectedAccount]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        treasury_account_id: '',
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
        treasury_account_id: data.treasury_account_id,
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
  const isFormDisabled = !!(isLoading || !hasPermission || (selectedAccount && !selectedAccount.is_active));

  const accounts = accountsData?.accounts || [];

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
            {selectedAccount && !selectedAccount.is_active && (
              <Alert severity="error" icon={<Iconify icon="solar:danger-bold" />}>
                <Typography variant="body2">
                  <strong>Cuenta inactiva:</strong> La cuenta seleccionada está inactiva. Selecciona otra cuenta o
                  actívala primero.
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

            {/* Account Selector */}
            <Controller
              name="treasury_account_id"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Autocomplete
                  value={accounts.find((acc) => acc.id === field.value) || null}
                  options={accounts}
                  loading={isLoadingAccounts}
                  disabled={isFormDisabled}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, newValue) => {
                    setValue('treasury_account_id', newValue?.id || '', { shouldValidate: true });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cuenta de Tesorería"
                      required
                      error={!!error}
                      helperText={error?.message}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isLoadingAccounts ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const typeInfo = getAccountTypeInfo(option.type);
                    return (
                      <li {...props} key={option.id}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                          <Iconify icon={typeInfo.icon} width={24} sx={{ color: `${typeInfo.color}.main` }} />
                          <Stack sx={{ flexGrow: 1 }}>
                            <Typography variant="body2">{option.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {typeInfo.label} • Saldo: {fCurrency(parseFloat(option.current_balance))}
                            </Typography>
                          </Stack>
                        </Stack>
                      </li>
                    );
                  }}
                />
              )}
            />

            {/* Show selected account balance */}
            {selectedAccount && (
              <Alert severity="info" icon={<Iconify icon="solar:wallet-bold" />}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    <strong>Saldo actual:</strong>
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {fCurrency(currentBalance)}
                  </Typography>
                </Stack>
              </Alert>
            )}

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
