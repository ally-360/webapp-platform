import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';

// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
import { useSnackbar } from 'src/components/snackbar';
// components
import FormProvider, { RHFUpload, RHFSwitch, RHFTextField, RHFSelect } from 'src/components/hook-form';
// RTK Query
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  type CreateProductRequest
} from 'src/redux/services/productsApi';
import { useGetCategoriesQuery, useGetBrandsQuery } from 'src/redux/services/catalogApi';
import type { Product } from 'src/api/types';
// utils

// ----------------------------------------------------------------------

interface ProductNewEditFormProps {
  currentProduct?: Product | null;
}

// ========================================
// 📋 VALIDATION SCHEMA
// ========================================

const ProductSchema = Yup.object().shape({
  name: Yup.string().required('Nombre del producto es requerido'),
  images: Yup.array().min(1, 'Al menos una imagen es requerida').required('Las imágenes son requeridas'),
  description: Yup.string(),
  barCode: Yup.string(),
  sku: Yup.string(),
  priceSale: Yup.number().required('Precio de venta es requerido').min(0, 'El precio debe ser mayor a 0'),
  priceBase: Yup.number().required('Precio base es requerido').min(0, 'El precio debe ser mayor a 0'),
  categoryId: Yup.string().required('La categoría es requerida'),
  brandId: Yup.string().required('La marca es requerida'),
  typeProduct: Yup.string().oneOf(['1', '2'], 'Tipo de producto inválido'),
  taxesOption: Yup.number().min(0).max(100),
  quantityStock: Yup.number().min(0, 'Stock no puede ser negativo'),
  state: Yup.boolean(),
  sellInNegative: Yup.boolean()
});

type ProductFormData = Yup.InferType<typeof ProductSchema>;

// ----------------------------------------------------------------------

export default function ProductNewEditForm({ currentProduct }: ProductNewEditFormProps) {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuthContext();

  const mdUp = useResponsive('up', 'md');

  const [includeTaxes, setIncludeTaxes] = useState(false);

  // ========================================
  // 🔥 RTK QUERY HOOKS
  // ========================================

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // Cargar categorías y marcas
  const { data: categoriesData } = useGetCategoriesQuery(
    {
      companyId: user?.company?.id || ''
    },
    {
      skip: !user?.company?.id
    }
  );

  const { data: brandsData } = useGetBrandsQuery(
    {
      companyId: user?.company?.id || ''
    },
    {
      skip: !user?.company?.id
    }
  );

  const categories = categoriesData || [];
  const brands = brandsData || [];

  // ========================================
  // 📝 FORM SETUP
  // ========================================

  const defaultValues: Partial<ProductFormData> = useMemo(
    () => ({
      name: currentProduct?.name || '',
      description: currentProduct?.description || '',
      barCode: currentProduct?.barCode || '',
      sku: currentProduct?.sku || '',
      images: currentProduct?.images || [],
      typeProduct: currentProduct?.typeProduct || '1',
      priceSale: currentProduct ? currentProduct.priceSale / 100 : 0, // Convertir de centavos
      priceBase: currentProduct ? currentProduct.priceBase / 100 : 0, // Convertir de centavos
      categoryId: currentProduct?.categoryId || '',
      brandId: currentProduct?.brandId || '',
      taxesOption: currentProduct?.taxesOption || 0,
      quantityStock: currentProduct?.quantityStock || 0,
      state: currentProduct?.state ?? true,
      sellInNegative: currentProduct?.sellInNegative ?? false
    }),
    [currentProduct]
  );

  const methods = useForm<ProductFormData>({
    resolver: yupResolver(ProductSchema),
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
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  // ========================================
  // 🎯 HANDLERS
  // ========================================

  const onSubmit = useCallback(
    async (data: ProductFormData) => {
      try {
        const productData: CreateProductRequest | UpdateProductRequest = {
          ...data,
          priceSale: Math.round(data.priceSale * 100), // Convertir a centavos
          priceBase: Math.round(data.priceBase * 100), // Convertir a centavos
          images: data.images || []
        };

        if (currentProduct) {
          // Actualizar producto existente
          await updateProduct({
            id: currentProduct.id,
            ...productData
          }).unwrap();

          enqueueSnackbar('Producto actualizado exitosamente', { variant: 'success' });
        } else {
          // Crear nuevo producto
          await createProduct(productData).unwrap();

          enqueueSnackbar('Producto creado exitosamente', { variant: 'success' });
        }

        router.push(paths.dashboard.product.root);
      } catch (error) {
        console.error('Error saving product:', error);
        enqueueSnackbar(currentProduct ? 'Error al actualizar producto' : 'Error al crear producto', {
          variant: 'error'
        });
      }
    },
    [currentProduct, createProduct, updateProduct, enqueueSnackbar, router]
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const files = values.images || [];

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );

      setValue('images', [...files, ...newFiles]);
    },
    [setValue, values.images]
  );

  const handleRemoveFile = useCallback(
    (inputFile: File | string) => {
      const filtered = values.images?.filter((file) => file !== inputFile);
      setValue('images', filtered);
    },
    [setValue, values.images]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', []);
  }, [setValue]);

  // ========================================
  // 🎨 RENDER
  // ========================================

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Detallessss
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Título, descripción breve, imagen...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Detalles" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField name="name" label="Nombre del producto" />

            <RHFTextField name="description" label="Descripción" multiline rows={4} />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Imágenes</Typography>
              <RHFUpload
                multiple
                thumbnail
                name="images"
                maxSize={3145728}
                onDrop={handleDrop}
                onRemove={handleRemoveFile}
                onRemoveAll={handleRemoveAllFiles}
                onUpload={() => console.log('ON UPLOAD')}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Propiedades
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Información adicional y categorización
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Propiedades" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)'
              }}
            >
              <RHFTextField name="barCode" label="Código de barras" />
              <RHFTextField name="sku" label="SKU" />
            </Box>

            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)'
              }}
            >
              <RHFSelect name="categoryId" label="Categoría">
                <MenuItem value="">Seleccione categoría</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="brandId" label="Marca">
                <MenuItem value="">Seleccione marca</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            <RHFSelect name="typeProduct" label="Tipo de producto">
              <MenuItem value="1">Simple</MenuItem>
              <MenuItem value="2">Configurable</MenuItem>
            </RHFSelect>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderPricing = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Precios
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Precio de venta, costo base, inventario...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Precios" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Box
              columnGap={2}
              rowGap={3}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)'
              }}
            >
              <RHFTextField
                name="priceBase"
                label="Precio base"
                placeholder="0.00"
                type="number"
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
              />

              <RHFTextField
                name="priceSale"
                label="Precio de venta"
                placeholder="0.00"
                type="number"
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
              />
            </Box>

            <RHFTextField
              name="taxesOption"
              label="Impuestos (%)"
              placeholder="0"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      %
                    </Box>
                  </InputAdornment>
                )
              }}
            />

            <RHFTextField
              name="quantityStock"
              label="Cantidad en stock"
              placeholder="0"
              type="number"
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8}>
        <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
          <RHFSwitch name="state" label="Producto activo" />
          <RHFSwitch name="sellInNegative" label="Permitir venta en negativo" />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <LoadingButton
            type="submit"
            variant="contained"
            size="large"
            loading={isSubmitting || isCreating || isUpdating}
            sx={{ ml: 'auto' }}
          >
            {currentProduct ? 'Actualizar Producto' : 'Crear Producto'}
          </LoadingButton>
        </Stack>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderPricing}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

ProductNewEditForm.propTypes = {
  currentProduct: PropTypes.object
};
