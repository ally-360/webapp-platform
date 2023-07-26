import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
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

import { getCategories } from 'src/redux/inventory/categoriesSlice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField } from 'src/components/hook-form';
import { Icon } from '@iconify/react';
import { getBrands, switchPopupState } from 'src/redux/inventory/brandsSlice';
import RequestService from '../../axios/services/service';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

function PopupCreateBrand({ open, PaperComponent }) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { brandEdit } = useSelector((state) => state.brands);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  useEffect(() => {
    console.log(brandEdit);
  }, [brandEdit]);
  // create category schema
  const createBrandSchema = Yup.object().shape(
    {
      name: Yup.string().required('Nombre requerido')
    }[brandEdit]
  );

  const defaultValues = useMemo(
    () => ({
      name: brandEdit ? brandEdit.name : ''
    }),
    [brandEdit]
  );

  const methods = useForm({
    resolver: yupResolver(createBrandSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  useEffect(() => {
    if (brandEdit) {
      reset(defaultValues);
    }
  }, [brandEdit, defaultValues, reset]);

  useEffect(() => {
    if (!brandEdit) {
      reset(defaultValues);
    }
  }, [brandEdit, defaultValues, reset]);

  const { categories } = useSelector((state) => state.categories);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (brandEdit) {
        await RequestService.editBrand({ id: brandEdit.id, databody: data });
      } else {
        await RequestService.createBrand(data);
      }
      dispatch(getBrands());
      reset();
      enqueueSnackbar(
        brandEdit ? t(`Categoria ${data.name} editado correctamente`) : t(`Categoria ${data.name} Creado`),
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
      <DialogTitle id="scroll-dialog-title" boxShadow={2} sx={{ padding: '23px  40px 18px 40px!important' }}>
        <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="ic:round-store" width={24} height={24} />
          <Box sx={{ fontSize: 18, fontWeight: 500 }}>Crear Marca</Box>
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
            {brandEdit ? 'Confirmar edición' : 'Crear Marca'}
          </LoadingButton>
          <Button startIcon color="primary" variant="outlined" onClick={() => dispatch(switchPopupState())}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

PopupCreateBrand.propTypes = {
  open: PropTypes.bool,
  PaperComponent: PropTypes.func
};

export default PopupCreateBrand;
