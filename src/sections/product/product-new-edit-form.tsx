import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, {
  RHFEditor,
  RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFAutocomplete,
  RHFSelect
} from 'src/components/hook-form';
import {
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Zoom
} from '@mui/material';
import { Icon } from '@iconify/react';
import { getCategories, switchPopupState } from 'src/redux/inventory/categoriesSlice';
import { switchPopupState as switchPopupStateBrand, getBrands } from 'src/redux/inventory/brandsSlice';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useTheme } from '@emotion/react';
import MenuCategories from 'src/sections/categories/MenuCategories';
import { setPopupAssignInventory } from 'src/redux/inventory/productsSlice';
import PopupAssingInventory from 'src/sections/product/PopupAssignInventory';
import { NewProductSchema } from 'src/interfaces/inventory/productsSchemas';
import { NewProductInterface, PDVproduct, getProductResponse } from 'src/interfaces/inventory/productsInterface';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { fNumber } from 'src/utils/format-number';
import ButtonAutocomplete from './common/ButtonAutocomplete';
import RequestService from '../../axios/services/service';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }: { currentProduct: getProductResponse }) {
  const router = useRouter();
  const mdUp = useResponsive('up', 'md', true);

  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const TAXES_OPTIONS = useMemo(
    () => [
      { value: 0, label: '0%' },
      { value: 5, label: '5%' },
      { value: 10, label: '10%' },
      { value: 15, label: '15%' },
      { value: 19, label: '19%' }
    ],
    []
  );

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      description: currentProduct?.description || '',
      typeProduct: currentProduct?.typeProduct || 1,
      images: currentProduct?.images || [
        'https://media.istockphoto.com/id/499208007/es/foto/coca-cola-cl%C3%A1sica-en-un-frasco-de-vidrio.jpg?s=612x612&w=0&k=20&c=4n-_VfFOTAzahIon4E6jCcd26-gs01in17JKbDQ2PTg='
      ],
      //
      barCode: currentProduct?.barCode || '',
      sku: currentProduct?.sku || '',
      priceBase: currentProduct?.priceBase || '',
      priceSale: currentProduct?.priceSale || '',
      taxesOption: currentProduct?.taxesOption || 0,
      productsPdvs:
        currentProduct?.productPdv.map((item) => ({
          pdv: item.pdv.name,
          id: item.pdv.id,
          quantity: item.quantity,
          minQuantity: item.minQuantity
        })) || [],
      quantityStock: currentProduct?.quantityStock || 0,

      brand: currentProduct?.brand.id || '',
      state: currentProduct?.state || true,
      sellInNegative: currentProduct?.sellInNegative || false,

      category: currentProduct?.category || ''
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
    defaultValues
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = methods;

  const values = watch();

  useEffect(() => {
    console.log('values', values);
    console.log('errors', errors);
  }, [values, errors]);
  const [selectedOptionBrand, setSelectedOptionBrand] = useState('');
  const [selectedOptionCategory, setSelectedOptionCategory] = useState(''); // Nuevo estado para almacenar la opción seleccionada}
  const [searchQueryBrand, setSearchQueryBrand] = useState('');

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
      handleBrandSelect(null, currentProduct.brand);
      handleCategorySelect(null, currentProduct.category);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (includeTaxes) {
      setValue('taxesOption', 0);
    } else {
      setValue('taxesOption', currentProduct?.taxesOption || 0);
    }
  }, [currentProduct?.taxesOption, includeTaxes, setValue]);

  const onSubmit = handleSubmit(async (data: NewProductInterface) => {
    const lastProductsPdvs = data.productsPdvs;
    const priceBase = data.priceBase.replace(/[^0-9.-]+/g, '');
    const priceSale = data.priceSale.replace(/[^0-9.-]+/g, '');

    try {
      setValue('quantityStock', data.productsPdvs.reduce((acc: number, pdv: PDVproduct) => acc + pdv.quantity, 0) || 0);
      // Cambiar en todos los pdvs el pdv por el id del pdv y dejar el minQuantity y quantity
      // remover las comas del precio

      data.priceBase = priceBase;
      data.priceSale = priceSale;
      data.productsPdvs = data.productsPdvs.map((pdv: PDVproduct) => ({
        pdv: pdv.id,
        minQuantity: pdv.minQuantity,
        quantity: pdv.quantity
      }));
      if (currentProduct) {
        // TODO BACKEND: el patch da error
        await RequestService.updateProduct({ id: currentProduct.id, databody: data });
        enqueueSnackbar('Se ha editado correctamente!');
        router.push(paths.dashboard.product.root);
        reset();
        return;
      }
      await RequestService.createProduct(data);
      reset();
      enqueueSnackbar(currentProduct ? 'Se ha editado correctamente!' : 'Creación exitosa!');
      router.push(paths.dashboard.product.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Error al crear el producto', { variant: 'error' });
      data.productsPdvs = lastProductsPdvs;
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const files = values.images || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );

      setValue('images', [...files, ...newFiles], { shouldValidate: true });
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);
  const upMd = useResponsive('up', 'md');

  // Autocomplete category

  const handleClickOpenPopupCategory = () => {
    dispatch(switchPopupState(false));
  };

  const [searchQueryCategory, setSearchQueryCategory] = useState('');

  const handleCategorySelect = (event, option) => {
    setSelectedOptionCategory(option); // Actualizar el estado con la opción seleccionada
    setValue('category', option?.id);
  };

  const handleInputCategoryChange = (event, value) => {
    setSearchQueryCategory(value);
  };

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const isOptionEqualToValue = (option, value) => {
    if (option && value) {
      return option.id === value.id && option.name === value.name;
    }
    return false;
  };

  const theme = useTheme();

  const { categories, isEmpty } = useAppSelector((state) => state.categories);
  const isLoadingCategories = useAppSelector((state) => state.categories.isLoading);
  // Autocomplete brand

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);
  const { brands, brandsEmpty, isLoading } = useAppSelector((state) => state.brands);

  const handleInputBrandChange = (event, value) => {
    setSearchQueryBrand(value);
  };

  const handleBrandSelect = (event, option) => {
    setSelectedOptionBrand(option); // Actualizar el estado con la opción seleccionada
    setValue('brand', option?.id);
  };

  const handleClickOpenPopupBrand = () => {
    dispatch(switchPopupStateBrand(false));
  };
  const priceBase = watch('priceBase');
  const tax = watch('taxesOption');
  // TaxesOption
  // useEffect(() => {
  //   if (tax === 0) {
  //     setValue('priceSale', priceBase);
  //     return;
  //   }
  //   if (priceBase && tax) {
  //     // si es 0 no se le agrega impuesto
  //     console.log('priceBase', priceBase);

  //     console.log('tax', tax);
  //     const priceBaseNumber = Number(priceBase.replace(/[^0-9.-]+/g, ''));
  //     const taxAmount = priceBaseNumber * (tax / 100);
  //     console.log('taxAmount', taxAmount);
  //     const priceSale = priceBaseNumber + taxAmount;
  //     console.log('priceBaseNumber', priceBaseNumber);
  //     console.log('priceSale', priceSale);
  //     setValue('priceSale', fNumber(priceSale));
  //   }
  // }, [priceBase, tax, setValue]);
  // Assign inventory

  // Edit inventory

  const [pdvEdit, setPdvEdit] = useState<PDVproduct | null>(null);

  const handleEditInventory = (pdv: PDVproduct, quantity: number, minQuantity: number) => {
    const newPdv = values.productsPdvs.map((item: PDVproduct) => {
      if (item.id === pdv.id) {
        return {
          ...item,
          quantity,
          minQuantity
        };
      }
      if (pdvEdit) {
        if (item.id === pdvEdit.id) {
          return {
            pdv: pdv.name,
            id: pdv.id,
            quantity,
            minQuantity
          };
        }
      }

      return item;
    });
    setValue('productsPdvs', newPdv);
    setPdvEdit(null);
  };

  // Popup to assign inventory
  const handleAssignInventory = (pdv: PDVproduct, quantity: number, minQuantity: number, edit: boolean) => {
    console.log('pdv', pdv);
    if (edit) {
      handleEditInventory(pdv, quantity, minQuantity);
      dispatch(setPopupAssignInventory(false));

      return true;
    }
    if (values.productsPdvs.some((item: PDVproduct) => item.id === pdv.id)) {
      enqueueSnackbar(`El punto de venta ${pdv.name} ya esta seleccionada, asignale una cantidad editandola.`, {
        variant: 'warning'
      });
      return false;
    }
    setValue('productsPdvs', [
      ...values.productsPdvs,
      {
        pdv: pdv.name,
        id: pdv.id,
        quantity,
        minQuantity
      }
    ]);
    enqueueSnackbar(`El punto de venta ${pdv.name} fue asignado correctamente.`, {
      variant: 'success'
    });
    dispatch(setPopupAssignInventory(false));
    return true;
  };

  const setAssignWarehouse = () => {
    setPdvEdit(null);
    dispatch(setPopupAssignInventory(true));
  };

  // useEffect(() => {
  //   dispatch(switchPopup());
  // }, [dispatch]);

  const renderDetails = (
    <Grid xs={12} md={8}>
      <Card sx={{ p: 3, overflow: 'visible', zIndex: 99 }}>
        <Typography variant="h4">Información general</Typography>
        <Divider sx={{ mb: 3, mt: 0.5 }} />

        <Stack spacing={3}>
          <RHFTextField name="name" label="Nombre del producto" />
          <Stack flexDirection="row" sx={{ flexDirection: { xs: 'column', md: 'row' } }} gap={2}>
            <RHFTextField
              name="barCode"
              label="Código de barras"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Escanear sku" TransitionComponent={Zoom} arrow>
                      <IconButton
                        onClick={() => {
                          console.log('Hola');
                        }}
                      >
                        <Icon icon="carbon:scan" width={30} height={30} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />

            <RHFTextField
              name="sku"
              label="SKU"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title="(opcional) es el código interno que cada negocio crea por sí mismo para sus productos"
                      TransitionComponent={Zoom}
                      arrow
                    >
                      <IconButton>
                        <Icon icon="ph:question" width={30} height={30} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
          </Stack>
          <Stack flexDirection="row" sx={{ flexDirection: { xs: 'column', md: 'row' } }} gap={2}>
            <RHFAutocomplete
              fullWidth
              name="category"
              label="Categoria"
              value={selectedOptionCategory}
              getOptionLabel={(option) => (option.name ? option.name : '')}
              options={categories}
              inputValue={searchQueryCategory}
              onInputChange={handleInputCategoryChange}
              onChange={handleCategorySelect}
              isOptionEqualToValue={isOptionEqualToValue}
              loading={isLoadingCategories}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Categoria"
                  // set error
                  error={errors.category}
                  helperText={errors.category?.message}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          component={Icon}
                          icon="carbon:search"
                          sx={{
                            ml: 1,
                            width: 20,
                            height: 20,
                            color: 'text.disabled'
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => {
                const matches = match(option.name, searchQueryCategory);
                const parts = parse(option.name, matches);

                return (
                  <li {...props}>
                    <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.primary">
                        {parts.map((part, index) => (
                          <span
                            key={index}
                            style={{
                              fontWeight: part.highlight ? 700 : 400,
                              color: part.highlight ? theme.palette.primary.main : 'inherit'
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText={
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                  {isLoadingCategories && 'Cargando...'}
                  {isEmpty && !isLoadingCategories && 'No hay marcas registradas'}
                  {!isLoadingCategories &&
                    !isEmpty &&
                    searchQueryCategory &&
                    `No se encontraron resultados ${searchQueryCategory}`}
                </Typography>
              }
              PaperComponent={({ children }) =>
                ButtonAutocomplete({
                  title: 'Crear categoria',
                  handleOnClick: handleClickOpenPopupCategory,
                  children
                })
              }
            />
            <RHFAutocomplete
              name="brand"
              fullWidth
              label="Marca"
              inputValue={searchQueryBrand}
              onInputChange={handleInputBrandChange}
              onChange={handleBrandSelect}
              isOptionEqualToValue={isOptionEqualToValue}
              value={selectedOptionBrand}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Marca"
                  // set error
                  error={errors.brand}
                  helperText={errors.brand?.message}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          component={Icon}
                          icon="carbon:search"
                          sx={{
                            ml: 1,
                            width: 20,
                            height: 20,
                            color: 'text.disabled'
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              getOptionLabel={(option) => (option.name ? option.name : '')}
              options={brands}
              loading={isLoading}
              renderOption={(props, option) => {
                const matches = match(option.name, searchQueryBrand);
                const parts = parse(option.name, matches);

                return (
                  <li {...props}>
                    <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.primary">
                        {parts.map((part, index) => (
                          <span
                            key={index}
                            style={{
                              fontWeight: part.highlight ? 700 : 400,
                              color: part.highlight ? theme.palette.primary.main : 'inherit'
                            }}
                          >
                            {part.text}
                          </span>
                        ))}
                      </Typography>
                    </Box>
                  </li>
                );
              }}
              noOptionsText={
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                  {isLoading && 'Cargando...'}
                  {brandsEmpty && !isLoading && 'No hay marcas registradas'}
                  {!isLoading &&
                    !brandsEmpty &&
                    searchQueryBrand &&
                    `No se encontraron resultados ${searchQueryCategory}`}
                </Typography>
              }
              PaperComponent={({ children }) =>
                ButtonAutocomplete({
                  title: 'Crear Marca',
                  handleOnClick: handleClickOpenPopupBrand,
                  children
                })
              }
            />
          </Stack>

          <Stack spacing={1.5}>
            {/* TODO Backend: poner opcional la descripción */}
            <Typography variant="subtitle2">Descripción</Typography>
            <RHFEditor name="description" />
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  const renderPricing = (
    <Grid xs={12} md={8}>
      <Card sx={{ p: 3, overflow: 'visible', zIndex: 99, mt: 4 }}>
        <Typography variant="h4">Precio</Typography>
        <Divider sx={{ mb: 3, mt: 0.5 }} />
        <Stack spacing={3}>
          <Typography variant="subtitle1">Indica el valor de venta y el costo de compra de tu producto.</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {/* Agregar precios */}
            <RHFTextField
              name="priceBase"
              label="Precio de venta"
              onChange={(event) => {
                setValue('priceBase', fNumber(event.target.value));
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
            <RHFSelect name="taxesOption" label="Impuestos" disabled={includeTaxes}>
              {TAXES_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField
              name="priceSale"
              label="Precio de venta"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
              disabled
            />
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  const renderPDVS = (
    <Grid xs={12} md={8}>
      <Card sx={{ p: 3, overflow: 'visible', zIndex: 99, mt: 4 }}>
        <Typography variant="h4">Punto de venta: Inventario</Typography>
        <Divider sx={{ mb: 3, mt: 0.5 }} />
        <Stack spacing={3}>
          <Typography variant="subtitle1">Asigna el punto de venta donde se encuentra el producto.</Typography>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {values.productsPdvs.map((item: PDVproduct) => (
              <Stack key={item.id} flexDirection="row" alignItems="center">
                <ListItem
                  sx={{ paddingLeft: 0, cursor: 'pointer' }}
                  onClick={() => {
                    setPdvEdit(item);
                    console.log('item', item);
                    dispatch(setPopupAssignInventory(true));
                  }}
                >
                  <ListItemAvatar>
                    <Avatar variant="rounded" sx={{ width: 60, height: 60 }}>
                      <Icon width={40} height={40} icon="tabler:building-warehouse" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.pdv}
                    secondary={`Cantidad: ${item.quantity} Cantidad minima: ${item.minQuantity}`}
                  />
                </ListItem>
                <MenuCategories
                  view={false}
                  element={item}
                  handleEdit={() => {
                    setPdvEdit(item);
                    dispatch(setPopupAssignInventory(true));
                  }}
                  handleDelete={() => {
                    const newPdv = values.productsPdvs.filter((pdv: PDVproduct) => pdv.id !== item.id);
                    setValue('productsPdvs', newPdv);
                  }}
                />
              </Stack>
            ))}
          </List>
          <PopupAssingInventory
            pdvEdit={pdvEdit}
            handleAssignInventory={handleAssignInventory}
            setAssignWarehouse={setAssignWarehouse}
          />
          {/* Agregar errores del pdv */}
          {errors.productsPdvs && (
            <Typography variant="subtitle2" color="error">
              {errors.productsPdvs.message}
            </Typography>
          )}
        </Stack>
      </Card>
    </Grid>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {renderDetails}

          {renderPricing}
          {renderPDVS}
        </Grid>
        <Grid
          sx={{
            position: 'sticky ',
            top: '50px',
            height: 'fit-content'
          }}
          item
          xs={12}
          md={4}
        >
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Stack>
                <Typography mb={1} variant="h5">
                  {values.name}
                </Typography>
                {values.barCode && (
                  <Typography mb={1} variant="subtitle2">
                    {' '}
                    Código: {values.barCode}
                  </Typography>
                )}
                {values.sku && (
                  <Typography mb={1} variant="subtitle2">
                    SKU: {values.sku}
                  </Typography>
                )}
                <Stack spacing={1.5}>
                  <RHFUpload
                    multiple
                    thumbnail
                    name="images"
                    maxSize={3145728}
                    onDrop={handleDrop}
                    onRemove={handleRemoveFile}
                    onRemoveAll={handleRemoveAllFiles}
                    onUpload={() => console.info('ON UPLOAD')}
                  />
                </Stack>
                <Stack>
                  <RHFSwitch name="state" label="Estado" />
                  <RHFSwitch name="sellInNegative" label="Vender en negativo" />
                </Stack>
              </Stack>
            </Card>

            <LoadingButton
              color="primary"
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={isSubmitting}
            >
              {currentProduct ? 'Editar producto' : 'Crear producto'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object
};
