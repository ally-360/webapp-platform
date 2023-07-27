import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// _mock
import {
  _tags,
  PRODUCT_SIZE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_COLOR_NAME_OPTIONS,
  PRODUCT_CATEGORY_GROUP_OPTIONS
} from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, {
  RHFSelect,
  RHFEditor,
  RHFUpload,
  RHFSwitch,
  RHFTextField,
  RHFMultiSelect,
  RHFAutocomplete,
  RHFMultiCheckbox
} from 'src/components/hook-form';
import { IconButton, MenuItem, TextField, Tooltip, Zoom } from '@mui/material';
import { Icon } from '@iconify/react';
import { getCategories, switchPopupState } from 'src/redux/inventory/categoriesSlice';
import { switchPopupState as switchPopupStateBrand, getBrands } from 'src/redux/inventory/brandsSlice';
import { useDispatch, useSelector } from 'react-redux';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { Link } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import { calculatePriceBase, calculatePriceSale } from 'src/sections/product/common/priceFunctions';
import { NumericFormatCustom } from 'src/sections/product/common/NumericFormatCustom';
import { NumericFormat } from 'react-number-format';
import ButtonAutocomplete from './common/ButtonAutocomplete';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

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

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    images: Yup.array().min(1, 'Images is required'),
    tags: Yup.array().min(2, 'Must have at least 2 tags'),
    category: Yup.string().required('Category is required'),
    price: Yup.number().moreThan(0, 'Price should not be $0.00'),
    description: Yup.string().required('Description is required'),

    barCode: Yup.string(),
    sku: Yup.string(),
    priceBase: Yup.number(),
    priceSale: Yup.number(),

    // not required
    taxes: Yup.number(),
    newLabel: Yup.object().shape({
      enabled: Yup.boolean(),
      content: Yup.string()
    }),
    saleLabel: Yup.object().shape({
      enabled: Yup.boolean(),
      content: Yup.string()
    })
  });

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      description: currentProduct?.description || '',
      subDescription: currentProduct?.subDescription || '',
      images: currentProduct?.images || [],
      //
      barCode: currentProduct?.barCode || '',
      sku: currentProduct?.sku || '',
      priceBase: currentProduct?.priceBase || 0,
      priceSale: currentProduct?.priceSale || 0,
      taxes: currentProduct?.taxes || 0,

      quantity: currentProduct?.quantity || 0,
      tags: currentProduct?.tags || [],
      gender: currentProduct?.gender || '',
      category: currentProduct?.category || '',
      colors: currentProduct?.colors || [],
      sizes: currentProduct?.sizes || [],
      newLabel: currentProduct?.newLabel || { enabled: false, content: '' },
      saleLabel: currentProduct?.saleLabel || { enabled: false, content: '' }
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
    formState: { isSubmitting }
  } = methods;

  const values = watch();

  useEffect(() => {
    console.log('values', values);
  }, [values]);

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    if (includeTaxes) {
      setValue('taxes', 0);
    } else {
      setValue('taxes', currentProduct?.taxes || 0);
    }
  }, [currentProduct?.taxes, includeTaxes, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentProduct ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.product.root);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
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
    dispatch(switchPopupState());
  };

  const dispatch = useDispatch();

  const [selectedOptionCategory, setSelectedOptionCategory] = useState(''); // Nuevo estado para almacenar la opción seleccionada}
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

  const { categories, isEmpty } = useSelector((state) => state.categories);
  const isLoadingCategories = useSelector((state) => state.categories.isLoading);
  // Autocomplete brand

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);
  const [selectedOptionBrand, setSelectedOptionBrand] = useState(''); // Nuevo estado para almacenar la opción seleccionada
  const { brands, brandsEmpty, isLoading } = useSelector((state) => state.brands);
  const [searchQueryBrand, setSearchQueryBrand] = useState('');

  const handleInputBrandChange = (event, value) => {
    setSearchQueryBrand(value);
  };

  const handleBrandSelect = (event, option) => {
    setSelectedOptionBrand(option); // Actualizar el estado con la opción seleccionada
    setValue('brand', option?.id);
  };

  const handleClickOpenPopupBrand = () => {
    dispatch(switchPopupStateBrand());
  };

  // Taxes

  useEffect(() => {
    const taxPercentage = values.taxes;
    if (taxPercentage) {
      const newPriceSale = calculatePriceSale(values.priceBase, taxPercentage);
      setValue('priceSale', newPriceSale);
    }
    if (taxPercentage === 0) {
      setValue('priceSale', values.priceBase);
    }
  }, [values.taxes, values.priceBase]);

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
              fullWidth
              name="brand"
              label="Marca"
              inputValue={searchQueryBrand}
              onInputChange={handleInputBrandChange}
              onChange={handleBrandSelect}
              isOptionEqualToValue={isOptionEqualToValue}
              value={selectedOptionBrand}
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
            <Typography variant="subtitle2">Descripción</Typography>
            <RHFEditor simple name="description" />
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
            <TextField
              color="primary"
              fullWidth
              label="Precio base"
              onChange={(e) => {
                const priceBase = parseFloat(e.target.value);
                const taxPercentage = values.taxes; // Obtener el porcentaje de impuesto según la opción seleccionada
                const priceSale = calculatePriceSale(priceBase, taxPercentage); // Calcular el precio total
                setValue('priceBase', priceBase); // Actualizar el valor de Precio Base
                setValue('priceSale', priceSale); // Actualizar el valor de Precio Total
              }}
              value={values.priceBase}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputComponent: NumericFormatCustom
              }}
            />

            <RHFSelect name="taxes" label="Impuestos" disabled={includeTaxes}>
              {TAXES_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
            <TextField
              fullWidth
              color="primary"
              placeholder="0.00"
              label="Precio Total"
              onChange={(e) => {
                const priceSale = parseFloat(e.target.value);
                const taxPercentage = values.taxes; // Obtener el porcentaje de impuesto según la opción seleccionada
                const priceBase = calculatePriceBase(priceSale, taxPercentage); // Calcular el precio base
                setValue('priceBase', priceBase); // Actualizar el valor de Precio Base
                setValue('priceSale', priceSale); // Actualizar el valor de Precio Total
              }}
              value={values.priceSale}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputComponent: NumericFormatCustom
              }}
            />
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel control={<Switch defaultChecked />} label="Publish" sx={{ flexGrow: 1, pl: 3 }} />

        <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
          {!currentProduct ? 'Create Product' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {renderDetails}

          {renderPricing}

          {renderActions}
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
                Inforacion del producto etc etc
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2">Images</Typography>
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
                <Typography variant="h5">{values.name}</Typography>
                {values.barCode && <Typography variant="subtitle2"> Código: {values.barCode}</Typography>}
                {values.sku && <Typography variant="subtitle2"> SKU: {values.sku}</Typography>}
              </Stack>
            </Card>

            <LoadingButton type="submit" fullWidth variant="contained" size="large" loading={isSubmitting}>
              Crear producto
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
