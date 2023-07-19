import PropTypes from 'prop-types';
import * as Yup from 'yup';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
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
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slide
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function FormPDVS({ currentProduct, open, handleClose }) {
  const router = useRouter();

  const mdUp = useResponsive('up', 'md');

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    images: Yup.array().min(1, 'Images is required'),
    tags: Yup.array().min(2, 'Must have at least 2 tags'),
    category: Yup.string().required('Category is required'),
    price: Yup.number().moreThan(0, 'Price should not be $0.00'),
    description: Yup.string().required('Description is required'),
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
      code: currentProduct?.code || '',
      sku: currentProduct?.sku || '',
      price: currentProduct?.price || 0,
      quantity: currentProduct?.quantity || 0,
      priceSale: currentProduct?.priceSale || 0,
      tags: currentProduct?.tags || [],
      taxes: currentProduct?.taxes || 0,
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

  // ----------------------------------------------------------------------

  const [scroll, setScroll] = React.useState('paper');

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const renderDetails = (
    <Grid xs={12} md={8}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="name" label="Nombre Punto De Venta" />

        <RHFTextField name="subDescription" label="Sub Description" multiline rows={4} />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Content</Typography>
          <RHFEditor simple name="description" />
        </Stack>

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
      </Stack>
    </Grid>
  );

  const renderProperties = (
    <Grid xs={12} md={8}>
      <Card>
        {!mdUp && <CardHeader title="Properties" />}

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
            <RHFTextField name="code" label="Product Code" />

            <RHFTextField name="sku" label="Product SKU" />

            <RHFTextField
              name="quantity"
              label="Quantity"
              placeholder="0"
              type="number"
              InputLabelProps={{ shrink: true }}
            />

            <RHFSelect native name="category" label="Category" InputLabelProps={{ shrink: true }}>
              {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
                <optgroup key={category.group} label={category.group}>
                  {category.classify.map((classify) => (
                    <option key={classify} value={classify}>
                      {classify}
                    </option>
                  ))}
                </optgroup>
              ))}
            </RHFSelect>

            <RHFMultiSelect checkbox name="colors" label="Colors" options={PRODUCT_COLOR_NAME_OPTIONS} />

            <RHFMultiSelect checkbox name="sizes" label="Sizes" options={PRODUCT_SIZE_OPTIONS} />
          </Box>

          <RHFAutocomplete
            name="tags"
            label="Tags"
            placeholder="+ Tags"
            multiple
            freeSolo
            options={_tags.map((option) => option)}
            getOptionLabel={(option) => option}
            renderOption={(props, option) => (
              <li {...props} key={option}>
                {option}
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color="info"
                  variant="soft"
                />
              ))
            }
          />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Gender</Typography>
            <RHFMultiCheckbox row name="gender" spacing={2} options={PRODUCT_GENDER_OPTIONS} />
          </Stack>

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="saleLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField name="saleLabel.content" label="Sale Label" fullWidth disabled={!values.saleLabel.enabled} />
          </Stack>

          <Stack direction="row" alignItems="center" spacing={3}>
            <RHFSwitch name="newLabel.enabled" label={null} sx={{ m: 0 }} />
            <RHFTextField name="newLabel.content" label="New Label" fullWidth disabled={!values.newLabel.enabled} />
          </Stack>
        </Stack>
      </Card>
    </Grid>
  );

  const renderPricing = (
    <Grid xs={12} md={8}>
      <Card>
        {!mdUp && <CardHeader title="Pricing" />}

        <Stack spacing={3} sx={{ p: 3 }}>
          <RHFTextField
            name="price"
            label="Regular Price"
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
            label="Sale Price"
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

          <FormControlLabel
            control={<Switch checked={includeTaxes} onChange={handleChangeIncludeTaxes} />}
            label="Price includes taxes"
          />

          {!includeTaxes && (
            <RHFTextField
              name="taxes"
              label="Tax (%)"
              placeholder="0.00"
              type="number"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box component="span" sx={{ color: 'text.disabled' }}>
                      %
                    </Box>
                  </InputAdornment>
                )
              }}
            />
          )}
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
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle id="scroll-dialog-title">
        <Box gap={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="ic:round-store" width={24} height={24} />
          {t('Crear Punto De Venta')}
        </Box>
      </DialogTitle>

      <DialogContent dividers={scroll === 'paper'}>
        <DialogContentText id="alert-dialog-slide-description" ref={descriptionElementRef} tabIndex={-1}>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
              {renderDetails}

              {renderProperties}

              {renderPricing}

              {renderActions}
            </Grid>
          </FormProvider>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Disagree</Button>
        <Button onClick={handleClose}>Agree</Button>
      </DialogActions>
    </Dialog>
  );
}

FormPDVS.propTypes = {
  currentProduct: PropTypes.object
};
