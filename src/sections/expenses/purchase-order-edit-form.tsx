import { useMemo, useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';

// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// redux
import { useGetContactsQuery } from 'src/redux/services/contactsApi';
import type { PurchaseOrderDetail } from 'src/redux/services/billsApi';
import { useUpdatePurchaseOrderMutation } from 'src/redux/services/billsApi';
import { useGetPDVsQuery } from 'src/redux/services/catalogApi';

// components
import Iconify from 'src/components/iconify';
import CompanyLogo from 'src/components/company-logo';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { fCurrency } from 'src/utils/format-number';

import AddressListDialog from 'src/sections/address/address-list-dialog';
import { useProgressiveProducts } from 'src/sections/expenses/hooks/use-progressive-products';

type Props = {
  id: string;
  currentPO: PurchaseOrderDetail;
};

type FormValues = {
  supplier_id: string;
  pdv_id: string;
  issue_date: Date;
  expected_delivery_date: Date | null;
  currency: string;
  notes: string;
  payment_terms: string;
  terms_and_conditions: string;
  items: Array<{
    product: any;
    quantity: number;
    unit_price: number;
  }>;
};

export default function PurchaseOrderEditForm({ id, currentPO }: Props) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const loadingSave = useBoolean(false);

  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const supplierDialog = useBoolean(false);

  const { data: allContacts = [] } = useGetContactsQuery({});
  const { data: allPDVs = [] } = useGetPDVsQuery();
  const suppliers = allContacts.filter((contact: any) => contact.type && contact.type.includes('provider'));

  const {
    products: allProducts,
    setSearch: setProductSearch,
    listboxProps: productsListboxProps,
    isFetching: isFetchingProducts
  } = useProgressiveProducts({ limit: 100 });

  const [updatePurchaseOrder] = useUpdatePurchaseOrderMutation();

  const canEdit = currentPO.status === 'draft' || currentPO.status === 'sent';

  const schema = Yup.object().shape({
    supplier_id: Yup.string().required('El proveedor es requerido'),
    pdv_id: Yup.mixed().required('El punto de venta es requerido'),
    issue_date: Yup.date().required('La fecha de emisión es requerida'),
    expected_delivery_date: Yup.date().nullable(),
    currency: Yup.string().required('La moneda es requerida'),
    notes: Yup.string(),
    payment_terms: Yup.string(),
    terms_and_conditions: Yup.string(),
    items: Yup.array()
      .of(
        Yup.object().shape({
          product: Yup.mixed().required('El producto es requerido'),
          quantity: Yup.number().min(1, 'La cantidad debe ser mayor a 0').required('La cantidad es requerida'),
          unit_price: Yup.number().min(0, 'El precio debe ser mayor o igual a 0').required('El precio es requerido')
        })
      )
      .min(1, 'Debe agregar al menos un producto')
  });

  const defaultValues: FormValues = useMemo(
    () => ({
      supplier_id: currentPO.supplier_id || '',
      pdv_id: allPDVs.find((p: any) => p.id === currentPO.pdv_id) || null,
      issue_date: currentPO.issue_date ? new Date(currentPO.issue_date) : new Date(),
      expected_delivery_date: currentPO.expected_delivery_date ? new Date(currentPO.expected_delivery_date) : null,
      currency: currentPO.currency || 'COP',
      notes: currentPO.notes || '',
      payment_terms: currentPO.payment_terms || '',
      terms_and_conditions: currentPO.terms_and_conditions || '',
      items: (currentPO.items || []).map((it: any) => ({
        product: {
          id: it.product_id,
          name: it.name || it.product?.name || 'Producto',
          sku: it.product?.sku
        },
        quantity: Number(it.quantity || 0) || 1,
        unit_price: Number(it.unit_price || 0)
      }))
    }),
    [currentPO, allPDVs]
  );

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues
  });

  const { watch, setValue, handleSubmit, reset } = methods;

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'items'
  });

  const values = watch();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (values.supplier_id) {
      const supplier = suppliers.find((s: any) => s.id === values.supplier_id);
      setSelectedSupplier(supplier || null);
    } else {
      setSelectedSupplier(null);
    }
  }, [values.supplier_id, suppliers]);

  const totals = useMemo(() => {
    const items = values.items || [];
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      return sum + quantity * price;
    }, 0);

    return { subtotal, taxes: 0, total: subtotal };
  }, [values.items]);

  const handleSelectSupplier = useCallback(
    (supplier: any) => {
      setValue('supplier_id', supplier.id);
      setSelectedSupplier(supplier);
      supplierDialog.onFalse();
    },
    [setValue, supplierDialog]
  );

  const handleSelectProduct = useCallback(
    (index: number, product: any) => {
      setValue(`items.${index}.product` as const, product ?? null);

      if (product) {
        const price = Number(product.cost || product.priceSale || 0);
        setValue(`items.${index}.unit_price` as const, price);
      } else {
        setValue(`items.${index}.unit_price` as const, 0);
      }
    },
    [setValue]
  );

  const handleAddItem = useCallback(() => {
    append({
      product: null,
      quantity: 1,
      unit_price: 0
    });
  }, [append]);

  const onSubmit = handleSubmit(async (data) => {
    if (!canEdit) return;

    loadingSave.onTrue();

    try {
      const payload = {
        supplier_id: data.supplier_id,
        pdv_id: typeof data.pdv_id === 'string' ? data.pdv_id : data.pdv_id?.id,
        issue_date: data.issue_date.toISOString().split('T')[0],
        expected_delivery_date: data.expected_delivery_date
          ? data.expected_delivery_date.toISOString().split('T')[0]
          : undefined,
        currency: data.currency,
        notes: data.notes || undefined,
        payment_terms: data.payment_terms || undefined,
        terms_and_conditions: data.terms_and_conditions || undefined,
        items: (data.items || []).map((item) => ({
          product_id: item.product?.id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        }))
      };

      await updatePurchaseOrder({ id, po: payload }).unwrap();
      enqueueSnackbar('Orden de compra actualizada exitosamente', { variant: 'success' });
      router.push(paths.dashboard.expenses.purchaseOrders.details(id));
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al actualizar la orden de compra', { variant: 'error' });
    } finally {
      loadingSave.onFalse();
    }
  });

  const canSave =
    canEdit &&
    !!values.supplier_id &&
    !!values.pdv_id &&
    !!values.currency &&
    (values.items?.length || 0) > 0 &&
    (values.items || []).every((item: any) => !!item?.product);

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3}>
        {!canEdit && (
          <Alert severity="warning">
            Esta orden está en estado <strong>{currentPO.status}</strong> y no se puede editar.
          </Alert>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CompanyLogo width={120} height={80} disabledLink />

              <Stack spacing={1} flexGrow={1}>
                <Typography variant="h6">Editar Orden de Compra</Typography>
                <Typography variant="body2" color="text.secondary">
                  Orden #{currentPO.order_number || id.substring(0, 8)} - Estado: {currentPO.status}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6">{selectedSupplier?.name || 'Seleccionar Proveedor'}</Typography>
                <IconButton size="small" onClick={supplierDialog.onTrue} disabled={!canEdit}>
                  <Iconify icon={selectedSupplier ? 'solar:pen-bold' : 'mingcute:add-line'} width={18} />
                </IconButton>
              </Stack>

              {selectedSupplier && (
                <Stack spacing={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>NIT:</strong> {selectedSupplier.identification || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {selectedSupplier.email || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Teléfono:</strong> {selectedSupplier.phone || 'N/A'}
                  </Typography>
                </Stack>
              )}

              <RHFAutocomplete
                name="pdv_id"
                label="Punto de Venta (PDV) *"
                placeholder="Seleccionar punto de venta"
                options={allPDVs}
                getOptionLabel={(option: any) => option?.name || ''}
                isOptionEqualToValue={(option: any, value: any) => option?.id === value?.id}
                renderOption={(props, option: any) => (
                  <li {...props} key={option.id}>
                    <Stack>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.address}
                      </Typography>
                    </Stack>
                  </li>
                )}
                disabled={!canEdit}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <DatePicker
                  label="Fecha de Emisión *"
                  value={values.issue_date}
                  onChange={(newValue) => setValue('issue_date', newValue || new Date())}
                  disabled={!canEdit}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !values.issue_date,
                      disabled: !canEdit
                    }
                  }}
                />

                <DatePicker
                  label="Fecha de Entrega Esperada"
                  value={values.expected_delivery_date}
                  onChange={(newValue) => setValue('expected_delivery_date', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      disabled: !canEdit
                    }
                  }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <RHFTextField
                  name="pdv_id"
                  label="Punto de Venta (PDV) *"
                  placeholder="ID del punto de venta"
                  helperText="Ingrese el ID del punto de venta donde se recibirá la orden"
                  disabled={!canEdit}
                />

                <RHFTextField name="currency" label="Moneda *" placeholder="COP" disabled={!canEdit} />
              </Stack>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Nota:</strong> La orden de compra es un documento de control que no genera movimientos en
                  inventario ni en cuentas contables. Indica las cantidades solicitadas y pendientes por recibir.
                </Typography>
              </Alert>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Productos a Ordenar</Typography>

            <Stack spacing={2}>
              <Grid container spacing={2} sx={{ px: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Producto *</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Cantidad *</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Precio Unitario *</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2">Subtotal</Typography>
                </Grid>
                <Grid item xs={6} md={2}>
                  <Typography variant="subtitle2" align="right">
                    Acciones
                  </Typography>
                </Grid>
              </Grid>

              <Divider />

              {fields.map((item, index) => {
                const quantity = Number(values.items?.[index]?.quantity) || 0;
                const price = Number(values.items?.[index]?.unit_price) || 0;
                const lineTotal = quantity * price;

                return (
                  <Grid container spacing={2} key={item.id} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <RHFAutocomplete
                        name={`items[${index}].product`}
                        placeholder="Buscar producto..."
                        options={allProducts}
                        loading={isFetchingProducts}
                        filterOptions={(x: any) => x}
                        onInputChange={(event: any, value: string) => setProductSearch(value)}
                        ListboxProps={productsListboxProps}
                        getOptionLabel={(option: any) => option?.name || ''}
                        isOptionEqualToValue={(option: any, value: any) => option.id === value?.id}
                        onChange={(event, newValue) => handleSelectProduct(index, newValue)}
                        renderOption={(props, option: any) => (
                          <li {...props} key={option.id}>
                            <Stack>
                              <Typography variant="body2">{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                SKU: {option.sku || 'N/A'} | Stock: {option.stock || 0}
                              </Typography>
                            </Stack>
                          </li>
                        )}
                        sx={{ minWidth: 200 }}
                        disabled={!canEdit}
                      />
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <RHFTextField
                        name={`items[${index}].quantity`}
                        type="number"
                        placeholder="1"
                        disabled={!canEdit}
                        InputProps={{
                          inputProps: { min: 1, step: 1 }
                        }}
                      />
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <RHFTextField
                        name={`items[${index}].unit_price`}
                        type="number"
                        placeholder="0.00"
                        disabled={!canEdit}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          inputProps: { min: 0, step: 0.01 }
                        }}
                      />
                    </Grid>

                    <Grid item xs={6} md={2}>
                      <Typography variant="body2" fontWeight={600}>
                        {fCurrency(lineTotal)}
                      </Typography>
                    </Grid>

                    <Grid item xs={6} md={2} sx={{ textAlign: 'right' }}>
                      {fields.length > 1 && canEdit && (
                        <IconButton size="small" color="error" onClick={() => remove(index)}>
                          <Iconify icon="solar:trash-bin-trash-bold" />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                );
              })}

              <Button
                size="small"
                color="primary"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleAddItem}
                sx={{ alignSelf: 'flex-start' }}
                disabled={!canEdit}
              >
                Agregar Producto
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Términos y Condiciones</Typography>

            <RHFTextField
              name="payment_terms"
              label="Términos de Pago"
              placeholder="Ej: Pago a 30 días"
              multiline
              rows={2}
              disabled={!canEdit}
            />

            <RHFTextField
              name="terms_and_conditions"
              label="Términos y Condiciones"
              placeholder="Especifique las condiciones de la orden..."
              multiline
              rows={3}
              disabled={!canEdit}
            />

            <RHFTextField
              name="notes"
              label="Notas Adicionales"
              placeholder="Observaciones o notas internas..."
              multiline
              rows={3}
              disabled={!canEdit}
            />
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Subtotal:</Typography>
              <Typography variant="body2">{fCurrency(totals.subtotal)}</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2">Impuestos:</Typography>
              <Typography variant="body2">{fCurrency(totals.taxes)}</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary.main">
                {fCurrency(totals.total)}
              </Typography>
            </Stack>
          </Stack>
        </Card>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            size="large"
            variant="outlined"
            color="inherit"
            onClick={() => router.push(paths.dashboard.expenses.purchaseOrders.details(id))}
          >
            Cancelar
          </Button>

          <LoadingButton size="large" type="submit" variant="contained" loading={loadingSave.value} disabled={!canSave}>
            Guardar Cambios
          </LoadingButton>
        </Stack>
      </Stack>

      <AddressListDialog
        open={supplierDialog.value}
        onClose={supplierDialog.onFalse}
        selected={(value: string) => `${value}` === `${values.supplier_id}`}
        onSelect={handleSelectSupplier}
        list={suppliers}
        title="Seleccionar Proveedor"
      />
    </FormProvider>
  );
}
