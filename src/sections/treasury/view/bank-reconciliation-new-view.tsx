import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert,
  AlertTitle,
  Typography,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import Iconify from 'src/components/iconify';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField } from 'src/components/hook-form';

// RTK Query
import { useGetAccountsQuery } from 'src/redux/services/treasuryApi';
import { useCreateReconciliationMutation } from 'src/redux/services/bankReconciliationsApi';

// Routes
import { paths } from 'src/routes/paths';

// Types
import type { CreateReconciliationPayload } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

type FormValues = {
  bank_account_id: string;
  period_start_date: string;
  period_end_date: string;
  bank_balance_start: number;
  bank_balance_end: number;
  notes: string;
};

// ----------------------------------------------------------------------

export default function BankReconciliationNewView() {
  const settings = useSettingsContext();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Fetch bank accounts
  const {
    data: accountsData,
    isLoading: isLoadingAccounts,
    error: accountsError
  } = useGetAccountsQuery({ type: 'bank' });
  const bankAccounts = (accountsData?.accounts || []).filter((acc) => acc.is_active && acc.type === 'bank');

  // Create reconciliation mutation
  const [createReconciliation, { isLoading: isSubmitting }] = useCreateReconciliationMutation();

  // Form validation schema
  const NewReconciliationSchema = Yup.object().shape({
    bank_account_id: Yup.string().required('La cuenta bancaria es requerida'),
    period_start_date: Yup.string().required('La fecha inicial es requerida'),
    period_end_date: Yup.string()
      .required('La fecha final es requerida')
      .when('period_start_date', (startDate, schema) =>
        schema.test({
          name: 'is-after-start',
          message: 'La fecha final debe ser posterior a la inicial',
          test: (endDate) => {
            if (!endDate || !startDate) return true;
            return new Date(endDate) > new Date(startDate[0]);
          }
        })
      ),
    bank_balance_start: Yup.number()
      .transform((value, originalValue) => {
        // Handle comma as decimal separator
        const normalized = typeof originalValue === 'string' ? originalValue.replace(',', '.') : originalValue;
        return parseFloat(normalized);
      })
      .required('El saldo inicial es requerido')
      .typeError('Debe ser un número válido')
      .min(0, 'El saldo no puede ser negativo'),
    bank_balance_end: Yup.number()
      .transform((value, originalValue) => {
        const normalized = typeof originalValue === 'string' ? originalValue.replace(',', '.') : originalValue;
        return parseFloat(normalized);
      })
      .required('El saldo final es requerido')
      .typeError('Debe ser un número válido')
      .min(0, 'El saldo no puede ser negativo'),
    notes: Yup.string().default('')
  });

  const methods = useForm<FormValues>({
    resolver: yupResolver(NewReconciliationSchema),
    defaultValues: {
      bank_account_id: '',
      period_start_date: '',
      period_end_date: '',
      bank_balance_start: 0,
      bank_balance_end: 0,
      notes: ''
    }
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = methods;

  const selectedAccountId = watch('bank_account_id');
  const selectedAccount = bankAccounts.find((acc) => acc.id === selectedAccountId);

  // Handle form submit
  const onSubmit = async (data: FormValues) => {
    try {
      // Prepare payload - map bank_account_id to treasury_account_id
      const payload: CreateReconciliationPayload = {
        treasury_account_id: data.bank_account_id,
        period_start_date: data.period_start_date,
        period_end_date: data.period_end_date,
        bank_balance_start: data.bank_balance_start,
        bank_balance_end: data.bank_balance_end,
        notes: data.notes || undefined
      };

      const response = await createReconciliation(payload).unwrap();

      enqueueSnackbar('Conciliación creada exitosamente', { variant: 'success' });

      // Navigate to reconciliation detail with import step hint
      navigate(`${paths.dashboard.treasury.reconciliationDetails(response.id)}?step=import`);
    } catch (error: any) {
      console.error('Error creating reconciliation:', error);

      // Handle 422 validation errors
      if (error?.status === 422) {
        const detail = error?.data?.detail;
        if (typeof detail === 'string') {
          enqueueSnackbar(detail, { variant: 'error' });
        } else if (Array.isArray(detail)) {
          // Pydantic validation errors
          const errorMessages = detail.map((err: any) => err.msg || err.message).join(', ');
          enqueueSnackbar(`Errores de validación: ${errorMessages}`, { variant: 'error' });
        } else {
          enqueueSnackbar('Los datos ingresados no son válidos', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Error al crear la conciliación. Por favor, intenta nuevamente.', {
          variant: 'error'
        });
      }
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Nueva Conciliación Bancaria"
        icon="solar:add-square-bold-duotone"
        links={[
          { name: t('dashboard', 'Dashboard'), href: paths.dashboard.root },
          { name: t('treasury.title', 'Tesorería'), href: paths.dashboard.treasury.root },
          {
            name: t('treasury.bankReconciliations.title', 'Conciliaciones Bancarias'),
            href: paths.dashboard.treasury.reconciliations
          },
          { name: 'Nueva Conciliación' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Error loading accounts */}
          {accountsError && (
            <Alert severity="error" icon={<Iconify icon="solar:danger-bold" />}>
              <AlertTitle>Error al cargar cuentas</AlertTitle>
              <Typography variant="body2">
                No fue posible cargar las cuentas bancarias. Por favor, verifica tu conexión e intenta nuevamente.
              </Typography>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
            <AlertTitle>Iniciar Conciliación Bancaria</AlertTitle>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Para comenzar una nueva conciliación, selecciona la cuenta bancaria y especifica el período del extracto
              bancario que deseas conciliar. Ingresa los saldos iniciales y finales según tu extracto bancario.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Nota:</strong> El saldo en libros se calcula automáticamente desde Tesorería. Luego podrás
              importar el extracto y hacer el matching.
            </Typography>
          </Alert>

          {/* Main Form Card */}
          <Card>
            <CardHeader
              title="Información de la Conciliación"
              subheader="Completa los datos básicos para iniciar el proceso"
              avatar={<Iconify icon="solar:document-text-bold-duotone" width={32} />}
            />
            <CardContent>
              <Stack spacing={3}>
                {/* Bank Account Selection */}
                <Controller
                  name="bank_account_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      fullWidth
                      label="Cuenta Bancaria"
                      error={!!errors.bank_account_id}
                      helperText={errors.bank_account_id?.message}
                      disabled={isLoadingAccounts}
                      InputProps={{
                        startAdornment: <Iconify icon="solar:wallet-bold" sx={{ mr: 1, color: 'text.disabled' }} />
                      }}
                    >
                      {bankAccounts.length === 0 && <MenuItem disabled>No hay cuentas bancarias disponibles</MenuItem>}
                      {bankAccounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          <Stack>
                            <Typography variant="body2">{account.name}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {account.code && (
                                <Typography variant="caption" color="text.secondary">
                                  {account.code}
                                </Typography>
                              )}
                              {account.account_number && (
                                <Typography variant="caption" color="text.secondary">
                                  • {account.account_number}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {/* Selected Account Info */}
                {selectedAccount && (
                  <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Saldo Actual en Sistema
                      </Typography>
                      <Typography variant="h6">
                        $
                        {parseFloat(selectedAccount.current_balance).toLocaleString('es-CO', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                <Divider />

                {/* Period Dates */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="period_start_date"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        label="Fecha Inicial del Período"
                        value={field.value ? new Date(field.value) : null}
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.toISOString().split('T')[0] : '');
                        }}
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
                  <Controller
                    name="period_end_date"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <DatePicker
                        label="Fecha Final del Período"
                        value={field.value ? new Date(field.value) : null}
                        onChange={(newValue) => {
                          field.onChange(newValue ? newValue.toISOString().split('T')[0] : '');
                        }}
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
                </Stack>

                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  Selecciona el rango de fechas del extracto bancario que vas a conciliar. La fecha final debe ser
                  posterior a la inicial.
                </Alert>

                <Divider />

                {/* Balance Fields */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="bank_balance_start"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Saldo Inicial del Banco"
                        fullWidth
                        error={!!error}
                        helperText={error?.message || 'Saldo inicial según el extracto bancario (debe ser ≥ 0)'}
                        value={field.value ? Number(field.value).toLocaleString('es-CO') : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: 'text.disabled' }}>$</Typography>
                        }}
                      />
                    )}
                  />
                  <Controller
                    name="bank_balance_end"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Saldo Final del Banco"
                        fullWidth
                        error={!!error}
                        helperText={error?.message || 'Saldo final según el extracto bancario (debe ser ≥ 0)'}
                        value={field.value ? Number(field.value).toLocaleString('es-CO') : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value ? parseFloat(value) : 0);
                        }}
                        InputProps={{
                          startAdornment: <Typography sx={{ mr: 1, color: 'text.disabled' }}>$</Typography>
                        }}
                      />
                    )}
                  />
                </Stack>

                <Divider />

                {/* Notes */}
                <RHFTextField
                  name="notes"
                  label="Notas (Opcional)"
                  multiline
                  rows={3}
                  placeholder="Agrega cualquier observación o comentario sobre esta conciliación..."
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => navigate(paths.dashboard.treasury.reconciliations)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Iconify icon="solar:check-circle-bold" />}
            >
              {isSubmitting ? 'Creando...' : 'Crear Conciliación'}
            </Button>
          </Stack>
        </Stack>
      </FormProvider>
    </Container>
  );
}
