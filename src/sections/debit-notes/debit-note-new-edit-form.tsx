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
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useFormDraft, getDraft } from 'src/hooks/use-form-draft';
// redux
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import { useCreateDebitNoteMutation, useUpdateDebitNoteMutation } from 'src/redux/services/debitNotesApi';
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetProductsQuery } from 'src/redux/services/productsApi';
// types
import type { DebitNote, DebitNoteLineItem } from 'src/types/debit-note';
import type { CreateDebitNoteRequest } from 'src/interfaces/api/debit-note';
import type { Product } from 'src/api/types';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField } from 'src/components/hook-form';
import DraftRecoveryDialog from 'src/components/draft-recovery-dialog';
import { CostCenterSelectField } from 'src/components/cost-center';
// utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

type Props = {
  currentDebitNote?: DebitNote;
  preselectedInvoiceId?: string; // Nueva prop para crear desde factura
};

const DEBIT_NOTE_TYPES = [
  { value: 'interest', label: 'Intereses por Mora', requiresProducts: false },
  { value: 'price_adjustment', label: 'Ajuste de Precio', requiresProducts: true },
  { value: 'additional_charge', label: 'Cargo Adicional', requiresProducts: false },
  { value: 'other', label: 'Otro', requiresProducts: false }
];

// ----------------------------------------------------------------------

