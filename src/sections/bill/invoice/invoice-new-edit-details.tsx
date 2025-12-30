/* eslint-disable no-else-return */
import sum from 'lodash/sum';
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { inputBaseClasses } from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { fCurrency } from 'src/utils/format-number';
// _mock

// components
import Iconify from 'src/components/iconify';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { enqueueSnackbar } from 'notistack';
import { IconButton, Tooltip } from '@mui/material';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';
import { useGetProductsQuery } from 'src/redux/services/productsApi';

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const values = watch();

  const totalOnRow = (values.items || []).map((item) => Number(item?.quantity ?? 0) * Number(item?.price ?? 0));

  const subTotal = sum(totalOnRow);

  const totalAmount =
    Number(subTotal || 0) -
    Number(values.discount || 0) -
    Number(values.shipping || 0) +
    Number(values.totalTaxes || 0);

  // Get PDVs using RTK Query
  const { data: pdvs = [], isLoading: pdvsLoading, error: pdvsError } = useGetPDVsQuery();

  // Get Products using RTK Query
  const {
    data: productsResponse,
    isLoading: productsLoading,
    error: productsError
  } = useGetProductsQuery({
    page: 1,
    limit: 25,
    is_active: true
  });

  const products = productsResponse?.data || [];

  useEffect(() => {
    console.log('PDVs data:', pdvs, 'Loading:', pdvsLoading, 'Error:', pdvsError);
    console.log('Is pdvs array?', Array.isArray(pdvs));
  }, [pdvs, pdvsLoading, pdvsError]);

  useEffect(() => {
    if (productsError) {
      console.error('Error loading products:', productsError);
      enqueueSnackbar('Error al cargar productos', { variant: 'error' });
    }
  }, [productsError]);

  const [productsOptions, setProductsOptions] = useState<any[]>([]);

  useEffect(() => {
    console.log('Productos activos', products);
    setProductsOptions(products);
  }, [products]);

  useEffect(() => {
    setValue('totalAmount', totalAmount);
  }, [setValue, totalAmount]);

  const handleAdd = () => {
    append({
      title: '',
      description: '',
      reference: '',
      quantity: 1,
      price: 0,
      total: 0,
      taxes: 0,
      // Fields required by Bill form schema
      product_id: '',
      unit_price: 0
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleClearProduct = useCallback(
    (index) => {
      setValue(`items[${index}].quantity`, 1);
      setValue(`items[${index}].price`, 0);
      setValue(`items[${index}].total`, 0);
      setValue(`items[${index}].description`, '');
      setValue(`items[${index}].title`, '');
      setValue(`items[${index}].reference`, '');
      setValue(`items[${index}].taxes`, 0);
      setValue(`items[${index}].product_id`, '');
      setValue(`items[${index}].unit_price`, 0);
      // Agregar opcion al array productsOptions
    },
    [setValue]
  );

  const [PDV, setPDV] = useState(0);

  const handleChangeQuantity = useCallback(
    (event, index) => {
      if (!values.items[index]?.title?.id) {
        enqueueSnackbar('Debes seleccionar un producto primero', { variant: 'warning' });
        return;
      }
      const newQuantity = Number(event.target.value);
      setValue(`items[${index}].quantity`, newQuantity);
      setValue(`items[${index}].total`, newQuantity * Number(values.items[index]?.price ?? 0));
      // multiplicar la cantidad por los impuestos del producto y asignarlo a taxes
      const product = values.items[index]?.title;
      if (product) {
        setValue(
          `items[${index}].taxes`,
          newQuantity * (Number(product.priceSale ?? 0) - Number(product.priceBase ?? 0))
        );
      }
      setValue('totalTaxes', sum(values.items.map((item) => Number(item.taxes ?? 0))));
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      const newPrice = Number(event.target.value);
      setValue(`items[${index}].price`, newPrice);
      setValue(`items[${index}].unit_price`, newPrice);
      setValue(`items[${index}].total`, Number(values.items[index]?.quantity ?? 0) * newPrice);
    },
    [setValue, values.items]
  );

  const renderTotal = (
    <Stack spacing={2} alignItems="flex-end" sx={{ mt: 3, textAlign: 'right', typography: 'body2' }}>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subTotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Costo de envio</Box>
        <Box
          sx={{
            width: 160,
            ...(values.shipping && { color: 'error.main' })
          }}
        >
          {values.shipping ? `- ${fCurrency(values.shipping)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Descuento</Box>
        <Box
          sx={{
            width: 160,
            ...(values.discount && { color: 'error.main' })
          }}
        >
          {values.discount ? `- ${fCurrency(values.discount)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Impuestos</Box>
        <Box sx={{ width: 160 }}>{values.totalTaxes ? fCurrency(values.totalTaxes) : '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  // Nueva logica

  // Obtenemos los productos

  // Función para eliminar etiquetas HTML
  function stripHTMLTags(html) {
    const temporalDiv = document.createElement('div');
    temporalDiv.innerHTML = html;
    return temporalDiv.textContent || temporalDiv.innerText || '';
  }

  const handleSelectProduct = useCallback(
    (index, option) => {
      // TODO: provisional, preguntar si el producto puede estar varias veces
      //  Buscar si ya el producto esta en el array
      const product = values.items.find((item) => item.title?.id === option.id);
      if (product) {
        enqueueSnackbar('Ya agregaste este producto, si deseas puedes aumentar la cantidad', { variant: 'warning' });
        return;
      }

      const quantity = Number(values.items[index]?.quantity ?? 1);
      const price = Number(option.priceSale ?? 0);

      setValue(`items[${index}].title`, option);
      setValue(`items[${index}].product_id`, option.id);
      setValue(`items[${index}].price`, price);
      setValue(`items[${index}].unit_price`, price);
      setValue(`items[${index}].total`, quantity * price);
      setValue(`items[${index}].taxes`, Number(option.priceSale ?? 0) - Number(option.priceBase ?? 0));
      // sumar el total de los impuestos de todos los productos y asignarlo a taxes
      setValue('totalTaxes', sum(values.items.map((item) => Number(item.taxes ?? 0))));
      setValue(`items[${index}].description`, stripHTMLTags(option.description || ''));
      setValue(`items[${index}].reference`, option.sku !== '' ? option.sku : option.barCode);
    },
    [setValue, values.items]
  );

  useEffect(() => {
    console.log(values);
  }, [values]);

  const PDVSoptions = [
    { id: 0, name: 'Puntos De Venta para cada producto' },
    ...(Array.isArray(pdvs) ? pdvs.map((pdv) => ({ id: pdv.id, name: pdv.name })) : [])
  ];
  useEffect(() => {
    console.log(PDV);
  }, [PDV]);

  return (
    <Box sx={{ p: 3 }}>
      {pdvsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Typography>Cargando puntos de venta...</Typography>
        </Box>
      ) : (
        <>
          {/* Dropdown para escoger de que bodega se extraera el producto */}
          <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ maxWidth: '320px' }}>
              <RHFSelect
                name="pdv"
                size="small"
                label="Punto de venta"
                value={PDV}
                InputLabelProps={{ shrink: true }}
                PaperPropsSx={{ textTransform: 'capitalize' }}
                onChange={(event) => setPDV(event.target.value)}
                sx={{
                  minWidth: { md: '350px' },
                  marginBottom: 2,
                  maxWidth: { md: '350px' }
                }}
              >
                {PDVSoptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </RHFSelect>
              <Tooltip title="Selecciona el punto de venta al cual se agregaran los productos">
                <IconButton size="small" sx={{ width: '38px', height: '38px' }}>
                  <Iconify icon="mdi:help-circle-outline" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
              Productos:
            </Typography>
          </Stack>
          <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={2}>
            {fields.map((item, index) => (
              <Stack key={item.id} alignItems="flex-end" spacing={1}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ width: 1 }}>
                  <RHFAutocomplete
                    name={`items[${index}].title`}
                    size="small"
                    label="Producto"
                    placeholder="Nombre, SKU o Código"
                    InputLabelProps={{ shrink: true }}
                    filterOptions={(options, state) => {
                      // Filtrar las opciones por nombre o SKU que coincida con la entrada
                      const inputValue = state.inputValue.toLowerCase();
                      return options.filter(
                        (option) =>
                          option.name.toLowerCase().includes(inputValue) ||
                          option.sku.toLowerCase().includes(inputValue) ||
                          option.barCode.toLowerCase().includes(inputValue)
                      );
                    }}
                    options={productsOptions}
                    onInputChange={(event, value) => console.log(value)}
                    getOptionLabel={(option) => option.name || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    onChange={(event, value) => {
                      if (value !== null) {
                        handleSelectProduct(index, value);
                      } else {
                        handleClearProduct(index);
                      }
                    }}
                    sx={{
                      minWidth: { md: 250 }
                    }}
                  />

                  {PDV === 0 && (
                    <RHFSelect
                      name={`items[${index}].pdv`}
                      size="small"
                      label="Punto de venta"
                      InputLabelProps={{ shrink: true }}
                      PaperPropsSx={{ textTransform: 'capitalize' }}
                      sx={{
                        minWidth: { md: '250px' },
                        marginBottom: 2,
                        maxWidth: { md: '250px' }
                      }}
                    >
                      {Array.isArray(pdvs)
                        ? pdvs.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                              {option.name}
                            </MenuItem>
                          ))
                        : null}
                    </RHFSelect>
                  )}

                  <RHFTextField
                    size="small"
                    name={`items[${index}].reference`}
                    label="Referencia"
                    InputLabelProps={{ shrink: true }}
                  />

                  <RHFTextField
                    type="number"
                    size="small"
                    name={`items[${index}].quantity`}
                    label="Cantidad"
                    placeholder="0"
                    onChange={(event) => handleChangeQuantity(event, index)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ maxWidth: { md: 96 } }}
                  />

                  <RHFTextField
                    size="small"
                    type="number"
                    name={`items[${index}].price`}
                    label="Precio"
                    placeholder="0.00"
                    onChange={(event) => handleChangePrice(event, index)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>$</Box>
                        </InputAdornment>
                      )
                    }}
                    sx={{ maxWidth: { md: 120 } }}
                  />

                  <RHFTextField
                    disabled
                    size="small"
                    type="number"
                    name={`items[${index}].total`}
                    label="Total"
                    placeholder="0.00"
                    value={(() => {
                      const totalVal = Number(values.items?.[index]?.total ?? 0);
                      return !Number.isFinite(totalVal) || totalVal === 0 ? '' : totalVal.toFixed(1);
                    })()}
                    onChange={(event) => handleChangePrice(event, index)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ typography: 'subtitle2', color: 'text.disabled' }}>$</Box>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      maxWidth: { md: 130 },
                      [`& .${inputBaseClasses.input}`]: {
                        textAlign: { md: 'right' }
                      }
                    }}
                  />
                </Stack>

                <Button
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={() => handleRemove(index)}
                >
                  Eliminar
                </Button>
              </Stack>
            ))}
          </Stack>

          <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

          <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-end', md: 'center' }}>
            <Button
              color="primary"
              variant="outlined"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleAdd}
              sx={{ flexShrink: 0 }}
            >
              Agregar producto
            </Button>

            <Stack spacing={2} justifyContent="flex-end" direction={{ xs: 'column', md: 'row' }} sx={{ width: 1 }}>
              <RHFTextField
                size="small"
                label="Envio($)"
                name="shipping"
                type="number"
                sx={{ maxWidth: { md: 120 } }}
              />

              {/* <RHFTextField size="small" label="Impuestos(%)" name="taxes" type="number" sx={{ maxWidth: { md: 120 } }} /> */}
            </Stack>
          </Stack>

          {renderTotal}
        </>
      )}
    </Box>
  );
}
