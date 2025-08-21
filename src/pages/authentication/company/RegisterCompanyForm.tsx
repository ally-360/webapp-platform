import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Alert, IconButton, MenuItem, Stack, Typography } from '@mui/material';
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
import { setPrevValuesCompany } from 'src/redux/inventory/stepByStepSlice';
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
    economicActivity: prevValuesCompany?.economicActivity || ''
  };

  const methods = useForm({
    resolver: yupResolver(RegisterCompanySchema),
    defaultValues,
    shouldFocusError: false
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;
  const [errorMsg, setErrorMsg] = useState('');
  console.log(prevValuesCompany);

  const onSubmit = handleSubmit(async (data: RegisterCompany) => {
    try {
      console.log(`Aqui registra la empresa ${prevValuesCompany}`);
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
        // agregar el id
        console.log('Previous values company:', prevValuesCompany);
        console.log('Data submitted:', data);
        dispatch(setPrevValuesCompany({ ...data, id: prevValuesCompany.id }));
      } else {
        await createCompany(data);
        enqueueSnackbar('Registro de la empresa completado', {
          variant: 'success',
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)}>
              <Icon icon="eva:close-fill" />
            </IconButton>
          )
        });
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
          <RHFSelect fullWidth label="Cantidad de empleados" name="quantityEmployees">
            {quantityEmployeesOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
          <RHFSelect fullWidth label="Actividad económica" name="economicActivity">
            {economicActivityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </RHFSelect>
        </Stack>
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
        Siguiente paso
      </LoadingButton>
    </FormProvider>
  );
}
