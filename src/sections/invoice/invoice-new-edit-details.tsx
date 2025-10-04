import sum from 'lodash/sum';
import { useCallback, useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { inputBaseClasses } from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
// utils
import { fCurrency } from 'src/utils/format-number';
// _mock
// import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';

// components
import Iconify from 'src/components/iconify';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { getAllProducts } from 'src/redux/inventory/productsSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails() {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const values = watch();

  const totalOnRow = values.items.map((item) => item.quantity * item.price);

  const subTotal = sum(totalOnRow);

  const totalAmount = subTotal - values.discount - values.shipping + values.taxes;

  useEffect(() => {
    setValue('totalAmount', totalAmount);
  }, [setValue, totalAmount]);

  const handleAdd = () => {
    append({
      title: '',
      description: '',
      service: '',
      quantity: 1,
      price: 0,
      total: 0,
      taxes: 0
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  // const handleClearService = useCallback(
  //   (index) => {
  //     resetField(`items[${index}].quantity`);
  //     resetField(`items[${index}].price`);
  //     resetField(`items[${index}].total`);
  //   },
  //   [resetField]
  // );

  // const handleSelectService = useCallback(
  //   (index, option) => {
  //     setValue(`items[${index}].price`, INVOICE_SERVICE_OPTIONS.find((service) => service.name === option)?.price);
  //     setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
  //   },
  //   [setValue, values.items]
  // );

  const handleChangeQuantity = useCallback(
    (event, index) => {
      setValue(`items[${index}].quantity`, Number(event.target.value));
      setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event, index) => {
      setValue(`items[${index}].price`, Number(event.target.value));
      setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
      // setValue('taxes', )
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
        <Box sx={{ color: 'text.secondary' }}>Shipping</Box>
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
        <Box sx={{ color: 'text.secondary' }}>Discount</Box>
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
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{values.taxes ? fCurrency(values.taxes) : '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <Box>Total</Box>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  // Nueva logica

  // Obtenemos los productos

  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      dispatch(getAllProducts({ page: 1, pageSize: 25 }));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }, [dispatch]);

  const { products, productsLoading } = useAppSelector((state) => state.products);

  // Ensure products is always an array
  const productsOptions = Array.isArray(products) ? products : [];

  useEffect(() => {
    console.log('Products:', products, 'Array?', Array.isArray(products), 'Loading:', productsLoading);
  }, [products, productsLoading]);

  // Función para eliminar etiquetas HTML
  function stripHTMLTags(html) {
    const temporalDiv = document.createElement('div');
    temporalDiv.innerHTML = html;
    return temporalDiv.textContent || temporalDiv.innerText || '';
  }

  const handleSelectProduct = useCallback(
    (index, option) => {
      setValue(`items[${index}].title`, option);
      setValue(`items[${index}].price`, option.priceSale);
      setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
      setValue(`taxes`, values.taxes + (option.priceSale - option.priceBase));
      setValue(`items[${index}].description`, stripHTMLTags(option.description));
    },
    [setValue, values.items, values.taxes]
  );

  useEffect(() => {
    console.log(values);
  }, [values]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
        Productos:
      </Typography>

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Stack key={item.id} alignItems="flex-end" spacing={1.5}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: 1 }}>
              <RHFAutocomplete
                name={`items[${index}].title`}
                size="small"
                label="Producto"
                InputLabelProps={{ shrink: true }}
                options={productsOptions}
                loading={productsLoading}
                onInputChange={(event, value) => console.log(value)}
                getOptionLabel={(option) => option.name || ''}
                getOptionSelected={(option, value) => option.name === value.name}
                onChange={(event, value) => handleSelectProduct(index, value)}
                sx={{
                  minWidth: { md: 250 }
                }}
              />

              <RHFTextField
                size="small"
                name={`items[${index}].description`}
                label="Description"
                InputLabelProps={{ shrink: true }}
              />

              {/* <RHFSelect
                name={`items[${index}].service`}
                size="small"
                label="Service"
                InputLabelProps={{ shrink: true }}
                sx={{
                  maxWidth: { md: 160 }
                }}
              >
                <MenuItem
                  value=""
                  onClick={() => handleClearService(index)}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  None
                </MenuItem>

                <Divider sx={{ borderStyle: 'dashed' }} />

                {INVOICE_SERVICE_OPTIONS.map((service) => (
                  <MenuItem
                    key={service.id}
                    value={service.name}
                    onClick={() => handleSelectService(index, service.name)}
                  >
                    {service.name}
                  </MenuItem>
                ))}
              </RHFSelect> */}

              <RHFTextField
                type="number"
                size="small"
                name={`items[${index}].quantity`}
                label="Quantity"
                placeholder="0"
                onChange={(event) => handleChangeQuantity(event, index)}
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: { md: 96 } }}
              />

              <RHFTextField
                size="small"
                type="number"
                name={`items[${index}].price`}
                label="Price"
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
                value={values.items[index].total === 0 ? '' : values.items[index].total.toFixed(1)}
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
          <RHFTextField size="small" label="Envio($)" name="shipping" type="number" sx={{ maxWidth: { md: 120 } }} />

          <RHFTextField
            size="small"
            label="Descuento($)"
            name="discount"
            type="number"
            sx={{ maxWidth: { md: 120 } }}
          />

          <RHFTextField size="small" label="Impuestos(%)" name="taxes" type="number" sx={{ maxWidth: { md: 120 } }} />
        </Stack>
      </Stack>

      {renderTotal}
    </Box>
  );
}
