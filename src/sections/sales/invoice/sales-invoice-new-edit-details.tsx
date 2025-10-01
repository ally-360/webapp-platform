/* eslint-disable no-else-return */
import sum from 'lodash/sum';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import { IconButton, Tooltip } from '@mui/material';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
// Redux
import { useGetProductsQuery } from 'src/redux/services/productsApi';
import { useGetPDVsQuery } from 'src/redux/services/pdvsApi';

// ----------------------------------------------------------------------

export default function SalesInvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const values = watch();

  const totalOnRow = values.items?.map((item) => item.quantity * item.price) || [];

  const subTotal = sum(totalOnRow);

  const totalAmount = subTotal - (values.discount || 0) - (values.shipping || 0) + (values.taxes || 0);

  // Get data using RTK Query but keep original logic
  const { data: products = [] } = useGetProductsQuery({
    page: 1,
    limit: 100
  });

  const { data: pdvs = [], isLoading: pdvsLoading, error: pdvsError } = useGetPDVsQuery();

  const [PDV, setPDV] = useState('');

  // Ensure products and PDVs are arrays for options using useMemo
  const productsOptions = useMemo(() => {
    // products is a PaginatedResponse<Product>, so access the data property
    if (products && typeof products === 'object' && 'data' in products && Array.isArray(products.data)) {
      return products.data;
    }
    // Fallback if products is already an array
    if (Array.isArray(products)) {
      return products;
    }
    return [];
  }, [products]);

  const PDVSoptions = Array.isArray(pdvs) ? pdvs : [];

  useEffect(() => {
    console.log('Productos activos', productsOptions);
  }, [productsOptions]);

  useEffect(() => {
    console.log('PDVs data:', pdvs, 'Loading:', pdvsLoading, 'Error:', pdvsError);
    console.log('Is pdvs array?', Array.isArray(pdvs));
  }, [pdvs, pdvsLoading, pdvsError]);

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
      product_id: ''
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleSelectService = useCallback(
    (index, option) => {
      if (option) {
        setValue(`items[${index}].product_id`, option.id);
        setValue(`items[${index}].title`, option.name);
        setValue(`items[${index}].description`, option.description || option.name);
        setValue(`items[${index}].reference`, option.sku);
        setValue(`items[${index}].price`, option.priceSale || 0);
        setValue(`items[${index}].total`, 1 * (option.priceSale || 0));
      } else {
        // Si se limpia la selección, limpiar los campos relacionados
        setValue(`items[${index}].product_id`, '');
        setValue(`items[${index}].title`, '');
        setValue(`items[${index}].description`, '');
        setValue(`items[${index}].reference`, '');
        setValue(`items[${index}].price`, 0);
        setValue(`items[${index}].total`, 0);
      }
    },
    [setValue]
  );

  // Helper function to get the selected product object from the title
  const getSelectedProduct = useCallback(
    (title) => {
      if (!title) return null;
      return productsOptions.find((product) => product.name === title) || null;
    },
    [productsOptions]
  );

  const handleChangeQuantity = useCallback(
    (event, index) => {
      const quantity = parseInt(event.target.value, 10) || 0;
      const price = values.items[index]?.price || 0;
      setValue(`items[${index}].quantity`, quantity);
      setValue(`items[${index}].total`, quantity * price);
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      const price = parseFloat(event.target.value) || 0;
      const quantity = values.items[index]?.quantity || 0;
      setValue(`items[${index}].price`, price);
      setValue(`items[${index}].total`, quantity * price);
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
        <Box sx={{ color: 'text.secondary' }}>Descuento</Box>
        <Box sx={{ width: 160 }}>{values.discount ? fCurrency(-values.discount) : '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Impuestos</Box>
        <Box sx={{ width: 160 }}>{values.taxes ? fCurrency(values.taxes) : '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Envío</Box>
        <Box sx={{ width: 160 }}>{values.shipping ? fCurrency(values.shipping) : '-'}</Box>
      </Stack>

      <Divider />

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  if (pdvsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Typography>Cargando puntos de venta...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Dropdown para escoger punto de venta */}
      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ maxWidth: '320px' }}>
          <RHFSelect
            name="pdv_id"
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
          <Tooltip title="Selecciona el punto de venta">
            <IconButton size="small" sx={{ width: '38px', height: '38px' }}>
              <Iconify icon="mdi:help-circle-outline" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
          Productos:
        </Typography>
      </Stack>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <Autocomplete
                size="small"
                options={productsOptions}
                getOptionLabel={(option) => {
                  // Si option es un string, devolverlo directamente
                  if (typeof option === 'string') return option;
                  // Si option es un objeto, devolver el nombre
                  return option?.name || '';
                }}
                isOptionEqualToValue={(option, value) => {
                  // Si value es null o undefined, comparar con null
                  if (!value) return option === null;
                  // Si value es un string, comparar con el nombre del option
                  if (typeof value === 'string') return option?.name === value;
                  // Si value es un objeto, comparar IDs
                  return option?.id === value?.id;
                }}
                value={getSelectedProduct(values.items?.[index]?.title)}
                onChange={(event, newValue) => handleSelectService(index, newValue)}
                renderInput={(params) => (
                  <RHFTextField
                    {...params}
                    name={`items[${index}].title`}
                    label="Producto"
                    placeholder="Buscar producto..."
                    InputLabelProps={{ shrink: true }}
                  />
                )}
                sx={{ minWidth: { md: 250 } }}
              />

              <RHFTextField
                size="small"
                name={`items[${index}].description`}
                label="Descripción"
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 270 } }}
              />

              <RHFTextField
                size="small"
                name={`items[${index}].reference`}
                label="Referencia"
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 120 } }}
              />

              <RHFTextField
                size="small"
                type="number"
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
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.disabled' }}>
                        $
                      </Box>
                    </InputAdornment>
                  )
                }}
                sx={{ maxWidth: { md: 104 } }}
              />

              <Typography
                variant="h6"
                sx={{
                  color: 'text.disabled',
                  minWidth: 120,
                  textAlign: 'right'
                }}
              >
                {fCurrency(totalOnRow[index] || 0)}
              </Typography>
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
          size="small"
          color="primary"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleAdd}
          sx={{ flexShrink: 0 }}
        >
          Agregar producto
        </Button>

        <Stack spacing={2} justifyContent="flex-end" direction={{ xs: 'column', md: 'row' }} sx={{ width: 1 }}>
          <RHFTextField size="small" label="Notas" name="notes" multiline rows={3} sx={{ maxWidth: { md: 300 } }} />

          <Stack spacing={2} sx={{ minWidth: 200 }}>
            <RHFTextField
              size="small"
              label="Envío"
              name="shipping"
              placeholder="0.00"
              onChange={(event) => setValue('shipping', parseFloat(event.target.value) || 0)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                )
              }}
            />
            <RHFTextField
              size="small"
              label="Descuento"
              name="discount"
              placeholder="0.00"
              onChange={(event) => setValue('discount', parseFloat(event.target.value) || 0)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                )
              }}
            />
            <RHFTextField
              size="small"
              label="Impuestos"
              name="taxes"
              placeholder="0.00"
              onChange={(event) => setValue('taxes', parseFloat(event.target.value) || 0)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      $
                    </Box>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
        </Stack>
      </Stack>

      {renderTotal}
    </Box>
  );
}
