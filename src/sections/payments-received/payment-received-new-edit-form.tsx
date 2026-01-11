import { useMemo, useCallback, useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Alert from '@mui/material/Alert';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// components
import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField, RHFSelect, RHFAutocomplete } from 'src/components/hook-form';
// redux
import {
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useAllocatePaymentMutation
} from 'src/redux/services/paymentsReceivedApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
// types
import type { PaymentReceived, PaymentMethod, CreatePaymentReceivedRequest } from 'src/types/payment-received';
import type { InvoiceAllocation } from './payment-invoice-selector';
//
import PaymentInvoiceSelector from './payment-invoice-selector';

// ----------------------------------------------------------------------

type Props = {
  currentPayment?: PaymentReceived;
};

type PaymentType = 'with_invoice' | 'advance';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' }
];

// ----------------------------------------------------------------------

export default function PaymentReceivedNewEditForm({ currentPayment }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSave = useBoolean(false);

  const [paymentType, setPaymentType] = useState<PaymentType>('with_invoice');
  const [selectedInvoices, setSelectedInvoices] = useState<InvoiceAllocation[]>([]);

  // RTK Query
  const [createPayment] = useCreatePaymentMutation();
  const [updatePayment] = useUpdatePaymentMutation();
  const [allocatePayment] = useAllocatePaymentMutation();
  const { data: contactsData } = useGetContactsQuery({});

  const isEdit = !!currentPayment;

  // Schema validation - Dinámica según el tipo de pago
  const PaymentSchema = Yup.object().shape({
    contact_id: Yup.string().when([], {
      is: () => paymentType === 'advance' || paymentType === 'with_invoice',
      then: (schema) => schema.required('Cliente es obligatorio'),
      otherwise: (schema) => schema
    }),
    invoice_id: Yup.string(),
    payment_date: Yup.date().required('Fecha de pago es obligatoria'),
    amount: Yup.number().required('Monto es obligatorio').positive('Monto debe ser mayor a 0'),
    method: Yup.string().required('Método de pago es obligatorio'),
    reference: Yup.string(),
    notes: Yup.string(),
    bank_account_id: Yup.string().when([], {
      is: () => paymentType === 'advance',
      then: (schema) => schema.required('Cuenta bancaria es obligatoria para pagos anticipados'),
      otherwise: (schema) => schema
    })
  });

  const defaultValues = useMemo(
    () => ({
      contact_id: currentPayment?.contact_id || '',
      invoice_id: currentPayment?.invoice_id || '',
      payment_date: currentPayment?.payment_date ? new Date(currentPayment.payment_date) : new Date(),
      amount: currentPayment?.amount ? parseFloat(currentPayment.amount) : 0,
      method: (currentPayment?.method || 'CASH') as PaymentMethod,
      bank_account_id: currentPayment?.bank_account_id || '',
      reference: currentPayment?.reference || '',
      notes: currentPayment?.notes || ''
    }),
    [currentPayment]
  );

  const methods = useForm({
    resolver: yupResolver(PaymentSchema),
    defaultValues
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const values = watch();

  useEffect(() => {
    if (currentPayment) {
      reset(defaultValues);
      setPaymentType(currentPayment.invoice_id ? 'with_invoice' : 'advance');
    }
  }, [currentPayment, defaultValues, reset]);

  const handlePaymentTypeChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newType: PaymentType | null) => {
      if (newType !== null) {
        setPaymentType(newType);
        // Revalidar el formulario cuando cambia el tipo de pago
        setTimeout(() => methods.trigger(), 0);
      }
    },
    [methods]
  );

  const handleInvoicesChange = useCallback((invoices: InvoiceAllocation[]) => {
    console.log('Invoices changed:', invoices);
    setSelectedInvoices(invoices);
  }, []);

  // Debug: Ver estado del formulario
  useEffect(() => {
    console.log('📋 Form state changed:', {
      isValid: methods.formState.isValid,
      isSubmitting: methods.formState.isSubmitting,
      errors: methods.formState.errors,
      isDirty: methods.formState.isDirty
    });
  }, [methods.formState]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('🚀 SUBMIT TRIGGERED!');
    console.log('Data received:', data);
    loadingSave.onTrue();

    try {
      const payload: CreatePaymentReceivedRequest = {
        amount: data.amount,
        method: data.method,
        payment_date: data.payment_date.toISOString().split('T')[0], // YYYY-MM-DD
        reference: data.reference || undefined,
        notes: data.notes || undefined
      };

      // Pago con factura(s)
      if (paymentType === 'with_invoice') {
        console.log('Selected invoices at submit:', selectedInvoices);
        console.log('Payment type:', paymentType);
        console.log('Form data:', data);

        if (selectedInvoices.length === 0) {
          enqueueSnackbar('Debe seleccionar al menos una factura', { variant: 'error' });
          loadingSave.onFalse();
          return;
        }

        // Validar que la suma de asignaciones no exceda el monto del pago
        const totalAllocated = selectedInvoices.reduce((sum, inv) => sum + (inv.amount_applied || 0), 0);
        console.log('Total allocated:', totalAllocated);

        if (totalAllocated === 0) {
          enqueueSnackbar('Debe asignar al menos un monto a las facturas seleccionadas', { variant: 'error' });
          loadingSave.onFalse();
          return;
        }

        if (totalAllocated > data.amount) {
          enqueueSnackbar('El total asignado excede el monto del pago', { variant: 'error' });
          loadingSave.onFalse();
          return;
        }

        if (!data.contact_id) {
          enqueueSnackbar('Debe seleccionar un cliente', { variant: 'error' });
          loadingSave.onFalse();
          return;
        }

        console.log('About to create payment...');

        // CASO 1: Una sola factura - usar endpoint directo con invoice_id
        if (selectedInvoices.length === 1) {
          payload.invoice_id = selectedInvoices[0].invoice_id;
          // Ajustar el monto al aplicado (puede ser menor que el total del pago)
          payload.amount = selectedInvoices[0].amount_applied;

          console.log('Creating payment for single invoice:', payload);
          await createPayment(payload).unwrap();
          enqueueSnackbar('Pago registrado y aplicado a factura exitosamente', { variant: 'success' });
        }
        // CASO 2: Múltiples facturas - crear pago anticipado y usar allocate
        else {
          payload.contact_id = data.contact_id;
          payload.bank_account_id = data.bank_account_id || undefined;

          console.log('Creating advance payment:', payload);
          const createdPayment = await createPayment(payload).unwrap();
          console.log('Payment created:', createdPayment);

          const allocationsData = {
            allocations: selectedInvoices.map((inv) => ({
              invoice_id: inv.invoice_id,
              allocated_amount: inv.amount_applied,
              notes: `Pago aplicado a factura ${inv.invoice_number}`
            }))
          };
          console.log('Allocating payment:', allocationsData);

          // Aplicar el pago a las facturas seleccionadas
          await allocatePayment({
            id: createdPayment.id,
            data: allocationsData
          }).unwrap();

          enqueueSnackbar(`Pago registrado y aplicado a ${selectedInvoices.length} facturas exitosamente`, {
            variant: 'success'
          });
        }
      }
      // Pago anticipado sin facturas
      else {
        if (!data.contact_id) {
          enqueueSnackbar('Debe seleccionar un cliente para pagos anticipados', { variant: 'error' });
          loadingSave.onFalse();
          return;
        }
        payload.contact_id = data.contact_id;
        payload.bank_account_id = data.bank_account_id;

        await createPayment(payload).unwrap();
        enqueueSnackbar('Pago anticipado registrado exitosamente', { variant: 'success' });
      }

      router.push(paths.dashboard.paymentsReceived.root);
    } catch (error) {
      console.error('Error al guardar pago:', error);
      enqueueSnackbar(error?.data?.detail || 'Error al guardar el pago', { variant: 'error' });
    } finally {
      loadingSave.onFalse();
    }
  });

  const customers = useMemo(
    () =>
      contactsData?.map((contact) => ({
        label: contact.name,
        value: contact.id
      })) || [],
    [contactsData]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* Header */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6">{isEdit ? 'Editar Pago Recibido' : 'Nuevo Pago Recibido'}</Typography>

            {/* Tipo de Pago */}
            {!isEdit && (
              <Stack spacing={1}>
                <Typography variant="subtitle2">¿Pago asociado a factura?</Typography>
                <ToggleButtonGroup
                  value={paymentType}
                  exclusive
                  onChange={handlePaymentTypeChange}
                  aria-label="payment type"
                  fullWidth
                >
                  <ToggleButton value="with_invoice" aria-label="with invoice">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:document-text-bold" width={20} />
                      <span>Pago con factura</span>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="advance" aria-label="advance payment">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:wallet-money-bold" width={20} />
                      <span>Otros ingresos</span>
                    </Stack>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}

            <Divider sx={{ borderStyle: 'dashed' }} />

            {/* Cliente */}
            <RHFAutocomplete
              name="contact_id"
              label="Cliente *"
              placeholder="Buscar cliente..."
              options={customers}
              getOptionLabel={(option) => {
                // Si option es string (el value guardado), buscar el label
                if (typeof option === 'string') {
                  const found = customers.find((c) => c.value === option);
                  return found?.label || option;
                }
                // Si es el objeto completo, retornar el label
                return option.label || '';
              }}
              isOptionEqualToValue={(option, value) => option.value === value}
              onChange={(event, newValue) => {
                // Guardar solo el value (string), no el objeto completo
                setValue('contact_id', newValue?.value || '');
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  {option.label}
                </li>
              )}
            />

            {/* Fecha de Pago */}
            <DatePicker
              label="Fecha de Pago *"
              value={values.payment_date}
              onChange={(newValue) => setValue('payment_date', newValue || new Date())}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'Fecha en la que se recibió el pago'
                }
              }}
            />

            {/* Método de Pago */}
            <RHFSelect name="method" label="Método de Pago *">
              {PAYMENT_METHODS.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Cuenta Bancaria (si es transferencia) */}
            {values.method === 'TRANSFER' && (
              <RHFTextField name="bank_account_id" label="Cuenta Bancaria *" placeholder="Seleccionar cuenta..." />
            )}

            {/* Referencia */}
            <RHFTextField name="reference" label="Referencia" placeholder="Número de transacción, cheque, etc." />

            {/* Monto */}
            <RHFTextField
              name="amount"
              label="Monto *"
              type="number"
              placeholder="0.00"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
              }}
            />

            {/* Notas */}
            <RHFTextField name="notes" label="Notas" multiline rows={3} placeholder="Observaciones adicionales..." />
          </Stack>
        </Card>

        {/* Selector de Facturas (solo para pagos con factura) */}
        {paymentType === 'with_invoice' && values.contact_id && (
          <PaymentInvoiceSelector
            customerId={values.contact_id}
            paymentAmount={Number(values.amount) || 0}
            onInvoicesChange={handleInvoicesChange}
          />
        )}

        {/* Mensaje si falta cliente */}
        {paymentType === 'with_invoice' && !values.contact_id && (
          <Card sx={{ p: 3 }}>
            <Alert severity="info">Por favor seleccione un cliente para ver sus facturas pendientes.</Alert>
          </Card>
        )}

        {/* Acciones */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="inherit" onClick={() => router.push(paths.dashboard.paymentsReceived.root)}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loadingSave.value || isSubmitting}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
            onClick={() => console.log('🔘 Button clicked!', { loadingSave: loadingSave.value, isSubmitting })}
          >
            {isEdit ? 'Actualizar Pago' : 'Registrar Pago'}
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
