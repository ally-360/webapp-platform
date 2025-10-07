import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Alert, IconButton, MenuItem, Stack, Typography, FormControlLabel, Switch, Box, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/auth/hooks';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import { RegisterCompanySchema } from 'src/interfaces/auth/yupSchemas';
import { RegisterCompany } from 'src/interfaces/auth/userInterfaces';
import { useDispatch } from 'react-redux';
import { setPrevValuesCompany, setStep } from 'src/redux/inventory/stepByStepSlice';
import { useAppSelector } from 'src/hooks/store';
import RequestService from '../../../axios/services/service';
import { economicActivityOptions, quantityEmployeesOptions } from './optionsCommon';

export default function RegisterCompanyForm() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { createCompany } = useAuthContext();

  const dispatch = useDispatch();
  const { prevValuesCompany } = useAppSelector((state) => state.stepByStep);

  const defaultValues = {
    name: prevValuesCompany?.name || '',
    address: prevValuesCompany?.address || '',
    nit: prevValuesCompany?.nit || '',
    phoneNumber: prevValuesCompany?.phoneNumber || '',
    website: prevValuesCompany?.website || '',
    quantityEmployees: prevValuesCompany?.quantityEmployees || '',
    economicActivity: prevValuesCompany?.economicActivity || '',
    uniquePDV: prevValuesCompany?.uniquePDV || false
  };

  const methods = useForm({
    resolver: yupResolver(RegisterCompanySchema),
    defaultValues,
    shouldFocusError: false
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting }
  } = methods;

  // Watch uniquePDV value for UI changes
  const uniquePDV = watch('uniquePDV');
  const [errorMsg, setErrorMsg] = useState('');
  console.log(prevValuesCompany);

  const onSubmit = handleSubmit(async (data: RegisterCompany) => {
    try {
      console.log(`Registrando empresa:`, data);

      if (prevValuesCompany?.id) {
        await RequestService.updateCompany({ databody: data, id: prevValuesCompany.id });
        enqueueSnackbar('Actualización de la empresa completado', {
          variant: 'success',
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)}>
              <Icon icon="eva:close-fill" />
            </IconButton>
          )
        });
        // Mantener el ID y agregar los nuevos datos
        dispatch(
          setPrevValuesCompany({
            ...data,
            id: prevValuesCompany.id,
            address: data.address || '',
            website: data.website || '',
            quantityEmployees: data.quantityEmployees || '',
            economicActivity: data.economicActivity || ''
          })
        );
      } else {
        await createCompany(data);

        enqueueSnackbar(
          data.uniquePDV
            ? 'Empresa creada exitosamente. PDV principal generado automáticamente.'
            : 'Empresa creada exitosamente.',
          {
            variant: 'success',
            action: (key) => (
              <IconButton onClick={() => closeSnackbar(key)}>
                <Icon icon="eva:close-fill" />
              </IconButton>
            )
          }
        );

        // Si uniquePDV es true, saltar al paso 2 (plan), si no, ir al paso 1 (PDV)
        if (data.uniquePDV) {
          dispatch(setStep(2)); // Saltar a selección de plan
        } else {
          dispatch(setStep(1)); // Ir a configuración de PDV
        }
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack sx={{ marginTop: 1 }} spacing={3}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <Typography variant="subtitle1" textAlign="center" sx={{ mb: 3 }}>
          Ingresa la información de la empresa
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Nombre de la empresa" name="name" />
          <RHFTextField fullWidth label="Dirección de la empresa" name="address" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="NIT" name="nit" />
          <RHFPhoneNumber
            label="Teléfono"
            name="phoneNumber"
            type="string"
            autoComplete="tel"
            defaultCountry="co"
            onlyCountries={['co']}
            countryCodeEditable={false}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Sitio web" name="website" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFSelect fullWidth label="Cantidad de empleados" name="quantity_employees">
            {quantityEmployeesOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
          <RHFSelect fullWidth label="Actividad económica" name="economic_activity">
            {economicActivityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>

        {/* Unique PDV Option */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 2 }} />

          <FormControlLabel
            control={<Switch {...methods.register('uniquePDV')} checked={uniquePDV} color="primary" />}
            label={
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  Punto de venta únicoooo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {uniquePDV
                    ? 'Tu empresa tendrá un solo punto de venta que se creará automáticamente'
                    : 'Podrás configurar múltiples puntos de venta después'}
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', ml: 0 }}
          />
        </Box>
      </Stack>
      <LoadingButton
        color="primary"
        sx={{ marginTop: 8 }}
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        {uniquePDV ? 'Crear empresa y continuar' : 'Siguiente paso'}
      </LoadingButton>
    </FormProvider>
  );
}
