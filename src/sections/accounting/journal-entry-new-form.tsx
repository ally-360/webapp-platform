import { useMemo, useCallback } from 'react';
import * as Yup from 'yup';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Card,
  Stack,
  Button,
  Divider,
  Typography,
  Alert,
  Box,
  MenuItem,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider, { RHFTextField, RHFSelect, RHFAutocomplete } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
// api
import {
  useCreateJournalEntryMutation,
  useGetAccountsQuery,
  useGetCostCentersQuery
} from 'src/redux/services/accountingApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import type { CreateJournalEntryRequest, AccountingAccount } from 'src/sections/accounting/types';
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

const ENTRY_TYPES = [
  { value: 'ADJUSTMENT', label: 'Ajuste contable' },
  { value: 'OPENING', label: 'Asiento de apertura' },
  { value: 'CLOSING', label: 'Asiento de cierre' },
  { value: 'OTHER', label: 'Otro' }
];

// ----------------------------------------------------------------------

type FormValues = {
  entry_date: string;
  entry_type: 'ADJUSTMENT' | 'OPENING' | 'CLOSING' | 'OTHER';
  description: string;
  reference_number: string;
  lines: Array<{
    account_id: string;
    debit_amount: number;
    credit_amount: number;
    contact_id: string;
    description: string;
    cost_center_id: string;
  }>;
};

