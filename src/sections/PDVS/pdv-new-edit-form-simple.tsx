import * as Yup from 'yup';
import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Icon } from '@iconify/react';
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFSwitch } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
// Redux
import { setSeePDV, switchPopup } from 'src/redux/inventory/pdvsSlice';
import { useGetPDVByIdQuery, useCreatePDVMutation, useUpdatePDVMutation } from 'src/redux/services/pdvsApi';

// ----------------------------------------------------------------------
const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function FormPDVS() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();

  const { editId, seePDV, openPopup } = useAppSelector((state) => state.pdvs);
  const open = useAppSelector((state) => state.pdvs.openPopup);

  console.log('🎛️ Component state:', { editId, seePDV, openPopup, open });

  // RTK Query hooks
  const { data: pdvData, isLoading: isLoadingPDV } = useGetPDVByIdQuery(String(editId), {
    skip: !editId || typeof editId !== 'string'
  });
  const [createPDV, { isLoading: isCreating }] = useCreatePDVMutation();
  const [updatePDV, { isLoading: isUpdating }] = useUpdatePDVMutation();

  const isSubmitting = isCreating || isUpdating;

  const handleClose = () => {
    dispatch(switchPopup(false));
  };

  const NewPDVSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    address: Yup.string().required('Dirección es requerida'),
    phone_number: Yup.string().required('Teléfono es requerido'),
    is_active: Yup.boolean().optional()
  });

  const defaultValues = useMemo(
    () => ({
      name: pdvData?.name || '',
      address: pdvData?.address || '',
      phone_number: pdvData?.phone_number || '',
      is_active: pdvData?.is_active ?? true
    }),
    [pdvData]
  );

  const methods = useForm({
    resolver: yupResolver(NewPDVSchema),
    defaultValues
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    console.log('📊 useEffect for pdvData reset:', { pdvData: !!pdvData, editId });
    if (pdvData && editId) {
      console.log('🔄 Resetting form with PDV data:', pdvData);
      reset({
        name: pdvData.name || '',
        address: pdvData.address || '',
        phone_number: pdvData.phone_number || '',
        is_active: pdvData.is_active ?? true
      });
    }
  }, [pdvData, editId, reset]);

  useEffect(() => {
    console.log('🧹 useEffect for form clear:', { editId, type: typeof editId });
    if (!editId || typeof editId !== 'string') {
      reset({
        name: '',
        address: '',
        phone_number: '',
        is_active: true
      });
    }
  }, [editId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    console.log('🔥 Form submit triggered:', { data, seePDV, editId });

    // Prevenir completamente el submit si estamos en modo de solo visualización
    if (seePDV) {
      console.log('🚫 Blocked submission because seePDV is true');
      return;
    }

    console.log('✅ Processing form submission');
    try {
      if (editId) {
        await updatePDV({ id: String(editId), pdv: data }).unwrap();
        enqueueSnackbar('Punto de venta actualizado correctamente', { variant: 'success' });
      } else {
        await createPDV(data).unwrap();
        enqueueSnackbar('Punto de venta creado correctamente', { variant: 'success' });
      }
      reset();
      handleClose();
    } catch (error) {
      console.error('Error saving PDV:', error);
      enqueueSnackbar('Error al guardar el punto de venta', { variant: 'error' });
    }
  });

  const title = editId && seePDV ? pdvData?.name : editId ? 'Editar Punto De Venta' : 'Crear Punto De Venta';

  return (
    <Dialog open={open} TransitionComponent={Transition} keepMounted maxWidth="sm" fullWidth onClose={handleClose}>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle id="scroll-dialog-title" sx={{ padding: '23px 40px 18px 40px!important', boxShadow: 2 }}>
          <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="ic:round-store" width={24} height={24} />
            {title}
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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

        <DialogContent
          sx={{
            '&::-webkit-scrollbar': {
              width: '8px',
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '0px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555'
            }
          }}
          dividers
        >
          <Stack spacing={3} sx={{ p: 3 }}>
            <RHFTextField disabled={seePDV} name="name" placeholder="Ej: Almacén Norte" label="Nombre Punto De Venta" />

            <RHFTextField disabled={seePDV} name="address" label="Dirección" placeholder="Ej: Calle 63 # 28 - 35" />

            <RHFPhoneNumber
              fullWidth
              disabled={seePDV}
              variant="outlined"
              placeholder="Ej: 300 123 4567"
              name="phone_number"
              label="Teléfono"
              defaultCountry="co"
              onlyCountries={['co']}
              countryCodeEditable={false}
            />

            <RHFSwitch
              disabled={seePDV}
              name="is_active"
              label="Activo"
              helperText="Indica si el punto de venta está activo"
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            padding: '20px 35px 15px 40px!important',
            display: 'flex',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            flexDirection: isMobile ? 'column' : 'row',
            boxShadow: 2,
            '& > button': {
              flexGrow: isMobile ? 1 : 0,
              minWidth: isMobile ? '100%' : 'auto',
              marginBottom: isMobile ? theme.spacing(1) : 0,
              marginLeft: isMobile ? '0 !important' : theme.spacing(1)
            }
          }}
        >
          {seePDV ? (
            <>
              <LoadingButton
                type="button"
                startIcon={<Iconify icon="solar:pen-bold" width={20} />}
                color="primary"
                variant="contained"
                onClick={() => {
                  console.log('🖊️ Edit button clicked, switching to edit mode');
                  dispatch(setSeePDV({ seePDV: false, id: editId }));
                }}
              >
                Editar
              </LoadingButton>
              <Button type="button" color="primary" variant="outlined" onClick={handleClose}>
                Cerrar
              </Button>
            </>
          ) : (
            <>
              <LoadingButton color="primary" variant="contained" type="submit" loading={isSubmitting || isLoadingPDV}>
                {editId ? 'Confirmar edición' : 'Crear Punto De Venta'}
              </LoadingButton>
              <Button type="button" color="primary" variant="outlined" onClick={handleClose}>
                Cancelar
              </Button>
            </>
          )}
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
