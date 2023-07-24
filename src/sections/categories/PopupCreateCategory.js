import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Slide,
  Box,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

import { getCategories, switchPopupState } from 'src/redux/inventory/categoriesSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import { Icon } from '@iconify/react';
import RequestService from '../../axios/services/service';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function PopupCreateCategory({ open, PaperComponent }) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const theme = useTheme();
  const categoryEdit = useSelector((state) => state.categories.categoryEdit);
  const [categoryEditInfo, setCategoryEditInfo] = useState(null);

  useEffect(() => {
    const category = async () => {
      if (categoryEdit) {
        const { data } = await RequestService.getCategoryById(categoryEdit.id);
        setCategoryEditInfo(data);
      } else {
        setCategoryEditInfo(null);
      }
    };
    category();
  }, [categoryEdit]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  useEffect(() => {
    console.log(categoryEditInfo);
  }, [categoryEditInfo]);
  // create category schema
  const createCategorySchema = Yup.object().shape(
    {
      name: Yup.string().required('Nombre requerido'),
      description: Yup.string().required('Descripción requerida'),
      categoryMainCategory: Yup.string().optional()
    }[categoryEditInfo]
  );

  const defaultValues = useMemo(
    () => ({
      name: categoryEditInfo ? categoryEditInfo.name : '',
      description: categoryEditInfo ? categoryEditInfo.description : '',
      categoryMainCategory: categoryEditInfo ? categoryEditInfo.categoryMainCategory : null
    }),
    [categoryEditInfo]
  );

  const methods = useForm({
    resolver: yupResolver(createCategorySchema),
    defaultValues
  });

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (categoryEditInfo) {
      reset(defaultValues);
    }
  }, [categoryEditInfo, defaultValues, reset]);

  useEffect(() => {
    if (!categoryEditInfo) {
      reset(defaultValues);
    }
  }, [categoryEditInfo, defaultValues, reset]);

  const { categories } = useSelector((state) => state.categories);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (categoryEditInfo) {
        await RequestService.editCategory({ id: categoryEditInfo.id, databody: data });
      } else {
        await RequestService.createCategory(data);
      }
      dispatch(getCategories());
      reset();
      enqueueSnackbar(
        categoryEdit ? t(`Categoria ${data.name} editado correctamente`) : t(`Categoria ${data.name} Creado`),
        {
          variant: 'success'
        }
      );
      dispatch(switchPopupState());
    } catch (error) {
      enqueueSnackbar(t('No se ha podido crear la categoria, verifica los datos nuevamente'), {
        variant: 'error'
      });
      console.log(error);
    }
  });

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      PaperComponent={PaperComponent}
      open={open}
      onClose={switchPopupState}
      aria-labelledby="draggable-dialog-title"
      TransitionComponent={Transition}
    >
      <DialogTitle
        style={{ cursor: 'move' }}
        id="scroll-dialog-title"
        boxShadow={2}
        sx={{ padding: '23px  40px 18px 40px!important' }}
      >
        <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="ic:round-store" width={24} height={24} />
          <Box sx={{ fontSize: 18, fontWeight: 500 }}>Crear categoria</Box>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => dispatch(switchPopupState())}
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
            <RHFTextField label="Descripción" name="description" required />
            <RHFSelect label="Categoria padre" name="categoryMainCategory">
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
        </DialogContent>
        <DialogActions
          boxShadow={2}
          sx={{
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
            {categoryEdit ? 'Confirmar edición' : 'Crear Categoria'}
          </LoadingButton>
          <Button startIcon color="primary" variant="outlined" onClick={() => dispatch(switchPopupState())}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

PopupCreateCategory.propTypes = {
  open: PropTypes.bool,
  PaperComponent: PropTypes.func
};

export default PopupCreateCategory;