export default function DebitNoteNewEditForm({ currentDebitNote, preselectedInvoiceId }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSave = useBoolean(false);
  const showDraftDialog = useBoolean(false);

  const [lineItems, setLineItems] = useState<DebitNoteLineItem[]>(
    currentDebitNote?.line_items || [
      {
        name: '',
        product_id: null,
        quantity: null,
        unit_price: null,
        subtotal: 0,
        line_taxes: []
      }
    ]
  );

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    preselectedInvoiceId || currentDebitNote?.invoice_id || ''
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [productSearchInput, setProductSearchInput] = useState<string>('');
  const [productPage, setProductPage] = useState<number>(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [draftTimestamp, setDraftTimestamp] = useState<string>('');

  // Debounce de la búsqueda de productos (500ms)
  const debouncedProductSearch = useDebounce(productSearchInput, 500);

  const isEdit = !!currentDebitNote;
  const isFromInvoice = !!preselectedInvoiceId;

  // RTK Query
  const [createDebitNote] = useCreateDebitNoteMutation();
  const [updateDebitNote] = useUpdateDebitNoteMutation();

  // Cargar contactos para selector
  const { data: contactsData } = useGetContactsQuery({
    limit: 100,
    type: 'client'
  });

  // Cargar productos con paginación y búsqueda
  const { data: productsData, isFetching: isFetchingProducts } = useGetProductsQuery({
    limit: 100, // Máximo permitido por el backend
    page: productPage,
    is_active: true,
    search: debouncedProductSearch || undefined
  });

  // Cargar facturas solo si hay cliente seleccionado
  const { data: invoicesData, isFetching: isFetchingInvoices } = useGetSalesInvoicesQuery(
    {
      limit: 50,
      customer_id: selectedCustomerId,
      status: 'OPEN' // Solo facturas abiertas
    },
    {
      skip: !selectedCustomerId && !isFromInvoice // Solo hacer query si hay cliente o viene preseleccionada
    }
  );

  // Opciones de clientes para Autocomplete
  const customers = useMemo(() => {
    if (!contactsData) return [];
    return contactsData.map((contact) => ({
      label: `${contact.name} - ${contact.id_number}`,
      value: contact.id,
      ...contact
    }));
  }, [contactsData]);

  // Opciones de productos para Autocomplete con scroll infinito
  const products = useMemo(() => {
    if (!productsData?.data) return allProducts;

    // Crear map de productos existentes para evitar duplicados
    const existingIds = new Set(allProducts.map((p) => p.value));
    const newProducts = productsData.data
      .filter((product: Product) => !existingIds.has(product.id))
      .map((product: Product) => ({
        label: `${product.name} - ${product.sku || 'Sin SKU'}`,
        value: product.id,
        ...product
      }));

    // Si es página 1 o cambió búsqueda, reemplazar; si no, agregar al final
    if (productPage === 1) {
      return newProducts;
    }
    return [...allProducts, ...newProducts];
  }, [productsData, allProducts, productPage]);

  // Actualizar lista acumulada de productos
  useEffect(() => {
    if (productsData?.data) {
      const productsList = productsData.data.map((product: Product) => ({
        label: `${product.name} - ${product.sku || 'Sin SKU'}`,
        value: product.id,
        ...product
      }));

      if (productPage === 1) {
        // Primera página o búsqueda nueva: reemplazar
        setAllProducts(productsList);
      } else {
        // Páginas siguientes: agregar sin duplicados
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.value));
          const newProducts = productsList.filter((p) => !existingIds.has(p.value));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [productsData, productPage]);

  // Resetear página al cambiar búsqueda
  useEffect(() => {
    setProductPage(1);
    setAllProducts([]);
  }, [debouncedProductSearch]);

  // Factura seleccionada
  const selectedInvoice = useMemo(() => {
    if (!selectedInvoiceId || !invoicesData?.invoices) return null;
    return invoicesData.invoices.find((inv) => inv.id === selectedInvoiceId);
  }, [selectedInvoiceId, invoicesData]);

  // Schema validation
  const DebitNoteSchema = Yup.object().shape({
    invoice_id: Yup.string().required('La factura es obligatoria'),
    type: Yup.string()
      .required('El tipo es obligatorio')
      .oneOf(['interest', 'price_adjustment', 'additional_charge', 'other']),
    issue_date: Yup.date().required('La fecha es obligatoria').max(new Date(), 'La fecha no puede ser futura'),
    reason: Yup.string().required('La razón es obligatoria').min(10, 'La razón debe tener al menos 10 caracteres'),
    notes: Yup.string(),
    cost_center_id: Yup.string().nullable()
  });

  const defaultValues = useMemo(
    () => ({
      invoice_id: selectedInvoiceId,
      type: currentDebitNote?.type || 'interest',
      issue_date: currentDebitNote?.issue_date ? new Date(currentDebitNote.issue_date) : new Date(),
      reason: currentDebitNote?.reason || '',
      notes: currentDebitNote?.notes || '',
      cost_center_id: ''
    }),
    [currentDebitNote, selectedInvoiceId]
  );

  const methods = useForm({
    resolver: yupResolver(DebitNoteSchema),
    defaultValues
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = methods;

  const currentType = watch('type');
  const values = watch();

  // Sistema de autoguardado en localStorage
  const draftData = useMemo(
    () => ({
      values,
      lineItems,
      selectedInvoiceId,
      selectedCustomerId,
      selectedCustomer
    }),
    [values, lineItems, selectedInvoiceId, selectedCustomerId, selectedCustomer]
  );

  const { clearDraft } = useFormDraft({
    key: 'debit-note-draft',
    data: draftData,
    enabled: !isEdit && !isFromInvoice // Solo para formularios nuevos
  });

  // Verificar borrador al montar el componente
  useEffect(() => {
    if (isEdit || isFromInvoice) return;

    const saved = getDraft<typeof draftData>('debit-note-draft');
    if (saved && saved.data) {
      setDraftTimestamp(saved.timestamp);
      showDraftDialog.onTrue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recuperar borrador
  const handleRecoverDraft = useCallback(() => {
    const saved = getDraft<typeof draftData>('debit-note-draft');
    if (saved && saved.data) {
      const draft = saved.data;

      // Restaurar line items primero
      if (draft.lineItems && Array.isArray(draft.lineItems)) {
        setLineItems(draft.lineItems);
      }

      // Restaurar selecciones
      if (draft.selectedInvoiceId) {
        setSelectedInvoiceId(draft.selectedInvoiceId);
      }
      if (draft.selectedCustomerId) {
        setSelectedCustomerId(draft.selectedCustomerId);
      }
      if (draft.selectedCustomer) {
        setSelectedCustomer(draft.selectedCustomer);
      }

      // Restaurar valores del formulario usando reset para actualizar todo el estado
      if (draft.values) {
        const formValues = { ...draft.values };

        // Convertir issue_date de string ISO a Date
        if (formValues.issue_date && typeof formValues.issue_date === 'string') {
          formValues.issue_date = new Date(formValues.issue_date);
        }

        // Usar reset para actualizar todo el formulario de una vez
        reset(formValues);
      }

      enqueueSnackbar('Borrador recuperado exitosamente', { variant: 'success' });
    }
    showDraftDialog.onFalse();
  }, [reset, enqueueSnackbar, showDraftDialog]);

  // Descartar borrador
  const handleDiscardDraft = useCallback(() => {
    clearDraft();
    showDraftDialog.onFalse();
    enqueueSnackbar('Borrador descartado', { variant: 'info' });
  }, [clearDraft, enqueueSnackbar, showDraftDialog]);

  useEffect(() => {
    if (currentDebitNote) {
      reset(defaultValues);
      setLineItems(currentDebitNote.line_items);
    }
  }, [currentDebitNote, defaultValues, reset]);

  // Actualizar invoice_id cuando se selecciona una factura
  useEffect(() => {
    if (selectedInvoiceId) {
      setValue('invoice_id', selectedInvoiceId);
    }
  }, [selectedInvoiceId, setValue]);

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

  // Manejar cambio de factura
  const handleInvoiceChange = useCallback(
    (invoiceId: string) => {
      setSelectedInvoiceId(invoiceId);
      setValue('invoice_id', invoiceId);
    },
    [setValue]
  );

  // Manejar líneas de items
  const handleAddLineItem = useCallback(() => {
    const newItem: DebitNoteLineItem = {
      name: '',
      product_id: null,
      quantity: null,
      unit_price: null,
      subtotal: 0,
      line_taxes: []
    };

    setLineItems((prev) => [...prev, newItem]);
  }, []);

  const handleRemoveLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleLineItemChange = useCallback((index: number, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = { ...item, [field]: value };

        // Calcular subtotal automáticamente si hay cantidad y precio
        if (field === 'quantity' || field === 'unit_price') {
          const qty = field === 'quantity' ? value : item.quantity;
          const price = field === 'unit_price' ? value : item.unit_price;

          if (qty && price && qty > 0 && price > 0) {
            updatedItem.subtotal = qty * price;
          }
        }

        // Recalcular impuestos cuando cambia el subtotal
        if (field === 'subtotal' || field === 'quantity' || field === 'unit_price') {
          updatedItem.line_taxes = updatedItem.line_taxes.map((tax) => ({
            ...tax,
            tax_amount: (updatedItem.subtotal * tax.tax_rate) / 100
          }));
        }

        return updatedItem;
      })
    );
  }, []);

  const handleAddTax = useCallback((lineIndex: number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== lineIndex) return item;

        const taxAmount = (item.subtotal * 19) / 100;

        return {
          ...item,
          line_taxes: [
            ...item.line_taxes,
            {
              tax_name: 'IVA',
              tax_rate: 19,
              tax_amount: taxAmount
            }
          ]
        };
      })
    );
  }, []);

  const handleRemoveTax = useCallback((lineIndex: number, taxIndex: number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== lineIndex) return item;
        return {
          ...item,
          line_taxes: item.line_taxes.filter((_, ti) => ti !== taxIndex)
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

          // Recalcular monto del impuesto cuando cambia la tasa
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
      // Validación: Al menos una línea con subtotal > 0
      const hasValidItems = lineItems.some((item) => item.subtotal > 0);
      if (!hasValidItems) {
        enqueueSnackbar('Debe agregar al menos una línea con subtotal mayor a 0', {
          variant: 'error'
        });
        loadingSave.onFalse();
        return;
      }

      // Validación: Todas las líneas deben tener descripción
      const allHaveDescription = lineItems.every((item) => item.name.trim() !== '');
      if (!allHaveDescription) {
        enqueueSnackbar('Todas las líneas deben tener un nombre/descripción', {
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
        cost_center_id: data.cost_center_id || undefined,
        line_items: lineItems.map((item) => ({
          product_id: item.product_id || undefined,
          name: item.name,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.subtotal,
          subtotal: item.subtotal,
          line_taxes: item.line_taxes
        }))
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

        // Limpiar borrador después de guardar exitosamente
        clearDraft();
      }

      router.push(paths.dashboard.debitNotes.root);
    } catch (error: any) {
      console.error('Error saving debit note:', error);
      enqueueSnackbar(error?.data?.message || 'Error al guardar la nota débito', {
        variant: 'error'
      });
    } finally {
      loadingSave.onFalse();
    }
  });

  // Obtener configuración del tipo actual
  const currentTypeConfig = DEBIT_NOTE_TYPES.find((t) => t.value === currentType);

  return (
    <>
      {/* Diálogo de recuperación de borrador */}
      <DraftRecoveryDialog
        open={showDraftDialog.value}
        timestamp={draftTimestamp}
        title="Borrador de Nota Débito"
        message="Se encontró un borrador guardado de una nota débito en progreso. ¿Deseas continuar desde donde lo dejaste?"
        onRecover={handleRecoverDraft}
        onDiscard={handleDiscardDraft}
      />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          {/* Paso 1: Selección de Cliente y Factura */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:user-id-bold" width={24} />
              Paso 1: Cliente y Factura
            </Typography>

            <Grid container spacing={3}>
              {/* Cliente */}
              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  value={selectedCustomer}
                  onChange={(event, newValue) => {
                    setSelectedCustomer(newValue);
                    setSelectedCustomerId(newValue?.value || '');
                    setSelectedInvoiceId(''); // Reset factura al cambiar cliente
                    setValue('invoice_id', '');
                  }}
                  options={customers}
                  getOptionLabel={(option) => option.label || ''}
                  disabled={isEdit || isFromInvoice}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Cliente *"
                      placeholder="Buscar cliente..."
                      helperText={
                        isFromInvoice ? 'Cliente determinado por la factura' : 'Seleccione el cliente primero'
                      }
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Iconify icon="solar:user-bold" sx={{ ml: 1, mr: 0.5, color: 'text.disabled' }} />
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.value}>
                      <Stack>
                        <Typography variant="body2">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.id_number}
                        </Typography>
                      </Stack>
                    </li>
                  )}
                />
              </Grid>

              {/* Factura */}
              <Grid item xs={12} md={6}>
                <RHFSelect
                  name="invoice_id"
                  label="Factura *"
                  disabled={!selectedCustomerId || isEdit || isFromInvoice}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  helperText={(() => {
                    if (isFromInvoice) return 'Factura preseleccionada';
                    if (!selectedCustomerId) return 'Primero seleccione un cliente';
                    if (isFetchingInvoices) return 'Cargando facturas...';
                    return 'Seleccione la factura a ajustar';
                  })()}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          zIndex: 9999
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">Seleccionar factura...</MenuItem>
                  {invoicesData?.invoices?.map((invoice) => (
                    <MenuItem key={invoice.id} value={invoice.id}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {invoice.number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • {invoice.issue_date}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                          {fCurrency(parseFloat(invoice.balance_due || invoice.total_amount))}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Alerta informativa sobre factura seleccionada */}
              {selectedInvoice && (
                <Grid item xs={12}>
                  <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">
                        Factura: <strong>{selectedInvoice.number}</strong>
                      </Typography>
                      <Typography variant="caption">
                        Esta nota débito incrementará el saldo pendiente. Saldo actual:{' '}
                        <strong>
                          {fCurrency(parseFloat(selectedInvoice.balance_due || selectedInvoice.total_amount))}
                        </strong>
                      </Typography>
                    </Stack>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Card>

          {/* Paso 2: Información de la Nota Débito */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon="solar:document-text-bold" width={24} />
              Paso 2: Detalles de la Nota Débito
            </Typography>

            <Grid container spacing={3}>
              {/* Tipo */}
              <Grid item xs={12} md={4}>
                <RHFSelect name="type" label="Tipo *" disabled={isEdit}>
                  {DEBIT_NOTE_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {/* Fecha */}
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Fecha de Emisión *"
                  value={values.issue_date}
                  onChange={(newValue) => setValue('issue_date', newValue || new Date())}
                  maxDate={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      helperText: 'La fecha no puede ser futura'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <CostCenterSelectField />
              </Grid>

              {/* Razón */}
              <Grid item xs={12}>
                <RHFTextField
                  name="reason"
                  label="Razón / Motivo *"
                  multiline
                  rows={2}
                  placeholder="Ej: Intereses por mora - 30 días vencidos, Ajuste de precio por error en tarifa"
                  helperText="Explique claramente el motivo de esta nota débito (mínimo 10 caracteres)"
                  error={!!errors.reason}
                />
              </Grid>

              {/* Notas */}
              <Grid item xs={12}>
                <RHFTextField
                  name="notes"
                  label="Notas Adicionales (Opcional)"
                  multiline
                  rows={2}
                  placeholder="Información adicional o comentarios internos"
                />
              </Grid>
            </Grid>
          </Card>

          {/* Line Items */}
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="h6">Líneas de Cobro</Typography>
              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddLineItem}
                variant="outlined"
              >
                Agregar Línea
              </Button>
            </Stack>

            {/* Ayuda según tipo */}
            {currentTypeConfig && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {currentType === 'interest' && (
                  <>
                    <strong>Intereses:</strong> Las líneas representan cargos por mora. Cantidad y precio unitario son
                    opcionales.
                  </>
                )}
                {currentType === 'price_adjustment' && (
                  <>
                    <strong>Ajuste de Precio:</strong> Indique producto, cantidad y diferencia de precio.
                  </>
                )}
                {currentType === 'additional_charge' && (
                  <>
                    <strong>Cargo Adicional:</strong> Puede ser un producto o servicio adicional (flete, seguro, etc).
                  </>
                )}
                {currentType === 'other' && (
                  <>
                    <strong>Otro:</strong> Defina libremente los conceptos de cobro.
                  </>
                )}
              </Alert>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="35%">Producto / Concepto *</TableCell>
                    <TableCell width="10%" align="center">
                      Cantidad
                      {currentTypeConfig?.requiresProducts && ' *'}
                    </TableCell>
                    <TableCell width="12%" align="right">
                      Precio Unit.
                      {currentTypeConfig?.requiresProducts && ' *'}
                    </TableCell>
                    <TableCell width="12%" align="right">
                      Subtotal *
                    </TableCell>
                    <TableCell width="25%">Impuestos</TableCell>
                    <TableCell width="5%" align="center">
                      Total
                    </TableCell>
                    <TableCell width="6%" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.map((item, index) => {
                    const lineTaxTotal = item.line_taxes.reduce((sum, tax) => sum + (tax.tax_amount || 0), 0);
                    const lineTotal = (item.subtotal || 0) + lineTaxTotal;

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            fullWidth
                            size="small"
                            options={products}
                            loading={isFetchingProducts}
                            value={products.find((p) => p.value === item.product_id) || null}
                            onChange={(event, newValue) => {
                              if (newValue && typeof newValue === 'object' && 'value' in newValue) {
                                handleLineItemChange(index, 'product_id', newValue.value);
                                handleLineItemChange(index, 'name', newValue.name);
                                handleLineItemChange(index, 'unit_price', newValue.priceSale || 0);
                                handleLineItemChange(index, 'sku', newValue.sku);
                                handleLineItemChange(index, 'priceSale', newValue.priceSale);

                                // Establecer cantidad en 1 automáticamente
                                handleLineItemChange(index, 'quantity', 1);

                                // Auto-calcular subtotal
                                const price = newValue.priceSale || 0;
                                handleLineItemChange(index, 'subtotal', 1 * price);
                              } else {
                                // Permitir limpiar selección
                                handleLineItemChange(index, 'product_id', null);
                              }
                            }}
                            onInputChange={(event, newInputValue, reason) => {
                              // Actualizar búsqueda solo cuando el usuario escribe
                              if (reason === 'input') {
                                setProductSearchInput(newInputValue);
                              }
                            }}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') return option;
                              return option.label || '';
                            }}
                            filterOptions={(x) => x} // Desactivar filtrado local, usar búsqueda del servidor
                            ListboxProps={{
                              onScroll: (event: React.SyntheticEvent) => {
                                const listboxNode = event.currentTarget;
                                const { scrollTop, scrollHeight, clientHeight } = listboxNode;

                                // Cargar más cuando está cerca del final (80% del scroll)
                                if (scrollTop + clientHeight >= scrollHeight * 0.8 && !isFetchingProducts) {
                                  // Verificar si hay más productos
                                  if (productsData?.hasNext) {
                                    setProductPage((prev) => prev + 1);
                                  }
                                }
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Buscar producto..."
                                required
                                helperText={
                                  item.product_id && item.sku ? (
                                    <Typography variant="caption" color="text.secondary">
                                      SKU: {item.sku} • {fCurrency(item.priceSale || 0)}
                                    </Typography>
                                  ) : undefined
                                }
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {isFetchingProducts && productPage > 1 ? (
                                        <Typography variant="caption" sx={{ mr: 1 }}>
                                          Cargando...
                                        </Typography>
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  )
                                }}
                              />
                            )}
                            renderOption={(props, option) => {
                              if (typeof option === 'string') return null;
                              return (
                                <li {...props} key={option.value}>
                                  <Stack sx={{ width: '100%' }}>
                                    <Typography variant="body2">{option.name}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {option.sku && (
                                        <Typography variant="caption" color="text.secondary">
                                          SKU: {option.sku}
                                        </Typography>
                                      )}
                                      <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                                        {fCurrency(option.priceSale || 0)}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </li>
                              );
                            }}
                            freeSolo
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.quantity || ''}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value, 10) || null;
                              handleLineItemChange(index, 'quantity', qty);
                              // Recalcular subtotal si hay precio
                              if (qty && item.unit_price) {
                                handleLineItemChange(index, 'subtotal', qty * item.unit_price);
                              }
                            }}
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 1, step: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.unit_price || ''}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || null;
                              handleLineItemChange(index, 'unit_price', price);
                              // Recalcular subtotal si hay cantidad
                              if (price && item.quantity) {
                                handleLineItemChange(index, 'subtotal', item.quantity * price);
                              }
                            }}
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0, step: 0.01 }}
                            InputProps={{
                              startAdornment: (
                                <Typography variant="caption" sx={{ mr: 0.5 }}>
                                  $
                                </Typography>
                              )
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.subtotal}
                            onChange={(e) => handleLineItemChange(index, 'subtotal', parseFloat(e.target.value) || 0)}
                            type="number"
                            size="small"
                            fullWidth
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                            InputProps={{
                              startAdornment: (
                                <Typography variant="caption" sx={{ mr: 0.5 }}>
                                  $
                                </Typography>
                              )
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            {item.line_taxes.map((tax, taxIndex) => (
                              <Box
                                key={taxIndex}
                                sx={{
                                  display: 'flex',
                                  gap: 0.5,
                                  alignItems: 'center',
                                  p: 0.5,
                                  bgcolor: 'background.neutral',
                                  borderRadius: 1
                                }}
                              >
                                <TextField
                                  value={tax.tax_name}
                                  onChange={(e) => _handleTaxChange(index, taxIndex, 'tax_name', e.target.value)}
                                  size="small"
                                  placeholder="IVA"
                                  sx={{ minWidth: 60 }}
                                />
                                <TextField
                                  value={tax.tax_rate}
                                  onChange={(e) =>
                                    _handleTaxChange(index, taxIndex, 'tax_rate', parseFloat(e.target.value) || 0)
                                  }
                                  type="number"
                                  size="small"
                                  placeholder="%"
                                  inputProps={{ min: 0, max: 100, step: 0.1 }}
                                  sx={{ width: 70 }}
                                />
                                <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'right' }}>
                                  {fCurrency(tax.tax_amount)}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => handleRemoveTax(index, taxIndex)}>
                                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                </IconButton>
                              </Box>
                            ))}
                            <Button
                              size="small"
                              onClick={() => handleAddTax(index)}
                              startIcon={<Iconify icon="mingcute:add-line" width={16} />}
                              variant="outlined"
                              sx={{ alignSelf: 'flex-start' }}
                            >
                              Agregar Impuesto
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2">{fCurrency(lineTotal)}</Typography>
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
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

            {/* Totales */}
            <Stack spacing={2} alignItems="flex-end">
              <Stack direction="row" spacing={3} sx={{ minWidth: 300 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Subtotal:
                </Typography>
                <Typography variant="subtitle2">{fCurrency(totals.subtotal)}</Typography>
              </Stack>

              <Stack direction="row" spacing={3} sx={{ minWidth: 300 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Impuestos:
                </Typography>
                <Typography variant="subtitle2">{fCurrency(totals.taxAmount)}</Typography>
              </Stack>

              <Stack direction="row" spacing={3} sx={{ minWidth: 300 }}>
                <Typography variant="h6">Total Nota Débito:</Typography>
                <Typography variant="h6" sx={{ color: 'error.main' }}>
                  {fCurrency(totals.total)}
                </Typography>
              </Stack>

              {selectedInvoice && totals.total > 0 && (
                <Alert severity="warning" sx={{ width: '100%', maxWidth: 500 }}>
                  <Typography variant="caption">
                    Nuevo saldo de la factura:{' '}
                    <strong>
                      {fCurrency(
                        parseFloat(selectedInvoice.balance_due || selectedInvoice.total_amount) + totals.total
                      )}
                    </strong>
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Card>

          {/* Acciones */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => router.push(paths.dashboard.debitNotes.root)}
              disabled={isSubmitting || loadingSave.value}
            >
              Cancelar
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={loadingSave.value || isSubmitting}
              startIcon={<Iconify icon="solar:check-circle-bold" />}
            >
              {isEdit ? 'Actualizar Nota Débito' : 'Crear Nota Débito'}
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </>
  );
}
