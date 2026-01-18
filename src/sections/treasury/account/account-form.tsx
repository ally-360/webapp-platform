import { useEffect, useMemo, useState, useCallback } from 'react';
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
  Box,
  Alert,
  CircularProgress,
  Collapse,
  Divider,
  Tooltip
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Components
import FormProvider, { RHFTextField, RHFSelect, RHFSwitch, RHFAutocomplete } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';

// Utils
import { fCurrency } from 'src/utils/format-number';

// API
import {
  useCreateAccountMutation,
  useCreateSimpleAccountMutation,
  useUpdateAccountMutation
} from 'src/redux/services/treasuryApi';
import { useLazyGetAccountsQuery } from 'src/redux/services/accountingApi';

// Types
import type { TreasuryAccount } from 'src/sections/treasury/types';
import type { AccountingAccount } from 'src/sections/accounting/types';

// Auth context
import { useAuthContext } from 'src/auth/hooks';

// Notifications
import { enqueueSnackbar } from 'notistack';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  onSuccess?: VoidFunction;
  account?: TreasuryAccount | null;
};

type FormValues = {
  name: string;
  type: 'cash' | 'bank' | 'card' | 'pos';
  account_number?: string; // Para bancos
  initial_balance?: number | null;
  initial_balance_date?: Date | null;
  description?: string;
  // Advanced fields
  code?: string; // Opcional - solo en modo avanzado
  accounting_account_id?: string;
  currency: string;
  pos_terminal_id?: string;
  requires_session: boolean;
  is_active: boolean;
};

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'cash', label: 'Caja' },
  { value: 'bank', label: 'Banco' },
  { value: 'card', label: 'Tarjeta de crédito' },
  { value: 'pos', label: 'POS' }
];

// ----------------------------------------------------------------------

