/* eslint-disable no-else-return */
import sum from 'lodash/sum';
import { useCallback, useEffect, useState } from 'react';
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
import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';

// components
import Iconify from 'src/components/iconify';
import { RHFAutocomplete, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProducts } from 'src/redux/inventory/productsSlice';
import { NumericFormatCustom } from 'src/sections/product/common/NumericFormatCustom';
import { enqueueSnackbar } from 'notistack';
import { IconButton, Select, Tooltip } from '@mui/material';
import { useAuthContext } from 'src/auth/hooks';
import { getAllPDVS } from 'src/redux/inventory/pdvsSlice';

// ----------------------------------------------------------------------

export default function InvoiceNewEditDetails() {
  const { control, setValue, watch, resetField } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const values = watch();

  const totalOnRow = values.items.map((item) => item.quantity * item.price);

  const subTotal = sum(totalOnRow);

  const totalAmount = subTotal - values.discount - values.shipping + values.taxes;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllPDVS());
  }, [dispatch]);

  const { products } = useSelector((state) => state.products);

  const [productsOptions, setProductsOptions] = useState([]);

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
      taxes: 0
    });
  };

  const handleRemove = (index) => {
    remove(index);
  };

  const handleClearService = useCallback(
    (index) => {
      resetField(`items[${index}].quantity`);
      resetField(`items[${index}].price`);
      resetField(`items[${index}].total`);
    },
    [resetField]
  );

  const handleSelectService = useCallback(
    (index, option) => {
      setValue(`items[${index}].price`, INVOICE_SERVICE_OPTIONS.find((service) => service.name === option)?.price);
      setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
    },
    [setValue, values.items]
  );

  const handleClearProduct = useCallback(
    (index) => {
      setValue(`items[${index}].quantity`, 1);
      setValue(`items[${index}].price`, 0);
      setValue(`items[${index}].total`, 0);
      setValue(`items[${index}].description`, '');
      setValue(`items[${index}].title`, '');
      setValue(`items[${index}].reference`, '');
      setValue(`items[${index}].taxes`, 0);
      // Agregar opcion al array productsOptions
    },
    [setValue]
  );

  const [PDV, setPDV] = useState(0);

  const handleChangeQuantity = useCallback(
    (event, index) => {
      if (values.items[index].title.id === undefined) {
        enqueueSnackbar('Debes seleccionar un producto primero', { variant: 'warning' });
        return;
      } else if (PDV === 0) {
        if (
          values.items[index].pdv === undefined ||
          values.items[index].pdv === null ||
          values.items[index].pdv === ''
        ) {
          enqueueSnackbar('Debes seleccionar un punto de venta primero', { variant: 'warning' });
        }
        console.log('todos los productos', products);
        const product = products.find((item) => item.id === values.items[index].title.id);
        const stock = product.productPdv.find((item) => item.pdv.id === values.items[index].pdv);
        console.log('stock', stock);
        if (event.target.value > stock.quantity) {
          enqueueSnackbar('No hay suficiente stock', { variant: 'warning' });
          return;
        }
      } else if (event.target.value > values.items[index].title.quantityStock) {
        enqueueSnackbar('No hay suficiente stock', { variant: 'warning' });
        return;
      }
      setValue(`items[${index}].quantity`, Number(event.target.value));
      setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
      // multiplicar la cantidad por los impuestos del producto y asignarlo a taxes
      setValue(
        `items[${index}].taxes`,
        values.items[index].quantity * (values.items[index].title.priceSale - values.items[index].title.priceBase)
      );
      setValue('taxes', sum(values.items.map((item) => item.taxes)));
    },
    [setValue, values.items, PDV, products]
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
      const product = values.items.find((item) => item.title.id === option.id);
      if (product) {
        enqueueSnackbar('Ya agregaste este producto, si deseas puedes aumentar la cantidad', { variant: 'warning' });
        return;
      }

      setValue(`items[${index}].title`, option);
      setValue(`items[${index}].price`, option.priceSale);
      setValue(`items[${index}].total`, values.items.map((item) => item.quantity * item.price)[index]);
      setValue(`items[${index}].taxes`, option.priceSale - option.priceBase);
      // sumar el total de los impuestos de todos los productos y asignarlo a taxes
      setValue('taxes', sum(values.items.map((item) => item.taxes)));
      setValue(`items[${index}].description`, stripHTMLTags(option.description));
      setValue(`items[${index}].reference`, option.sku !== '' ? option.sku : option.barCode);
    },
    [setValue, values.items]
  );

  useEffect(() => {
    console.log(values);
  }, [values]);

  const { pdvs } = useSelector((state) => state.pdvs);
  const PDVSoptions = [
    { id: 0, name: 'Punto De Venta para cada producto' },
    ...pdvs.map((pdv) => ({ id: pdv.id, name: pdv.name }))
  ];
  useEffect(() => {
    console.log(PDV);
  }, [PDV]);

  return (
    <Box sx={{ p: 3 }}>
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
          <Tooltip title="Selecciona el punto de venta del cual se extraeran los productos">
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
                getOptionSelected={(option, value) => option.name === value.name}
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
                  {/* {pdvs.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))} */}
                  {/* Buscar los pdvs que tenga el producto */}

                  {values.items[index].title.id !== undefined &&
                    values.items[index].title.productPdv.map((pdvObject) => (
                      <MenuItem key={pdvObject.pdv.id} value={pdvObject.pdv.id}>
                        {pdvObject.pdv.name}
                      </MenuItem>
                    ))}
                </RHFSelect>
              )}

              <RHFTextField
                size="small"
                name={`items[${index}].description`}
                label="Description"
                InputLabelProps={{ shrink: true }}
              />

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

          {/* <RHFTextField size="small" label="Impuestos(%)" name="taxes" type="number" sx={{ maxWidth: { md: 120 } }} /> */}
        </Stack>
      </Stack>

      {renderTotal}
    </Box>
  );
}
