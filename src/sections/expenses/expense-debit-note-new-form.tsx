import { useMemo, useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// redux
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import { useGetBillsQuery, useCreateDebitNoteMutation } from 'src/redux/services/billsApi';
import { useProgressiveProducts } from 'src/sections/expenses/hooks/use-progressive-products';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSelect, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { CostCenterSelectField } from 'src/components/cost-center';
import { fCurrency } from 'src/utils/format-number';
//
import AddressListDialog from 'src/sections/address/address-list-dialog';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function ExpenseDebitNoteNewForm() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSave = useBoolean(false);

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const supplierDialog = useBoolean(false);

  // RTK Query
  const { data: allContacts = [] } = useGetContactsQuery({});
  const {
    products: allProducts,
    setSearch: setProductSearch,
    listboxProps: productsListboxProps,
    isFetching: isFetchingProducts
  } = useProgressiveProducts({ limit: 100 });
  const [createDebitNote] = useCreateDebitNoteMutation();

  const suppliers = allContacts.filter((contact: any) => contact.type && contact.type.includes('provider'));

  // Validation schema
  const ExpenseDebitNoteSchema = Yup.object().shape({
    supplier_id: Yup.string().required('El proveedor es requerido'),
    bill_id: Yup.string().nullable(),
    issue_date: Yup.date().required('La fecha es requerida'),
    notes: Yup.string(),
    cost_center_id: Yup.string().nullable(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required('El concepto es requerido'),
          product_id: Yup.string().nullable(),
          quantity: Yup.number().nullable(),
          unit_price: Yup.number().min(0, 'El precio debe ser mayor o igual a 0').required('El precio es requerido'),
          reason_type: Yup.string()
            .oneOf(['price_adjustment', 'quantity_adjustment', 'service'])
            .required('El tipo de ajuste es requerido')
        })
      )
      .min(1, 'Debe agregar al menos un item')
  });

  const defaultValues = useMemo(
    () => ({
      supplier_id: '',
      bill_id: null as string | null,
      issue_date: new Date(),
      notes: '',
      cost_center_id: '',
      items: [
        {
          product_id: null as string | null,
          name: '',
          quantity: 1,
          unit_price: 0,
          reason_type: 'price_adjustment' as 'price_adjustment' | 'quantity_adjustment' | 'service'
        }
      ]
    }),
    []
  );

  const methods = useForm({
    resolver: yupResolver(ExpenseDebitNoteSchema),
    defaultValues
  });

  const { watch, setValue, handleSubmit } = methods;

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'items'
  });

  const values = watch();

  // Get bills filtered by supplier
  const { data: billsData } = useGetBillsQuery(
    {
      limit: 100,
      offset: 0,
      supplier_id: values.supplier_id || undefined,
      status: 'open'
    },
    { skip: !values.supplier_id }
  );

  const bills = useMemo(() => (billsData as any)?.items || [], [billsData]);

  // Update selectedSupplier when supplier_id changes
  useEffect(() => {
    if (values.supplier_id) {
      const supplier = suppliers.find((s: any) => s.id === values.supplier_id);
      setSelectedSupplier(supplier || null);
    } else {
      setSelectedSupplier(null);
    }
  }, [values.supplier_id, suppliers]);

  // Update selectedBill when bill_id changes
  useEffect(() => {
    if (values.bill_id) {
      const bill = bills.find((b: any) => b.id === values.bill_id);
      setSelectedBill(bill || null);
    } else {
      setSelectedBill(null);
    }
  }, [values.bill_id, bills]);

  // Calculate totals
  const totals = useMemo(() => {
    const items = values.items || [];
    const subtotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);

    return {
      subtotal,
      discount: 0,
      total: subtotal
    };
  }, [values.items]);

  const handleAddItem = useCallback(() => {
    append({
      product_id: null,
      name: '',
      quantity: 1,
      unit_price: 0,
      reason_type: 'price_adjustment' as 'price_adjustment' | 'quantity_adjustment' | 'service'
    });
  }, [append]);

  const handleRemoveItem = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove]
  );

  const handleSelectProduct = useCallback(
    (index: number, product: any) => {
      if (product) {
        setValue(`items.${index}.product_id` as const, product.id);
        setValue(`items.${index}.name` as const, product.name);
        setValue(`items.${index}.unit_price` as const, parseFloat(product.cost || product.priceSale || 0));
      }
    },
    [setValue]
  );

  const onSubmit = handleSubmit(async (data) => {
    loadingSave.onTrue();

    try {
      const payload = {
        supplier_id: data.supplier_id,
        bill_id: data.bill_id || undefined,
        issue_date: new Date(data.issue_date).toISOString().split('T')[0],
        notes: data.notes || undefined,
        cost_center_id: data.cost_center_id || undefined,
        items: (data.items || []).map((item: any) => ({
          product_id: item.product_id || undefined,
          name: item.name,
          quantity: item.quantity ? Number(item.quantity) : undefined,
          unit_price: Number(item.unit_price),
          reason_type: item.reason_type
        }))
      };

      await createDebitNote(payload).unwrap();
      enqueueSnackbar('Nota débito creada exitosamente', { variant: 'success' });
      router.push(paths.dashboard.expenses.debitNotes.root);
    } catch (error: any) {
      console.error('Error creating debit note:', error);
      enqueueSnackbar(error?.data?.message || 'Error al crear la nota débito', {
        variant: 'error'
      });
    } finally {
      loadingSave.onFalse();
    }
  });

  const canSave = values.supplier_id && (values.items?.length || 0) > 0;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {/* Bodega y Centro de Costo - Placeholder */}
        <Card sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <RHFSelect name="warehouse" label="Bodega" size="small" sx={{ minWidth: 200 }}>
              <MenuItem value="principal">Principal</MenuItem>
            </RHFSelect>

            <CostCenterSelectField />
          </Stack>
        </Card>

        {/* Card Principal - Proveedor y Fecha */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Header con Logo */}
            <Stack direction="row" spacing={3} alignItems="center">
              <Box
                sx={{
                  width: 120,
                  height: 80,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.disabled'
                }}
              >
                <Typography variant="caption">Usar mi Logo</Typography>
                <Typography variant="caption" sx={{ fontSize: 10 }}>
                  170 x 51
                </Typography>
              </Box>

              <Stack spacing={1} flexGrow={1}>
                <Typography variant="h6">{selectedSupplier?.name || 'Proveedor'}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Nota débito manual
                  </Typography>
                  <Typography variant="body2">No. Prefijo</Typography>
                  <Typography variant="body2">Número</Typography>
                  <IconButton size="small">
                    <Iconify icon="solar:settings-bold" width={18} />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            {/* Proveedor */}
            <Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Proveedor</Typography>
                <IconButton size="small" onClick={supplierDialog.onTrue}>
                  <Iconify icon={selectedSupplier ? 'solar:pen-bold' : 'mingcute:add-line'} width={18} />
                </IconButton>
                {selectedSupplier && (
                  <Tooltip title="Nuevo proveedor">
                    <IconButton size="small" color="primary">
                      <Iconify icon="mingcute:add-line" width={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>

              {selectedSupplier ? (
                <Stack spacing={0.5}>
                  <Typography variant="body2">{selectedSupplier.name}</Typography>
                  {selectedSupplier.document_number && (
                    <Typography variant="caption" color="text.secondary">
                      NIT: {selectedSupplier.document_number}
                    </Typography>
                  )}
                  {selectedSupplier.email && (
                    <Typography variant="caption" color="text.secondary">
                      {selectedSupplier.email}
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="caption" color="error.main">
                  Seleccione un proveedor
                </Typography>
              )}
            </Stack>

            <Stack direction="row" spacing={2}>
              {/* Identificación y Teléfono - Readonly */}
              <RHFTextField
                name="supplier_document"
                label="Identificación"
                size="small"
                disabled
                value={selectedSupplier?.document_number || ''}
                sx={{ flexGrow: 1 }}
              />
              <RHFTextField
                name="supplier_phone"
                label="Teléfono"
                size="small"
                disabled
                value={selectedSupplier?.phone_primary || selectedSupplier?.mobile || ''}
                sx={{ flexGrow: 1 }}
              />
            </Stack>

            {/* Fecha */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <DatePicker
                label="Fecha *"
                value={values.issue_date}
                onChange={(newValue) => setValue('issue_date', newValue || new Date())}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small'
                  }
                }}
                sx={{ maxWidth: 250 }}
              />
            </Stack>
          </Stack>
        </Card>

        {/* Factura Asociada (Opcional) */}
        {selectedSupplier && bills.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">Factura de Compra (Opcional)</Typography>
              <RHFAutocomplete
                name="bill_id"
                label="Seleccionar factura"
                options={bills}
                getOptionLabel={(option: any) =>
                  typeof option === 'string'
                    ? bills.find((b: any) => b.id === option)?.number || option
                    : option.number || ''
                }
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Stack sx={{ width: '100%' }}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">{option.number}</Typography>
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          {fCurrency(parseFloat(option.balance_due || option.total_amount))}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Saldo pendiente
                      </Typography>
                    </Stack>
                  </li>
                )}
                isOptionEqualToValue={(option, value) => option.id === value}
              />
              {selectedBill && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Factura:</strong> {selectedBill.number}
                  </Typography>
                  <br />
                  <Typography variant="caption">
                    Esta nota débito reducirá el saldo pendiente. Saldo actual:{' '}
                    <strong>{fCurrency(parseFloat(selectedBill.balance_due || selectedBill.total_amount))}</strong>
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Card>
        )}

        {/* Tabla de Items */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Conceptos / Items</Typography>
            </Stack>

            <TableContainer>
              <Table>
                <TableBody>
                  {/* Header Row */}
                  <Box
                    component="tr"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 60px',
                      gap: 1,
                      p: 1,
                      bgcolor: 'background.neutral',
                      borderRadius: 1,
                      mb: 1
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      Concepto
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      Precio
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      Desc %
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      Impuesto
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      Cantidad
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      Observaciones
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      Total
                    </Typography>
                  </Box>

                  {/* Items */}
                  {fields.map((field, index) => (
                    <Box
                      key={field.id}
                      component="tr"
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 60px',
                        gap: 1,
                        p: 1,
                        mb: 1,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      {/* Concepto */}
                      <RHFAutocomplete
                        name={`items[${index}].product_id`}
                        label="Seleccionar"
                        size="small"
                        options={allProducts}
                        loading={isFetchingProducts}
                        filterOptions={(x: any) => x}
                        onInputChange={(event: any, value: string) => setProductSearch(value)}
                        ListboxProps={productsListboxProps}
                        getOptionLabel={(option: any) =>
                          typeof option === 'string'
                            ? allProducts.find((p: any) => p.id === option)?.name || option
                            : option.name || ''
                        }
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            <Stack sx={{ width: '100%' }}>
                              <Typography variant="body2">{option.name}</Typography>
                              {option.sku && (
                                <Typography variant="caption" color="text.secondary">
                                  SKU: {option.sku}
                                </Typography>
                              )}
                            </Stack>
                          </li>
                        )}
                        onChange={(event, newValue) => handleSelectProduct(index, newValue)}
                        isOptionEqualToValue={(option, value) =>
                          typeof value === 'string' ? option.id === value : option.id === value?.id
                        }
                        freeSolo
                      />

                      {/* Precio */}
                      <RHFTextField
                        name={`items[${index}].unit_price`}
                        type="number"
                        size="small"
                        placeholder="0"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography variant="caption" color="text.disabled">
                                $
                              </Typography>
                            </InputAdornment>
                          )
                        }}
                      />

                      {/* Descuento % */}
                      <RHFTextField
                        name={`items[${index}].discount`}
                        type="number"
                        size="small"
                        placeholder="0.00"
                        disabled
                      />

                      {/* Impuesto */}
                      <RHFSelect name={`items[${index}].tax`} size="small" disabled defaultValue="ninguno">
                        <MenuItem value="ninguno">Ninguno</MenuItem>
                      </RHFSelect>

                      {/* Cantidad */}
                      <RHFTextField name={`items[${index}].quantity`} type="number" size="small" placeholder="1" />

                      {/* Observaciones */}
                      <RHFTextField name={`items[${index}].notes`} size="small" placeholder="" disabled />

                      {/* Total */}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          {fCurrency(
                            (Number(values.items?.[index]?.quantity) || 0) *
                              (Number(values.items?.[index]?.unit_price) || 0)
                          )}
                        </Typography>
                        {fields.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem(index)}>
                            <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                          </IconButton>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Agregar Línea */}
            <Button
              size="small"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAddItem}
              sx={{ alignSelf: 'flex-start' }}
            >
              Agregar línea
            </Button>
          </Stack>
        </Card>

        {/* Totales y Comentarios */}
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={3} justifyContent="flex-end">
              <Stack spacing={2} sx={{ minWidth: 300 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {fCurrency(totals.subtotal)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Descuento</Typography>
                  <Typography variant="body2">- {fCurrency(totals.discount)}</Typography>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main">
                    {fCurrency(totals.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* Opciones adicionales */}
            <Stack spacing={2}>
              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{ alignSelf: 'flex-start', color: 'info.main' }}
                disabled
              >
                Agregar devolución de dinero
              </Button>

              <Button
                size="small"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{ alignSelf: 'flex-start', color: 'info.main' }}
                disabled
              >
                Agregar factura de compra
              </Button>
            </Stack>

            <Divider />

            {/* Comentarios */}
            <Stack spacing={1}>
              <Typography variant="subtitle2">Comentarios</Typography>
              <RHFTextField
                name="notes"
                multiline
                rows={3}
                placeholder="Escribe un comentario"
                helperText="Utiliza los comentarios para agregar información importante. No son visibles en la impresión."
              />
            </Stack>
          </Stack>
        </Card>

        {/* Botones de Acción */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.expenses.debitNotes.root)}
          >
            Cancelar
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loadingSave.value} disabled={!canSave}>
            Guardar
          </LoadingButton>
        </Stack>
      </Stack>

      {/* Dialog de Selección de Proveedor */}
      <AddressListDialog
        title="Proveedores"
        open={supplierDialog.value}
        onClose={supplierDialog.onFalse}
        selected={(selectedId: string) => values.supplier_id === selectedId}
        onSelect={(contact: any) => {
          setValue('supplier_id', contact.id);
          supplierDialog.onFalse();
        }}
        list={suppliers}
        action={
          <Button
            color="primary"
            size="small"
            startIcon={<Iconify icon="mingcute:add-line" />}
            sx={{ alignSelf: 'flex-end' }}
          >
            Nuevo proveedor
          </Button>
        }
      />
    </FormProvider>
  );
}