export default function AccountForm({ open, onClose, onSuccess, account }: Props) {
  const isEditMode = !!account;
  const { user } = useAuthContext();

  // Check if user can access advanced configuration
  const canAccessAdvanced = useMemo(() => {
    if (!user?.profile) return false;
    // TODO: Implement proper role check when role field is available
    // For now, allow all authenticated users
    return true;
  }, [user]);

  // State for advanced mode toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // RTK Query hooks
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [createSimpleAccount, { isLoading: isCreatingSimple }] = useCreateSimpleAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  // Lazy query for progressive loading
  const [fetchAccounts, { isFetching: isLoadingAccounts }] = useLazyGetAccountsQuery();

  // Pagination state for accounting accounts
  const [accountingAccounts, setAccountingAccounts] = useState<AccountingAccount[]>([]);
  const [hasMoreAccounts, setHasMoreAccounts] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 100;

  // Load initial accounts when dialog opens and advanced mode is enabled
  useEffect(() => {
    if (open && showAdvanced && accountingAccounts.length === 0) {
      loadMoreAccounts(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, showAdvanced]);

  // Function to load more accounts
  const loadMoreAccounts = useCallback(
    async (page: number) => {
      if (!hasMoreAccounts && page > 0) return;

      try {
        const result = await fetchAccounts({
          use: 'treasury',
          is_active: true,
          skip: page * pageSize,
          limit: pageSize
        }).unwrap();

        const newAccounts = result.accounts || [];

        if (page === 0) {
          setAccountingAccounts(newAccounts);
        } else {
          setAccountingAccounts((prev) => [...prev, ...newAccounts]);
        }

        setHasMoreAccounts(newAccounts.length === pageSize);
        setCurrentPage(page);
      } catch (error) {
        console.error('Error loading accounting accounts:', error);
      }
    },
    [fetchAccounts, hasMoreAccounts, pageSize]
  );

  // Handle scroll event for infinite loading
  const handleListboxScroll = useCallback(
    (event: React.SyntheticEvent) => {
      const listboxNode = event.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = listboxNode;

      // Load more when scrolled to 80% of the list
      if (scrollTop + clientHeight >= scrollHeight * 0.8 && !isLoadingAccounts && hasMoreAccounts) {
        loadMoreAccounts(currentPage + 1);
      }
    },
    [currentPage, hasMoreAccounts, isLoadingAccounts, loadMoreAccounts]
  );

  // Reset accounts when dialog closes
  useEffect(() => {
    if (!open) {
      setAccountingAccounts([]);
      setHasMoreAccounts(true);
      setCurrentPage(0);
      setShowAdvanced(false);
    }
  }, [open]);

  // Validation schema - dynamic based on mode
  const AccountSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('El nombre es requerido'),
        type: Yup.string().oneOf(['cash', 'bank', 'card', 'pos'], 'Tipo inválido').required('El tipo es requerido'),
        code: showAdvanced ? Yup.string().required('El código es requerido en modo avanzado') : Yup.string().optional(),
        account_number: Yup.string().when('type', {
          is: 'bank',
          then: (schema) => schema.required('El número de cuenta es requerido para bancos'),
          otherwise: (schema) => schema.optional()
        }),
        initial_balance: Yup.number()
          .nullable()
          .transform((value, originalValue) => (originalValue === '' ? null : value))
          .positive('El saldo inicial debe ser positivo')
          .optional(),
        initial_balance_date: Yup.date()
          .nullable()
          .when('initial_balance', {
            is: (value: any) => value && value > 0,
            then: (schema) => schema.required('La fecha es requerida si hay saldo inicial'),
            otherwise: (schema) => schema.optional()
          }),
        description: Yup.string().optional(),
        // Advanced fields
        accounting_account_id: showAdvanced
          ? Yup.string().required('La cuenta contable es requerida en modo avanzado')
          : Yup.string().optional(),
        currency: Yup.string().optional(),
        pos_terminal_id: Yup.string().optional(),
        requires_session: Yup.boolean().optional(),
        is_active: Yup.boolean().required()
      }),
    [showAdvanced]
  );

  // Form methods
  const methods = useForm<FormValues>({
    resolver: yupResolver(AccountSchema) as any,
    defaultValues: {
      name: '',
      type: 'cash',
      account_number: '',
      initial_balance: null,
      initial_balance_date: new Date(),
      description: '',
      code: '',
      accounting_account_id: '',
      currency: 'COP',
      pos_terminal_id: '',
      requires_session: false,
      is_active: true
    }
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting }
  } = methods;

  const selectedAccountingAccountId = watch('accounting_account_id');

  // Load account data in edit mode
  useEffect(() => {
    if (account && isEditMode) {
      // Determine if advanced mode should be shown in edit mode
      const hasAdvancedData = !!(account.code || account.accounting_account_id || account.requires_session);
      setShowAdvanced(hasAdvancedData);

      reset({
        name: account.name,
        type: account.type as 'cash' | 'bank' | 'card' | 'pos',
        account_number: account.account_number || '',
        initial_balance: null,
        initial_balance_date: new Date(),
        description: account.description || '',
        code: account.code || '',
        accounting_account_id: account.accounting_account_id || '',
        currency: account.currency || 'COP',
        pos_terminal_id: account.pos_terminal_id || '',
        requires_session: account.requires_session || false,
        is_active: account.is_active
      });
    } else if (!isEditMode) {
      setShowAdvanced(false);
      reset({
        name: '',
        type: 'cash',
        account_number: '',
        initial_balance: null,
        initial_balance_date: new Date(),
        description: '',
        code: '',
        accounting_account_id: '',
        currency: 'COP',
        pos_terminal_id: '',
        requires_session: false,
        is_active: true
      });
    }
  }, [account, isEditMode, reset]);

  // Find selected accounting account for display
  const selectedAccountingAccount = useMemo(
    () => accountingAccounts.find((acc) => acc.id === selectedAccountingAccountId),
    [accountingAccounts, selectedAccountingAccountId]
  );

  // Submit handler
  const onSubmit = handleSubmit(async (data) => {
    try {
      if (showAdvanced) {
        // Advanced mode - use /treasury/accounts endpoint
        const payload: any = {
          name: data.name,
          type: data.type,
          code: data.code,
          description: data.description || undefined,
          accounting_account_id: data.accounting_account_id || undefined,
          currency: 'COP',
          pos_terminal_id: data.pos_terminal_id || undefined,
          requires_session: data.requires_session || false,
          is_active: true
        };

        // Add account_number for banks
        if (data.type === 'bank' && data.account_number) {
          payload.account_number = data.account_number;
        }

        // Add initial balance if provided
        if (data.initial_balance && data.initial_balance > 0) {
          payload.initial_balance = data.initial_balance;
          payload.initial_balance_date = data.initial_balance_date?.toISOString().split('T')[0];
        }

        if (isEditMode && account) {
          await updateAccount({
            id: account.id,
            payload: payload as any
          }).unwrap();

          enqueueSnackbar('Cuenta actualizada correctamente', { variant: 'success' });
        } else {
          await createAccount(payload as any).unwrap();

          enqueueSnackbar('Cuenta creada correctamente', { variant: 'success' });
        }
      } else {
        // Simple mode - use /treasury/accounts/simple endpoint
        const payload: any = {
          name: data.name,
          type: data.type
        };

        // Add description if provided
        if (data.description) {
          payload.description = data.description;
        }

        // Add account_number for banks
        if (data.type === 'bank' && data.account_number) {
          payload.account_number = data.account_number;
        }

        // Add initial balance if provided
        if (data.initial_balance && data.initial_balance > 0) {
          payload.initial_balance = data.initial_balance;
          payload.initial_balance_date = data.initial_balance_date?.toISOString().split('T')[0];
        }

        if (isEditMode && account) {
          await updateAccount({
            id: account.id,
            payload: payload as any
          }).unwrap();

          enqueueSnackbar('Cuenta actualizada correctamente', { variant: 'success' });
        } else {
          // Use simple endpoint for creation
          await createSimpleAccount(payload).unwrap();

          enqueueSnackbar('Cuenta creada correctamente', { variant: 'success' });
        }
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving treasury account:', error);

      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al guardar la cuenta de tesorería';

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  const handleClose = () => {
    reset();
    setShowAdvanced(false);
    onClose();
  };

  const isLoading = isCreating || isCreatingSimple || isUpdating;

  // Watch all form values for validation
  const nameValue = watch('name');
  const typeValue = watch('type');
  const initialBalance = watch('initial_balance');
  const initialBalanceDate = watch('initial_balance_date');
  const accountNumber = watch('account_number');
  const codeValue = watch('code');
  const accountingAccountId = watch('accounting_account_id');

  const isFormValid = useMemo(() => {
    // Basic validation
    if (!nameValue || !typeValue) return false;

    // If type is bank, account_number is required
    if (typeValue === 'bank' && !accountNumber) return false;

    // If initial balance is provided, date is required
    if (initialBalance && initialBalance > 0 && !initialBalanceDate) return false;

    // Advanced validation
    if (showAdvanced) {
      // Code and accounting account are required in advanced mode
      if (!codeValue || !accountingAccountId) return false;
    }

    return true;
  }, [
    nameValue,
    typeValue,
    accountNumber,
    initialBalance,
    initialBalanceDate,
    showAdvanced,
    codeValue,
    accountingAccountId
  ]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon={isEditMode ? 'solar:pen-bold-duotone' : 'solar:bank-bold-duotone'} width={24} />
          <Typography variant="h6">{isEditMode ? `Editar cuenta: ${account?.name}` : 'Agregar banco'}</Typography>
        </Stack>
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Info alert for edit mode */}
            {isEditMode && (
              <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                Editando cuenta existente. Los cambios afectarán los registros futuros.
              </Alert>
            )}

            {/* ===== BASIC FIELDS (ALWAYS VISIBLE) ===== */}

            {/* Name */}
            <RHFTextField
              name="name"
              label="Nombre de la cuenta"
              placeholder="Ej: Banco Davivienda, Caja Principal"
              disabled={isLoading}
              required
            />

            {/* Type */}
            <RHFSelect name="type" label="Tipo de cuenta" disabled={isLoading} required>
              {ACCOUNT_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Account Number - Only for banks */}
            {watch('type') === 'bank' && (
              <RHFTextField
                name="account_number"
                label="Número de cuenta"
                placeholder="Ej: 1234567890"
                disabled={isLoading}
                required
              />
            )}

            {/* Initial Balance */}
            <Controller
              name="initial_balance"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Saldo inicial (opcional)
                  </Typography>
                  <RHFTextField
                    {...field}
                    value={field.value ? fCurrency(field.value).replace('$', '') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      field.onChange(value ? parseFloat(value) : null);
                    }}
                    placeholder="0"
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                    }}
                    error={!!error}
                    helperText={error?.message}
                  />
                </Stack>
              )}
            />

            {/* Initial Balance Date */}
            <Controller
              name="initial_balance_date"
              control={methods.control}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Fecha del saldo inicial"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
                  disabled={isLoading}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText:
                        error?.message || (watch('initial_balance') ? 'Requerido si hay saldo inicial' : 'Opcional')
                    }
                  }}
                />
              )}
            />

            {/* Description */}
            <RHFTextField
              name="description"
              label="Descripción (opcional)"
              placeholder="Información adicional sobre esta cuenta"
              disabled={isLoading}
              multiline
              rows={2}
            />

            {/* ===== ADVANCED CONFIGURATION TOGGLE ===== */}

            {canAccessAdvanced && !isEditMode && (
              <>
                <Divider sx={{ my: 1 }} />

                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<Iconify icon={showAdvanced ? 'eva:arrow-up-fill' : 'eva:arrow-down-fill'} />}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2">Configuración avanzada</Typography>
                    <Tooltip title="Puedes usar configuración avanzada si necesitas más control contable">
                      <Box component="span" sx={{ display: 'inline-flex' }}>
                        <Iconify icon="solar:info-circle-line-duotone" width={16} />
                      </Box>
                    </Tooltip>
                  </Stack>
                </Button>
              </>
            )}

            {/* ===== ADVANCED FIELDS (COLLAPSIBLE) ===== */}

            <Collapse in={showAdvanced || (isEditMode && !!account?.code)}>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Alert severity="info" icon={<Iconify icon="solar:settings-bold" />}>
                  Configuración avanzada - Permite mayor control contable
                </Alert>

                {/* Code */}
                <RHFTextField
                  name="code"
                  label="Código interno"
                  placeholder="Ej: CAJA-001, BCO-DAV"
                  disabled={isLoading}
                  required={showAdvanced}
                />

                {/* Accounting Account (Autocomplete) */}
                <RHFAutocomplete
                  name="accounting_account_id"
                  label="Cuenta contable"
                  placeholder="Buscar cuenta contable..."
                  options={accountingAccounts}
                  loading={isLoadingAccounts}
                  disabled={isLoading}
                  getOptionLabel={(option: any) => {
                    if (typeof option === 'string') {
                      const acc = accountingAccounts.find((a) => a.id === option);
                      return acc ? `${acc.code} - ${acc.name}` : '';
                    }
                    return option ? `${option.code} - ${option.name}` : '';
                  }}
                  isOptionEqualToValue={(option: any, value: any) => {
                    if (typeof value === 'string') {
                      return option.id === value;
                    }
                    return option.id === value?.id;
                  }}
                  onChange={(event, newValue) => {
                    setValue('accounting_account_id', newValue?.id || '', { shouldValidate: true });
                  }}
                  value={selectedAccountingAccount || null}
                  ListboxProps={{
                    onScroll: handleListboxScroll,
                    style: { maxHeight: '300px' }
                  }}
                  renderOption={(props, option: any) => (
                    <Box component="li" {...props} key={option.id}>
                      <Stack>
                        <Typography variant="body2">
                          <strong>{option.code}</strong> - {option.name}
                        </Typography>
                        {option.account_type && (
                          <Typography variant="caption" color="text.secondary">
                            {option.account_type}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}
                  noOptionsText={
                    isLoadingAccounts ? (
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <CircularProgress size={20} />
                        <Typography variant="body2">Cargando cuentas...</Typography>
                      </Stack>
                    ) : (
                      'No se encontraron cuentas contables'
                    )
                  }
                />

                {/* Currency info (fixed to COP) */}
                <Alert severity="info" icon={<Iconify icon="solar:dollar-minimalistic-bold" />}>
                  <Typography variant="body2">
                    <strong>Moneda:</strong> COP (Peso Colombiano)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Actualmente solo se soporta moneda colombiana.
                  </Typography>
                </Alert>

                {/* POS Terminal ID (optional) */}
                <RHFTextField
                  name="pos_terminal_id"
                  label="ID Terminal POS (opcional)"
                  placeholder="Solo si es efectivo POS"
                  disabled={isLoading}
                />

                {/* Requires Session */}
                <RHFSwitch
                  name="requires_session"
                  label="Requiere apertura/cierre de sesión"
                  helperText="Activa esto para cajas con control de turnos"
                  disabled={isLoading}
                />
              </Stack>
            </Collapse>

            {/* Is Active (always at the end) */}
            {isEditMode && (
              <RHFSwitch
                name="is_active"
                label="Cuenta activa"
                helperText="Indica si la cuenta está activa y disponible para operaciones"
                disabled={isLoading}
              />
            )}
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
            disabled={!isFormValid}
            startIcon={<Iconify icon={isEditMode ? 'solar:diskette-bold' : 'solar:add-circle-bold'} />}
          >
            {isEditMode ? 'Guardar cambios' : 'Crear cuenta'}
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
