import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Slide,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { useEffect, useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

// RTK Query
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation
} from 'src/redux/services/categoriesApi';

// Redux Legacy (para compatibilidad con el estado del popup)
import { switchPopupState } from 'src/redux/inventory/categoriesSlice';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { Icon } from '@iconify/react';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

const Transition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement<any, any> }>(
  (props, ref) => <Slide direction="up" ref={ref} {...props} />
);

function PopupCreateCategory() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { categoryEdit, openPopup } = useAppSelector((state) => state.categories);

  // RTK Query hooks
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const categoryEditData = categoryEdit as any;
  const categoriesList = categories || [];

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  // Validation schema (fixed)
  const createCategorySchema = Yup.object().shape({
    name: Yup.string().required('Nombre requerido'),
    description: Yup.string().optional(),
    parent_id: Yup.string().nullable().optional()
  });

  const defaultValues = useMemo(() => {
    let parentId: string | null = null;
    if (categoryEditData) {
      const parent: any = categoryEditData.categoryMainCategory || categoryEditData.parent;
      if (typeof parent === 'object' && parent !== null) {
        parentId = parent.id ?? null;
      } else {
        parentId = parent ?? null;
      }
    }
    return {
      name: categoryEditData ? categoryEditData.name : '',
      description: categoryEditData ? categoryEditData.description : '',
      parent_id: parentId
    } as any;
  }, [categoryEditData]);

  const methods = useForm({
    resolver: yupResolver(createCategorySchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (categoryEditData) {
        // Actualizar categoría existente
        await updateCategory({
          id: categoryEditData.id,
          data: {
            name: data.name,
            description: data.description,
            parent_id: data.parent_id || null
          }
        }).unwrap();
        enqueueSnackbar(t(`Categoria ${data.name} editada correctamente`), { variant: 'success' });
      } else {
        // Crear nueva categoría
        await createCategory({
          name: data.name,
          description: data.description,
          parent_id: data.parent_id || null
        }).unwrap();
        enqueueSnackbar(t(`Categoria ${data.name} creada`), { variant: 'success' });
      }

      reset();
      dispatch(switchPopupState(null));
    } catch (error: any) {
      console.error('Error with category operation:', error);
      enqueueSnackbar(error?.data?.detail || t('No se ha podido crear la categoria, verifica los datos nuevamente'), {
        variant: 'error'
      });
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={openPopup as boolean}
      onClose={() => dispatch(switchPopupState(null))}
      aria-labelledby="draggable-dialog-title"
      TransitionComponent={Transition}
    >
      <DialogTitle
        style={{ cursor: 'move' }}
        id="scroll-dialog-title"
        sx={{ padding: '23px  40px 18px 40px!important' }}
      >
        <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="ic:round-store" width={24} height={24} />
          <Box sx={{ fontSize: 18, fontWeight: 500 }}>{categoryEditData ? 'Editar categoria' : 'Crear categoria'}</Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => dispatch(switchPopupState(null))}
          sx={{
            position: 'absolute',
            right: 10,
            top: 16,
            color: theme.palette.primary.main
          }}
        >
          <Icon icon="ic:round-close" width={24} height={24} />
        </IconButton>
      </DialogTitle>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2} mt={4} mb={3} direction="column" alignItems="center">
            <RHFTextField label="Nombre" name="name" required />
            <RHFTextField label="Descripción" name="description" />
            {categoriesList.length === 0 ? null : (
              <RHFSelect label="Categoria padre" name="parent_id">
                {categoriesList.map((category: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            )}
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            boxShadow: 2,
            padding: '20px 35px 15px 40px!important',
            display: 'flex',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            flexDirection: isMobile ? 'column' : 'row',
            '& > button': {
              flexGrow: isMobile ? 1 : 0,
              minWidth: isMobile ? '100%' : 'auto',
              marginBottom: isMobile ? theme.spacing(1) : 0,
              marginLeft: isMobile ? '0 !important' : theme.spacing(1)
            }
          }}
        >
          <LoadingButton color="primary" variant="contained" type="submit" loading={isSubmitting}>
            {categoryEditData ? 'Confirmar edición' : 'Crear Categoria'}
          </LoadingButton>
          <Button color="primary" variant="outlined" onClick={() => dispatch(switchPopupState(null))}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default PopupCreateCategory;
