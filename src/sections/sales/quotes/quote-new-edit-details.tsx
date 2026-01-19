import sum from 'lodash/sum';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CircularProgress from '@mui/material/CircularProgress';
// utils
import { fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';
// hooks
import { useProgressiveProducts } from 'src/sections/expenses/hooks/use-progressive-products';

// ----------------------------------------------------------------------

export default function QuoteNewEditDetails() {
  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const values = watch();

  const selectedProductIds = useMemo(() => {
    const ids = (values.items || []).map((item) => item?.product_id).filter(Boolean);
    return new Set<string>(ids);
  }, [values.items]);

  // Obtener productos con scroll infinito
  const {
    products: productsOptions,
    setSearch: setProductSearch,
    isFetching: isFetchingProducts,
    listboxProps: productsListboxProps
  } = useProgressiveProducts({
    limit: 100
  });

  // Cálculos de totales
  const calculateItemTotal = (quantity: number, unit_price: number, discount_percent = 0) => {
    const subtotal = quantity * unit_price;
    const discount = subtotal * (discount_percent / 100);
    return subtotal - discount;
  };

  const itemTotals =
    values.items?.map((item) =>
      calculateItemTotal(item.quantity || 0, item.unit_price || 0, item.discount_percent || 0)
    ) || [];

  const subtotal = sum(itemTotals);
  const total = subtotal;

  useEffect(() => {
    // Actualizar totales de cada item
    values.items?.forEach((item, index) => {
      const itemTotal = calculateItemTotal(item.quantity || 0, item.unit_price || 0, item.discount_percent || 0);
      setValue(`items[${index}].total`, itemTotal);
    });
  }, [values.items, setValue]);

  const handleAdd = () => {
    append({
      product_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      total: 0
    });
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleSelectProduct = useCallback(
    (index: number, option: any) => {
      if (option) {
        setValue(`items[${index}].product_id`, option.id);
        setValue(`items[${index}].description`, option.description || option.name);
        setValue(`items[${index}].unit_price`, option.priceSale || option.price || 0);

        // Calcular total
        const quantity = values.items[index]?.quantity || 1;
        const price = option.priceSale || option.price || 0;
        const discount = values.items[index]?.discount_percent || 0;
        setValue(`items[${index}].total`, calculateItemTotal(quantity, price, discount));
      } else {
        setValue(`items[${index}].product_id`, '');
        setValue(`items[${index}].description`, '');
        setValue(`items[${index}].unit_price`, 0);
        setValue(`items[${index}].total`, 0);
      }
    },
    [setValue, values.items]
  );

  const handleChangeQuantity = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const quantity = parseInt(event.target.value, 10) || 0;
      const price = values.items[index]?.unit_price || 0;
      const discount = values.items[index]?.discount_percent || 0;
      setValue(`items[${index}].quantity`, quantity);
      setValue(`items[${index}].total`, calculateItemTotal(quantity, price, discount));
    },
    [setValue, values.items]
  );

  const handleChangePrice = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const price = parseFloat(event.target.value) || 0;
      const quantity = values.items[index]?.quantity || 0;
      const discount = values.items[index]?.discount_percent || 0;
      setValue(`items[${index}].unit_price`, price);
      setValue(`items[${index}].total`, calculateItemTotal(quantity, price, discount));
    },
    [setValue, values.items]
  );

  const handleChangeDiscount = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const discount = parseFloat(event.target.value) || 0;
      const quantity = values.items[index]?.quantity || 0;
      const price = values.items[index]?.unit_price || 0;
      setValue(`items[${index}].discount_percent`, discount);
      setValue(`items[${index}].total`, calculateItemTotal(quantity, price, discount));
    },
    [setValue, values.items]
  );

  // Helper para obtener producto seleccionado
  const getSelectedProduct = useCallback(
    (productId: string) => {
      if (!productId) return null;
      return productsOptions.find((product) => product.id === productId) || null;
    },
    [productsOptions]
  );

  const getAvailableProductsForRow = useCallback(
    (rowIndex: number) => {
      const currentId = values.items?.[rowIndex]?.product_id;
      return productsOptions.filter((p) => p.id === currentId || !selectedProductIds.has(p.id));
    },
    [productsOptions, selectedProductIds, values.items]
  );

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h6">Productos *</Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="40%">Producto</TableCell>
              <TableCell width="15%">Cantidad</TableCell>
              <TableCell width="15%">Precio</TableCell>
              <TableCell width="15%">Descuento (%)</TableCell>
              <TableCell width="15%">Total</TableCell>
              <TableCell width="50px" />
            </TableRow>
          </TableHead>

          <TableBody>
            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Autocomplete
                    fullWidth
                    options={getAvailableProductsForRow(index)}
                    getOptionLabel={(option) => option.name || ''}
                    value={getSelectedProduct(values.items[index]?.product_id) || null}
                    onChange={(event, newValue) => handleSelectProduct(index, newValue)}
                    onInputChange={(event, newInputValue) => {
                      setProductSearch(newInputValue);
                    }}
                    loading={isFetchingProducts}
                    ListboxProps={productsListboxProps}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Seleccionar producto"
                        size="small"
                        error={!values.items[index]?.product_id}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isFetchingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                  />

                  <RHFTextField
                    size="small"
                    name={`items[${index}].description`}
                    placeholder="Descripción adicional"
                    sx={{ mt: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <RHFTextField
                    size="small"
                    type="number"
                    name={`items[${index}].quantity`}
                    onChange={(e) => handleChangeQuantity(e, index)}
                    inputProps={{ min: 1, step: 1 }}
                  />
                </TableCell>

                <TableCell>
                  <RHFTextField
                    size="small"
                    type="number"
                    name={`items[${index}].unit_price`}
                    onChange={(e) => handleChangePrice(e, index)}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                    }}
                  />
                </TableCell>

                <TableCell>
                  <RHFTextField
                    size="small"
                    type="number"
                    name={`items[${index}].discount_percent`}
                    onChange={(e) => handleChangeDiscount(e, index)}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    InputProps={{
                      endAdornment: <Typography sx={{ ml: 0.5 }}>%</Typography>
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle2">{fCurrency(values.items[index]?.total || 0)}</Typography>
                </TableCell>

                <TableCell align="right">
                  <IconButton color="error" onClick={() => handleRemove(index)} disabled={fields.length === 1}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" justifyContent="flex-start">
        <Button size="small" color="primary" startIcon={<Iconify icon="mingcute:add-line" />} onClick={handleAdd}>
          Agregar Producto
        </Button>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Totales */}
      <Stack spacing={2} alignItems="flex-end">
        <Stack direction="row" spacing={2} sx={{ typography: 'body2', textAlign: 'right' }}>
          <Box sx={{ color: 'text.secondary', width: 160 }}>Subtotal:</Box>
          <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subtotal)}</Box>
        </Stack>

        <Divider sx={{ width: 1 }} />

        <Stack direction="row" spacing={2} sx={{ typography: 'h6', textAlign: 'right' }}>
          <Box sx={{ width: 160 }}>Total:</Box>
          <Box sx={{ width: 160, color: 'primary.main' }}>{fCurrency(total)}</Box>
        </Stack>
      </Stack>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Notas */}
      <Stack spacing={2}>
        <Typography variant="subtitle2">Notas</Typography>
        <RHFTextField name="notes" placeholder="Notas para el cliente (opcional)" multiline rows={3} />

        <Typography variant="subtitle2">Comentarios Internos</Typography>
        <RHFTextField
          name="internal_comments"
          placeholder="Comentarios internos (no visibles para el cliente)"
          multiline
          rows={2}
        />
      </Stack>
    </Stack>
  );
}
