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
// import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, { RHFUpload, RHFSwitch, RHFTextField, RHFAutocomplete, RHFSelect } from 'src/components/hook-form';
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
import { switchPopupState } from 'src/redux/inventory/categoriesSlice';
import { switchPopupState as switchPopupStateBrand } from 'src/redux/inventory/brandsSlice';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useTheme } from '@mui/material/styles';
import MenuCategories from 'src/sections/categories/MenuCategories';
import { setPopupAssignInventory } from 'src/redux/inventory/productsSlice';
import PopupAssingInventory from 'src/sections/product/PopupAssignInventory';
// RTK Query
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useAssignProductTaxesMutation,
  useUpdateProductMinStockMutation,
  type CreateProductRequest
} from 'src/redux/services/productsApi';
import { useGetTaxesQuery, useGetCategoriesQuery, useGetBrandsQuery } from 'src/redux/services/catalogApi';
import { NewProductSchema } from 'src/interfaces/inventory/productsSchemas';
import { NewProductInterface, PDVproduct, getProductResponse } from 'src/interfaces/inventory/productsInterface';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { fNumber } from 'src/utils/format-number';
import ButtonAutocomplete from './common/ButtonAutocomplete';

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }: { currentProduct: getProductResponse }) {
  const router = useRouter();
  // const mdUp = useResponsive('up', 'md');

  const dispatch = useAppDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      description: currentProduct?.description || '',
      typeProduct: currentProduct?.typeProduct || 1,
      images: currentProduct?.images || [],
      //
      barCode: currentProduct?.barCode || '',
      sku: currentProduct?.sku || '',
      priceBase: currentProduct?.priceBase || '',
      priceSale: currentProduct?.priceSale || '',
      taxesOption: currentProduct?.taxesOption || 0,
      tax_ids: [],
      productsPdvs:
        (currentProduct as any)?.productPdv?.map((item: any) => ({
          pdv: item.pdv_name,
          id: item.pdv_id,
          quantity: item.quantity,
          minQuantity: item.min_quantity
        })) || [],
      quantityStock: currentProduct?.quantityStock || 0,

      brand: currentProduct?.brand.id || '',
      state: currentProduct?.state || true,
      sellInNegative: currentProduct?.sellInNegative || false,

      category: (currentProduct as any)?.category?.id || ''
    }),
    [currentProduct]
  );

  const methods = useForm<any>({
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
  const setValueAny = setValue as any;

  const [selectedOptionBrand, setSelectedOptionBrand] = useState('');
  const [selectedOptionCategory, setSelectedOptionCategory] = useState(''); // Nuevo estado para almacenar la opción seleccionada}
  const [searchQueryBrand, setSearchQueryBrand] = useState('');

  // Track when we're creating new items to auto-select them
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [previousCategoryCount, setPreviousCategoryCount] = useState(0);
  const [previousBrandCount, setPreviousBrandCount] = useState(0);

  // Handlers declared early to satisfy effect deps below
  const handleCategorySelect = useCallback(
    (_event: unknown, option: any) => {
      setSelectedOptionCategory(option);
      setValueAny('category', option?.id);
    },
    [setValueAny]
  );

  const handleBrandSelect = useCallback(
    (_event: unknown, option: any) => {
      setSelectedOptionBrand(option);
      setValueAny('brand', option?.id);
    },
    [setValueAny]
  );

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
      handleBrandSelect(null, currentProduct.brand);
      handleCategorySelect(null, currentProduct.category);
    }
  }, [currentProduct, defaultValues, reset, handleBrandSelect, handleCategorySelect]);

  useEffect(() => {
    if (includeTaxes) {
      setValueAny('taxesOption', 0);
    } else {
      setValueAny('taxesOption', currentProduct?.taxesOption || 0);
    }
  }, [currentProduct?.taxesOption, includeTaxes, setValueAny]);

  const { data: taxes = [] } = useGetTaxesQuery();
  const { data: categories = [], isLoading: isLoadingCategories, refetch: refetchCategories } = useGetCategoriesQuery();
  const { data: brands = [], isLoading: isLoadingBrands, refetch: refetchBrands } = useGetBrandsQuery();

  // Get popup states for handling post-creation selection
  const { openPopup: categoryPopupOpen } = useAppSelector((state) => state.categories);
  const { openPopup: brandPopupOpen } = useAppSelector((state) => state.brands);

  // Effect to select newly created category
  useEffect(() => {
    // When category popup closes, refetch categories to get latest data
    if (!categoryPopupOpen && isCreatingCategory) {
      refetchCategories().then((result) => {
        if (result.data && result.data.length > previousCategoryCount) {
          // Get the last category (most recently added)
          const lastCategory = result.data[result.data.length - 1];
          if (lastCategory) {
            handleCategorySelect(null, lastCategory);
          }
        }
        setIsCreatingCategory(false);
      });
    }
  }, [categoryPopupOpen, isCreatingCategory, previousCategoryCount, handleCategorySelect, refetchCategories]);

  // Effect to select newly created brand
  useEffect(() => {
    // When brand popup closes, refetch brands to get latest data
    if (!brandPopupOpen && isCreatingBrand) {
      refetchBrands().then((result) => {
        if (result.data && result.data.length > previousBrandCount) {
          // Get the last brand (most recently added)
          const lastBrand = result.data[result.data.length - 1];
          if (lastBrand) {
            handleBrandSelect(null, lastBrand);
          }
        }
        setIsCreatingBrand(false);
      });
    }
  }, [brandPopupOpen, isCreatingBrand, previousBrandCount, handleBrandSelect, refetchBrands]);

  // Prefill selected taxes in edit mode when product has a single taxesOption id
  useEffect(() => {
    if (!currentProduct) return;
    const current = values.tax_ids || [];
    if (current.length === 0 && currentProduct.taxesOption != null) {
      const foundTax = (Array.isArray(taxes) ? taxes : []).find(
        (t: any) => String(t.id) === String(currentProduct.taxesOption)
      );
      if (foundTax) {
        setValueAny('tax_ids', [String(foundTax.id)], { shouldValidate: true });
      }
    }
  }, [currentProduct, taxes, values.tax_ids, setValueAny]);

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [assignProductTaxes] = useAssignProductTaxesMutation();
  const [updateProductMinStock] = useUpdateProductMinStockMutation();

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onSubmit = handleSubmit(async (data: NewProductInterface & { tax_ids?: string[] }) => {
    const lastProductsPdvs = data.productsPdvs;
    const priceBaseNum = Number(String(data.priceBase).replace(/[^0-9.-]+/g, '')) || 0;
    const priceSaleNum = Number(String(data.priceSale).replace(/[^0-9.-]+/g, '')) || 0;

    try {
      setValue(
        'quantityStock',
        data.productsPdvs.reduce((acc: number, pdv: PDVproduct) => acc + Number(pdv.quantity || 0), 0) || 0
      );

      // Normalize images to base64 strings
      const imageValues = (data.images || []) as any[];
      const imagesBase64: string[] = (
        await Promise.all(
          imageValues.map(async (img) => {
            if (typeof img === 'string') return img;
            if (img?.preview && img instanceof File) return toBase64(img);
            if (img?.preview && img?.file instanceof File) return toBase64(img.file);
            if (img instanceof File) return toBase64(img);
            return null;
          })
        )
      ).filter(Boolean) as string[];

      const payload: CreateProductRequest = {
        name: data.name,
        sku: data.sku || undefined,
        description: data.description || undefined,
        barCode: data.barCode || undefined,
        typeProduct: String(data.typeProduct) as '1' | '2',
        priceSale: priceSaleNum || priceBaseNum,
        priceBase: priceBaseNum,
        state: Boolean(data.state),
        sellInNegative: Boolean(data.sellInNegative),
        brand_id: String(data.brand),
        category_id: String(data.category),
        tax_ids: Array.isArray((data as any).tax_ids) ? ((data as any).tax_ids as string[]) : [],
        images: imagesBase64,
        stocks: data.productsPdvs.map((pdv: PDVproduct) => ({
          pdv_id: pdv.id,
          quantity: Number(pdv.quantity),
          min_quantity: Number(pdv.minQuantity || 0)
        }))
      };

      let saved;
      if (currentProduct) {
        saved = await updateProduct({ id: currentProduct.id, ...payload }).unwrap();
        // Update PDV min quantities using specific endpoint
        if (Array.isArray(values.productsPdvs) && values.productsPdvs.length) {
          await Promise.all(
            values.productsPdvs.map((pdv: PDVproduct) =>
              updateProductMinStock({
                productId: saved.id,
                pdvId: String(pdv.id),
                minQuantity: Number(pdv.minQuantity || 0)
              }).unwrap()
            )
          );
        }
        enqueueSnackbar('Se ha editado correctamente!');
      } else {
        saved = await createProduct(payload).unwrap();
        enqueueSnackbar('Creación exitosa!');
      }

      // Assign taxes explicitly after save (backend endpoint)
      if (Array.isArray(payload.tax_ids) && payload.tax_ids.length) {
        await assignProductTaxes({ productId: saved.id, tax_ids: payload.tax_ids }).unwrap();
      }
      reset();
      router.push(paths.dashboard.product.root);
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error?.data?.detail || 'Error al crear el producto', { variant: 'error' });
      data.productsPdvs = lastProductsPdvs;
    }
  });

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const current = (values.images || []) as any[];
      const base64Files = await Promise.all(
        acceptedFiles.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
        )
      );
      setValueAny('images', [...current, ...base64Files], { shouldValidate: true });
    },
    [setValueAny, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile) => {
      const filtered = values.images && values.images?.filter((file) => file !== inputFile);
      setValueAny('images', filtered);
    },
    [setValueAny, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValueAny('images', []);
  }, [setValueAny]);

  // Removed unused handleChangeIncludeTaxes

  // Autocomplete category

  const handleClickOpenPopupCategory = () => {
    setIsCreatingCategory(true);
    setPreviousCategoryCount(categories.length);
    dispatch(switchPopupState(true));
  };

  const [searchQueryCategory, setSearchQueryCategory] = useState('');

  const handleInputCategoryChange = (event, value) => {
    setSearchQueryCategory(value);
  };

  // Categories & Brands are loaded via RTK Query

  const isOptionEqualToValue = (option, value) => {
    if (option && value) {
      return option.id === value.id && option.name === value.name;
    }
    return false;
  };

  const theme = useTheme();
  const isEmpty = categories.length === 0;
  const brandsEmpty = brands.length === 0;
  // Autocomplete brand

  const isLoading = isLoadingBrands;

  const handleInputBrandChange = (event, value) => {
    setSearchQueryBrand(value);
  };

  const handleClickOpenPopupBrand = () => {
    setIsCreatingBrand(true);
    setPreviousBrandCount(brands.length);
    dispatch(switchPopupStateBrand(true));
  };
  const priceBase = watch('priceBase');
  // Calculate priceSale based on selected taxes
  useEffect(() => {
    const selectedTaxIds: string[] = values.tax_ids || [];
    if (!priceBase) {
      setValueAny('priceSale', '');
      return;
    }
    const base = Number(String(priceBase).replace(/[^0-9.-]+/g, '')) || 0;
    if (!selectedTaxIds.length) {
      setValueAny('priceSale', fNumber(base));
      return;
    }
    const totalPercentage = selectedTaxIds.reduce((acc, id) => {
      const found = taxes.find((t) => t.id === id);
      return acc + (found?.percentage || 0);
    }, 0);
    const final = base + base * (totalPercentage / 100);
    setValueAny('priceSale', fNumber(final));
  }, [priceBase, taxes, values.tax_ids, setValueAny]);
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
    setValueAny('productsPdvs', newPdv);
    setPdvEdit(null);
  };

  // Popup to assign inventory
  const handleAssignInventory = (pdv: PDVproduct, quantity: number, minQuantity: number, edit: boolean) => {
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
    setValueAny('productsPdvs', [
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
              options={Array.isArray(categories) ? categories : []}
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
              options={Array.isArray(brands) ? brands : []}
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
            <RHFTextField name="description" multiline rows={4} placeholder="Descripción del producto..." />
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
                setValueAny('priceBase', fNumber(event.target.value));
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>
              }}
            />
            <RHFSelect name="tax_ids" label="Impuestos" SelectProps={{ multiple: true }}>
              {(Array.isArray(taxes) ? taxes : []).map((tax) => (
                <MenuItem key={tax.id} value={tax.id}>
                  {tax.name} ({tax.percentage}%)
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
                    setValueAny('productsPdvs', newPdv);
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
              {(errors.productsPdvs as any)?.message as string}
            </Typography>
          )}
        </Stack>
      </Card>
    </Grid>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
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
                    helperText="Formatos: JPG, PNG. Max 3MB por imagen."
                  />
                </Stack>
                <Stack>
                  <RHFSwitch name="state" label="Estado" helperText="" />
                  <RHFSwitch name="sellInNegative" label="Vender en negativo" helperText="" />
                </Stack>
              </Stack>
            </Card>

            <LoadingButton
              color="primary"
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              loading={isSubmitting || isCreating || isUpdating}
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
