import { useMemo, useState, useCallback, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks/use-router';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import { useCreateDebitNoteMutation, useUpdateDebitNoteMutation } from 'src/redux/services/debitNotesApi';
// types
import type { DebitNote, DebitNoteLineItem } from 'src/types/debit-note';
import type { CreateDebitNoteRequest } from 'src/interfaces/api/debit-note';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
// utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  currentDebitNote?: DebitNote;
};

const DEBIT_NOTE_TYPES = [
  { value: 'interest', label: 'Intereses por Mora' },
  { value: 'price_adjustment', label: 'Ajuste de Precio' },
  { value: 'additional_charge', label: 'Cargo Adicional' },
  { value: 'other', label: 'Otro' }
];

// ----------------------------------------------------------------------

export default function DebitNoteNewEditForm({ currentDebitNote }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSave = useBoolean(false);

  const [lineItems, setLineItems] = useState<DebitNoteLineItem[]>(
    currentDebitNote?.line_items || [
      {
        description: '',
        quantity: null,
        unit_price: null,
        subtotal: 0,
        line_taxes: []
      }
    ]
  );

  // RTK Query
  const [createDebitNote] = useCreateDebitNoteMutation();
  const [updateDebitNote] = useUpdateDebitNoteMutation();
  const { data: invoicesData } = useGetSalesInvoicesQuery({
    status: 'open',
    limit: 100
  });

  const isEdit = !!currentDebitNote;

  // Schema validation
  const DebitNoteSchema = Yup.object().shape({
    invoice_id: Yup.string().required('Factura es obligatoria'),
    type: Yup.string().required('Tipo es obligatorio'),
    issue_date: Yup.date().required('Fecha es obligatoria'),
    reason: Yup.string().required('Razón es obligatoria'),
    notes: Yup.string()
  });

  const defaultValues = useMemo(
    () => ({
      invoice_id: currentDebitNote?.invoice_id || '',
      type: currentDebitNote?.type || 'interest',
      issue_date: currentDebitNote?.issue_date ? new Date(currentDebitNote.issue_date) : new Date(),
      reason: currentDebitNote?.reason || '',
      notes: currentDebitNote?.notes || ''
    }),
    [currentDebitNote]
  );

  const methods = useForm({
    resolver: yupResolver(DebitNoteSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (currentDebitNote) {
      reset(defaultValues);
      setLineItems(currentDebitNote.line_items);
    }
  }, [currentDebitNote, defaultValues, reset]);

  // Calcular totales
  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const taxAmount = lineItems.reduce(
      (sum, item) => sum + item.line_taxes.reduce((taxSum, tax) => taxSum + (tax.tax_amount || 0), 0),
      0
    );
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  }, [lineItems]);

  // Manejar líneas de items
  const handleAddLineItem = useCallback(() => {
    setLineItems((prev) => [
      ...prev,
      {
        description: '',
        quantity: null,
        unit_price: null,
        subtotal: 0,
        line_taxes: []
      }
    ]);
  }, []);

  const handleRemoveLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleLineItemChange = useCallback((index: number, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = { ...item, [field]: value };

        // Calcular subtotal si cambia cantidad o precio
        if (field === 'quantity' || field === 'unit_price') {
          const qty = field === 'quantity' ? value : item.quantity;
          const price = field === 'unit_price' ? value : item.unit_price;

          if (qty && price) {
            updatedItem.subtotal = qty * price;
          }
        }

        return updatedItem;
      })
    );
  }, []);

  const handleAddTax = useCallback((lineIndex: number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== lineIndex) return item;

        return {
          ...item,
          line_taxes: [
            ...item.line_taxes,
            {
              tax_name: 'IVA',
              tax_rate: 19,
              tax_amount: 0
            }
          ]
        };
      })
    );
  }, []);

  const _handleTaxChange = useCallback((lineIndex: number, taxIndex: number, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== lineIndex) return item;

        const updatedTaxes = item.line_taxes.map((tax, ti) => {
          if (ti !== taxIndex) return tax;

          const updatedTax = { ...tax, [field]: value };

          // Calcular monto del impuesto si cambia la tasa
          if (field === 'tax_rate') {
            updatedTax.tax_amount = (item.subtotal * value) / 100;
          }

          return updatedTax;
        });

        return { ...item, line_taxes: updatedTaxes };
      })
    );
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    loadingSave.onTrue();

    try {
      // Validar que haya al menos una línea con subtotal > 0
      const hasValidItems = lineItems.some((item) => item.subtotal > 0);
      if (!hasValidItems) {
        enqueueSnackbar('Debe agregar al menos una línea con subtotal mayor a 0', {
          variant: 'error'
        });
        loadingSave.onFalse();
        return;
      }

      const payload: CreateDebitNoteRequest = {
        invoice_id: data.invoice_id,
        type: data.type,
        issue_date: data.issue_date instanceof Date ? data.issue_date.toISOString().split('T')[0] : data.issue_date,
        reason: data.reason,
        notes: data.notes || undefined,
        line_items: lineItems
      };

      if (isEdit) {
        await updateDebitNote({
          id: currentDebitNote.id,
          data: payload
        }).unwrap();
        enqueueSnackbar('Nota débito actualizada exitosamente', { variant: 'success' });
      } else {
        await createDebitNote(payload).unwrap();
        enqueueSnackbar('Nota débito creada exitosamente', { variant: 'success' });
      }

      router.push(paths.dashboard.debitNotes.root);
    } catch (error) {
      console.error('Error saving debit note:', error);
      enqueueSnackbar(error?.data?.message || 'Error al guardar la nota débito', { variant: 'error' });
    } finally {
      loadingSave.onFalse();
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* Información principal */}
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Información General
          </Typography>

          <Stack spacing={3}>
            {/* Factura */}
            <RHFSelect name="invoice_id" label="Factura *" disabled={isEdit}>
              <MenuItem value="">Seleccionar factura...</MenuItem>
              {invoicesData?.invoices?.map((invoice) => (
                <MenuItem key={invoice.id} value={invoice.id}>
                  {invoice.number} - {invoice.contact?.name || 'N/A'} (
                  {fCurrency(parseFloat(invoice.total_amount))})
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Tipo */}
            <RHFSelect name="type" label="Tipo *">
              {DEBIT_NOTE_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Fecha */}
            <RHFTextField name="issue_date" label="Fecha *" type="date" />

            {/* Razón */}
            <RHFTextField name="reason" label="Razón *" multiline rows={2} />

            {/* Notas */}
            <RHFTextField name="notes" label="Notas Adicionales" multiline rows={3} />
          </Stack>
        </Card>

        {/* Line Items */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6">Líneas de Cobro</Typography>
            <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleAddLineItem}>
              Agregar Línea
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descripción</TableCell>
                  <TableCell width={100}>Cantidad</TableCell>
                  <TableCell width={120}>Precio Unit.</TableCell>
                  <TableCell width={120}>Subtotal</TableCell>
                  <TableCell width={100}>Impuestos</TableCell>
                  <TableCell width={50} />
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <RHFTextField
                        name={`line_item_${index}_description`}
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        placeholder="Descripción del cargo"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <RHFTextField
                        name={`line_item_${index}_quantity`}
                        value={item.quantity || ''}
                        onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || null)}
                        type="number"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <RHFTextField
                        name={`line_item_${index}_unit_price`}
                        value={item.unit_price || ''}
                        onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value) || null)}
                        type="number"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <RHFTextField
                        name={`line_item_${index}_subtotal`}
                        value={item.subtotal}
                        onChange={(e) => handleLineItemChange(index, 'subtotal', parseFloat(e.target.value) || 0)}
                        type="number"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleAddTax(index)}
                        startIcon={<Iconify icon="mingcute:add-line" width={16} />}
                      >
                        + Tax
                      </Button>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* Totales */}
          <Stack spacing={2} alignItems="flex-end">
            <Stack direction="row" spacing={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Subtotal:
              </Typography>
              <Typography variant="subtitle2">{fCurrency(totals.subtotal)}</Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Impuestos:
              </Typography>
              <Typography variant="subtitle2">{fCurrency(totals.taxAmount)}</Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                {fCurrency(totals.total)}
              </Typography>
            </Stack>
          </Stack>
        </Card>

        {/* Acciones */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" color="inherit" onClick={() => router.push(paths.dashboard.debitNotes.root)}>
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loadingSave.value || isSubmitting}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {isEdit ? 'Actualizar' : 'Crear Nota Débito'}
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