export default function JournalEntryNewForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loading = useBoolean(false);

  // RTK Query
  const [createJournalEntry] = useCreateJournalEntryMutation();
  const { data: accountsResponse } = useGetAccountsQuery({ is_active: true, use: 'general' });
  const { data: costCentersResponse } = useGetCostCentersQuery();
  const { data: contactsResponse } = useGetContactsQuery({});

  const accounts = useMemo(() => accountsResponse?.accounts || [], [accountsResponse]);
  const costCenters = useMemo(() => costCentersResponse || [], [costCentersResponse]);
  const contacts = useMemo(() => {
    if (Array.isArray(contactsResponse)) return contactsResponse;
    if (contactsResponse && 'items' in contactsResponse) return (contactsResponse as any).items || [];
    return [];
  }, [contactsResponse]);

  // Get movement accounts only (exclude accumulative/summary accounts)
  const movementAccounts = useMemo(() => accounts.filter((acc) => acc.use === 'movement' && acc.is_active), [accounts]);

  const JournalEntrySchema = Yup.object().shape({
    entry_date: Yup.string().required('Fecha es requerida'),
    entry_type: Yup.string()
      .oneOf(['ADJUSTMENT', 'OPENING', 'CLOSING', 'OTHER'], 'Tipo de asiento inválido')
      .required('Tipo de asiento es requerido'),
    description: Yup.string().required('Descripción es requerida'),
    reference_number: Yup.string(),
    lines: Yup.array()
      .of(
        Yup.object().shape({
          account_id: Yup.string().required('Cuenta es requerida'),
          debit_amount: Yup.number().min(0, 'Debe ser mayor o igual a 0'),
          credit_amount: Yup.number().min(0, 'Debe ser mayor o igual a 0'),
          description: Yup.string()
        })
      )
      .min(2, 'Debe agregar al menos 2 líneas')
      .test('balanced', 'El asiento debe estar balanceado (débitos = créditos)', (lines) => {
        if (!lines || lines.length === 0) return false;
        const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit_amount) || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit_amount) || 0), 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
      })
      .test('no-both-amounts', 'Cada línea debe tener débito O crédito, no ambos', (lines) => {
        if (!lines) return true;
        return lines.every((line) => {
          const debit = Number(line.debit_amount) || 0;
          const credit = Number(line.credit_amount) || 0;
          return !(debit > 0 && credit > 0);
        });
      })
      .test('at-least-one-amount', 'Cada línea debe tener un valor en débito o crédito', (lines) => {
        if (!lines) return true;
        return lines.every((line) => {
          const debit = Number(line.debit_amount) || 0;
          const credit = Number(line.credit_amount) || 0;
          return debit > 0 || credit > 0;
        });
      })
  });

  const defaultValues = useMemo<FormValues>(
    () => ({
      entry_date: new Date().toISOString().split('T')[0],
      entry_type: 'ADJUSTMENT',
      description: '',
      reference_number: '',
      lines: [
        {
          account_id: '',
          debit_amount: 0,
          credit_amount: 0,
          contact_id: '',
          description: '',
          cost_center_id: ''
        },
        {
          account_id: '',
          debit_amount: 0,
          credit_amount: 0,
          contact_id: '',
          description: '',
          cost_center_id: ''
        }
      ]
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(JournalEntrySchema),
    defaultValues
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines'
  });

  const values = watch();

  // Calculate totals
  const totals = useMemo(() => {
    if (!values.lines) return { totalDebit: 0, totalCredit: 0, difference: 0, isBalanced: false };

    const totalDebit = values.lines.reduce((sum, line) => sum + (Number(line.debit_amount) || 0), 0);
    const totalCredit = values.lines.reduce((sum, line) => sum + (Number(line.credit_amount) || 0), 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01;

    return {
      totalDebit,
      totalCredit,
      difference,
      isBalanced
    };
  }, [values.lines]);

  const onSubmit = handleSubmit(async (data) => {
    loading.onTrue();
    try {
      const payload: CreateJournalEntryRequest = {
        entry_date: data.entry_date,
        entry_type: data.entry_type,
        description: data.description,
        reference_number: data.reference_number || undefined,
        lines: (data.lines || []).map((line) => ({
          account_id: line.account_id,
          debit_amount: Number(line.debit_amount) || 0,
          credit_amount: Number(line.credit_amount) || 0,
          contact_id: (line as any).contact_id || undefined,
          description: line.description || undefined,
          cost_center_id: (line as any).cost_center_id || undefined
        }))
      };

      await createJournalEntry(payload).unwrap();

      enqueueSnackbar('Asiento contable creado exitosamente', { variant: 'success' });
      reset();
      router.push(paths.dashboard.accounting.journal.root);
    } catch (error: any) {
      console.error('Error creating journal entry:', error);
      const errorMessage = error?.data?.detail || error?.data?.message || 'Error al crear el asiento contable';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      loading.onFalse();
    }
  });

  const handleAddLine = useCallback(() => {
    append({
      account_id: '',
      debit_amount: 0,
      credit_amount: 0,
      contact_id: '',
      description: '',
      cost_center_id: ''
    } as any);
  }, [append]);

  const handleRemoveLine = useCallback(
    (index: number) => {
      if (fields.length > 2) {
        remove(index);
      }
    },
    [fields.length, remove]
  );

  const getAccountById = useCallback(
    (accountId: string): AccountingAccount | undefined => accounts.find((acc) => acc.id === accountId),
    [accounts]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* Información general */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Información General
          </Typography>

          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFTextField name="entry_date" label="Fecha" type="date" InputLabelProps={{ shrink: true }} />

              <RHFSelect name="entry_type" label="Tipo de asiento">
                {ENTRY_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>

            <RHFTextField name="description" label="Descripción" multiline rows={2} />

            <RHFTextField name="reference_number" label="Número de referencia (opcional)" />
          </Stack>
        </Card>

        {/* Líneas del asiento */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Líneas del Asiento</Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddLine}
            >
              Agregar línea
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="25%">Cuenta</TableCell>
                  <TableCell width="15%">Débito</TableCell>
                  <TableCell width="15%">Crédito</TableCell>
                  <TableCell width="15%">Tercero</TableCell>
                  <TableCell width="20%">Descripción</TableCell>
                  <TableCell width="5%">Centro de Costo</TableCell>
                  <TableCell width="5%" />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => {
                  const selectedAccount = values.lines ? getAccountById(values.lines[index]?.account_id) : undefined;
                  const requiresThirdParty = selectedAccount?.accepts_third_party;

                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <RHFAutocomplete
                          name={`lines.${index}.account_id`}
                          label="Cuenta"
                          options={movementAccounts}
                          getOptionLabel={(option: any) => {
                            if (typeof option === 'string') {
                              const account = movementAccounts.find((acc) => acc.id === option);
                              return account ? `${account.code} - ${account.name}` : '';
                            }
                            return `${option.code} - ${option.name}`;
                          }}
                          isOptionEqualToValue={(option: any, value: any) => option.id === value}
                          renderOption={(props, option: any) => (
                            <li {...props} key={option.id}>
                              <Stack>
                                <Typography variant="body2">
                                  {option.code} - {option.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.account_type}
                                </Typography>
                              </Stack>
                            </li>
                          )}
                          size="small"
                          sx={{ minWidth: 250 }}
                        />
                      </TableCell>

                      <TableCell>
                        <RHFTextField
                          name={`lines.${index}.debit_amount`}
                          label="Débito"
                          type="number"
                          size="small"
                          inputProps={{ step: '0.01', min: 0 }}
                        />
                      </TableCell>

                      <TableCell>
                        <RHFTextField
                          name={`lines.${index}.credit_amount`}
                          label="Crédito"
                          type="number"
                          size="small"
                          inputProps={{ step: '0.01', min: 0 }}
                        />
                      </TableCell>

                      <TableCell>
                        <RHFAutocomplete
                          name={`lines.${index}.contact_id`}
                          label={requiresThirdParty ? 'Tercero *' : 'Tercero'}
                          options={contacts}
                          getOptionLabel={(option: any) => {
                            if (typeof option === 'string') {
                              const contact = contacts.find((c: any) => c.id === option);
                              return contact ? contact.name : '';
                            }
                            return option.name || '';
                          }}
                          isOptionEqualToValue={(option: any, value: any) => option.id === value}
                          size="small"
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>

                      <TableCell>
                        <RHFTextField
                          name={`lines.${index}.description`}
                          label="Descripción"
                          size="small"
                          sx={{ minWidth: 200 }}
                        />
                      </TableCell>

                      <TableCell>
                        <RHFAutocomplete
                          name={`lines.${index}.cost_center_id`}
                          label="Centro"
                          options={costCenters}
                          getOptionLabel={(option: any) => {
                            if (typeof option === 'string') {
                              const cc = costCenters.find((c: any) => c.id === option);
                              return cc ? cc.name : '';
                            }
                            return option.name || '';
                          }}
                          isOptionEqualToValue={(option: any, value: any) => option.id === value}
                          size="small"
                          sx={{ minWidth: 150 }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveLine(index)}
                          disabled={fields.length <= 2}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Divider sx={{ my: 3 }} />

          <Stack spacing={2}>
            <Stack direction="row" justifyContent="flex-end" spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Débito:
                </Typography>
                <Typography variant="h6">{fCurrency(totals.totalDebit)}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Crédito:
                </Typography>
                <Typography variant="h6">{fCurrency(totals.totalCredit)}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Diferencia:
                </Typography>
                <Typography variant="h6" color={totals.isBalanced ? 'success.main' : 'error.main'}>
                  {fCurrency(Math.abs(totals.difference))}
                </Typography>
              </Box>
            </Stack>

            {!totals.isBalanced && (
              <Alert severity="warning">
                El asiento debe estar balanceado. Los débitos deben ser iguales a los créditos.
              </Alert>
            )}

            {totals.isBalanced && totals.totalDebit > 0 && (
              <Alert severity="success">Asiento balanceado correctamente</Alert>
            )}
          </Stack>
        </Card>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.accounting.journal.root)}
          >
            Cancelar
          </Button>

          <LoadingButton type="submit" variant="contained" loading={isSubmitting || loading.value}>
            Crear Asiento Contable
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
