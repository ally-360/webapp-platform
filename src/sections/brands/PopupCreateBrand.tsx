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
import { TransitionProps } from '@mui/material/transitions';

import React, { useEffect, useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField } from 'src/components/hook-form';
import { Icon } from '@iconify/react';
import {
  getBrands,
  switchPopupState,
  createBrand as createBrandThunk,
  editBrand as editBrandThunk
} from 'src/redux/inventory/brandsSlice';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';

const Transition = React.forwardRef<unknown, TransitionProps & { children: React.ReactElement<any, any> }>(
  (props, ref) => <Slide direction="up" ref={ref} {...props} />
);

function PopupCreateBrand() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { brandEdit, openPopup } = useAppSelector((state) => state.brands);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  useEffect(() => {
    // console.log(brandEdit);
  }, [brandEdit]);
  // create brand schema (fixed)
  const createBrandSchema = Yup.object().shape({
    name: Yup.string().required('Nombre requerido')
  });

  const defaultValues = useMemo(
    () => ({
      name: brandEdit ? (brandEdit as any).name : ''
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
    reset(defaultValues);
  }, [brandEdit, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (brandEdit) {
        await dispatch(editBrandThunk({ id: (brandEdit as any).id, databody: data }) as any);
      } else {
        await dispatch(createBrandThunk(data) as any);
      }
      dispatch(getBrands() as any);
      reset();
      enqueueSnackbar(brandEdit ? t(`Marca ${data.name} editada correctamente`) : t(`Marca ${data.name} creada`), {
        variant: 'success'
      });
      dispatch(switchPopupState(null));
    } catch (error) {
      enqueueSnackbar(t('No se ha podido crear la marca, verifica los datos nuevamente'), {
        variant: 'error'
      });
      // eslint-disable-next-line no-console
      console.log(error);
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
      <DialogTitle id="scroll-dialog-title" sx={{ padding: '23px  40px 18px 40px!important' }}>
        <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="ic:round-store" width={24} height={24} />
          <Box sx={{ fontSize: 18, fontWeight: 500 }}>Crear Marca</Box>
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
            {brandEdit ? 'Confirmar edición' : 'Crear Marca'}
          </LoadingButton>
          <Button color="primary" variant="outlined" onClick={() => dispatch(switchPopupState(null))}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default PopupCreateBrand;
