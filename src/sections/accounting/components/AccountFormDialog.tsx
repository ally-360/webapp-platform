import React, { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  MenuItem,
  Alert,
  Box,
  Typography,
  Divider,
  Autocomplete
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Icon } from '@iconify/react';
import { enqueueSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import {
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useGetAccountsQuery
} from 'src/redux/services/accountingApi';
import type {
  AccountingAccount,
  AccountType,
  AccountNature,
  AccountUse,
  AccountBehavior,
  CreateAccountPayload,
  UpdateAccountPayload
} from 'src/sections/accounting/types';

interface AccountFormDialogProps {
  open: boolean;
  onClose: () => void;
  account?: AccountingAccount | null;
  mode: 'create' | 'edit';
}

interface FormValues {
  code: string;
  name: string;
  description: string;
  account_type: AccountType;
  nature: AccountNature;
  use: AccountUse;
  behavior: AccountBehavior;
  accepts_third_party: boolean;
  parent_id: string | null;
  is_active: boolean;
}

const accountTypeOptions: Array<{ value: AccountType; label: string }> = [
  { value: 'asset', label: 'Activo' },
  { value: 'liability', label: 'Pasivo' },
  { value: 'equity', label: 'Patrimonio' },
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' }
];

const natureOptions: Array<{ value: AccountNature; label: string }> = [
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' }
];

const useOptions: Array<{ value: AccountUse; label: string }> = [
  { value: 'movement', label: 'Movimiento' },
  { value: 'accumulative', label: 'Acumulativa' }
];

const behaviorOptions: Array<{ value: AccountBehavior; label: string }> = [
  { value: 'NONE', label: 'Ninguno' },
  { value: 'RECEIVABLE_ACCOUNTS', label: 'Cuentas por Cobrar' },
  { value: 'RECEIVABLE_ACCOUNTS_RETURNS', label: 'Devoluciones por Cobrar' },
  { value: 'TAXES_IN_FAVOR', label: 'Impuestos a Favor' },
  { value: 'INVENTORY', label: 'Inventario' },
  { value: 'DEBTS_TO_PAY_PROVIDERS', label: 'Deudas por Pagar - Proveedores' },
  { value: 'DEBTS_TO_PAY_RETURNS', label: 'Deudas por Pagar - Devoluciones' },
  { value: 'TAXES_TO_PAY', label: 'Impuestos por Pagar' },
  { value: 'SALES', label: 'Ventas' },
  { value: 'SALES_RETURNS', label: 'Devoluciones en Ventas' },
  { value: 'COST_OF_GOODS_SOLD', label: 'Costo de Ventas' },
  { value: 'PURCHASES', label: 'Compras' },
  { value: 'PURCHASES_RETURNS', label: 'Devoluciones en Compras' }
];

export function AccountFormDialog({ open, onClose, account, mode }: AccountFormDialogProps) {
  const isEditMode = mode === 'edit';
  const isSystemAccount = account?.is_system || false;

  const { data: accountsData } = useGetAccountsQuery({ limit: 100 });
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      account_type: 'asset',
      nature: 'debit',
      use: 'movement',
      behavior: 'NONE',
      accepts_third_party: false,
      parent_id: null,
      is_active: true
    }
  });

  // Load account data in edit mode
  useEffect(() => {
    if (account && isEditMode) {
      reset({
        code: account.code,
        name: account.name,
        description: '',
        account_type: account.account_type,
        nature: account.nature,
        use: account.use,
        behavior: account.behavior,
        accepts_third_party: account.accepts_third_party,
        parent_id: account.parent_id,
        is_active: account.is_active
      });
    } else if (!isEditMode) {
      reset({
        code: '',
        name: '',
        description: '',
        account_type: 'asset',
        nature: 'debit',
        use: 'movement',
        behavior: 'NONE',
        accepts_third_party: false,
        parent_id: null,
        is_active: true
      });
    }
  }, [account, isEditMode, reset]);

  // Available parent accounts (exclude current account and its children)
  const availableParents = useMemo(() => {
    const accounts = accountsData?.accounts || [];
    if (!isEditMode) return accounts;

    // In edit mode, exclude self and descendants to prevent cycles
    const excludeIds = new Set<string>([account!.id]);
    const findDescendants = (parentId: string) => {
      accounts.forEach((acc) => {
        if (acc.parent_id === parentId && !excludeIds.has(acc.id)) {
          excludeIds.add(acc.id);
          findDescendants(acc.id);
        }
      });
    };
    findDescendants(account!.id);

    return accounts.filter((acc) => !excludeIds.has(acc.id));
  }, [accountsData, isEditMode, account]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && account) {
        const payload: UpdateAccountPayload = {
          name: data.name,
          description: data.description || undefined,
          code: data.code,
          is_active: data.is_active,
          accepts_third_party: data.accepts_third_party,
          parent_id: data.parent_id
        };

        await updateAccount({ id: account.id, payload }).unwrap();
        enqueueSnackbar('Cuenta actualizada exitosamente', { variant: 'success' });
      } else {
        const payload: CreateAccountPayload = {
          code: data.code,
          name: data.name,
          description: data.description || undefined,
          account_type: data.account_type,
          nature: data.nature,
          use: data.use,
          behavior: data.behavior,
          accepts_third_party: data.accepts_third_party,
          parent_id: data.parent_id || null
        };

        await createAccount(payload).unwrap();
        enqueueSnackbar('Cuenta creada exitosamente', { variant: 'success' });
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving account:', error);
      const message = error?.data?.detail || 'Error al guardar la cuenta';
      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Icon icon={isEditMode ? 'mdi:pencil' : 'mdi:plus'} width={24} />
          <Typography variant="h6">{isEditMode ? 'Editar Cuenta Contable' : 'Crear Nueva Cuenta'}</Typography>
        </Stack>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* System account warning */}
            {isSystemAccount && (
              <Alert severity="warning" icon={<Icon icon="mdi:alert" />}>
                Esta es una cuenta de sistema. No se pueden modificar los campos críticos (tipo, naturaleza,
                comportamiento).
              </Alert>
            )}

            {/* Basic Information */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Información Básica
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="code"
                    control={control}
                    rules={{
                      required: 'El código es requerido',
                      pattern: {
                        value: /^[0-9]+$/,
                        message: 'Solo números permitidos'
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Código"
                        placeholder="1105"
                        required
                        fullWidth
                        error={!!errors.code}
                        helperText={errors.code?.message || 'Código numérico único (ej: 1105)'}
                        disabled={isLoading}
                      />
                    )}
                  />

                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'El nombre es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Nombre"
                        placeholder="Caja"
                        required
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={isLoading}
                      />
                    )}
                  />
                </Stack>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descripción"
                      placeholder="Descripción opcional de la cuenta..."
                      multiline
                      rows={2}
                      fullWidth
                      disabled={isLoading}
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Classification */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Clasificación Contable
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="account_type"
                    control={control}
                    rules={{ required: 'El tipo es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Tipo de Cuenta"
                        required
                        fullWidth
                        error={!!errors.account_type}
                        helperText={errors.account_type?.message}
                        disabled={isLoading || (isEditMode && isSystemAccount)}
                      >
                        {accountTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="nature"
                    control={control}
                    rules={{ required: 'La naturaleza es requerida' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Naturaleza"
                        required
                        fullWidth
                        error={!!errors.nature}
                        helperText={errors.nature?.message}
                        disabled={isLoading || (isEditMode && isSystemAccount)}
                      >
                        {natureOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="use"
                    control={control}
                    rules={{ required: 'El uso es requerido' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Uso"
                        required
                        fullWidth
                        error={!!errors.use}
                        helperText={errors.use?.message || 'Movimiento: acepta asientos directos'}
                        disabled={isLoading || (isEditMode && isSystemAccount)}
                      >
                        {useOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="behavior"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Comportamiento"
                        fullWidth
                        helperText="Comportamiento especial del sistema"
                        disabled={isLoading || (isEditMode && isSystemAccount)}
                      >
                        {behaviorOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Hierarchy */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Jerarquía
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Controller
                name="parent_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={availableParents}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    value={availableParents.find((acc) => acc.id === value) || null}
                    onChange={(_, newValue) => onChange(newValue?.id || null)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cuenta Padre (opcional)"
                        placeholder="Buscar cuenta padre..."
                        helperText="Deja vacío para cuenta de nivel raíz"
                      />
                    )}
                    disabled={isLoading}
                    isOptionEqualToValue={(option, val) => option.id === val?.id}
                  />
                )}
              />
            </Box>

            {/* Options */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Opciones
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <Controller
                  name="accepts_third_party"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} disabled={isLoading} />}
                      label="Acepta terceros (clientes, proveedores, etc.)"
                    />
                  )}
                />
                {isEditMode && (
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} disabled={isLoading} />}
                        label="Cuenta activa"
                      />
                    )}
                  />
                )}
              </Stack>
            </Box>

            {/* Restrictions info */}
            {isEditMode && (
              <Alert severity="info" icon={<Icon icon="mdi:information" />}>
                <Typography variant="caption" component="div">
                  <strong>Restricciones:</strong>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>No se puede cambiar tipo, naturaleza o comportamiento</li>
                    <li>No se puede cambiar código si tiene movimientos</li>
                    <li>No se puede crear ciclos en la jerarquía</li>
                  </ul>
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isLoading}
            startIcon={<Icon icon={isEditMode ? 'mdi:content-save' : 'mdi:plus'} />}
          >
            {isEditMode ? 'Guardar Cambios' : 'Crear Cuenta'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
