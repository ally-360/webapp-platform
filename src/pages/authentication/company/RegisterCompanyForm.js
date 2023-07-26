import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Alert, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import MuiPhoneNumber from 'material-ui-phone-number-2';
import Zoom from '@mui/material/Zoom';
import { Icon, InlineIcon } from '@iconify/react';
import PropTypes from 'prop-types';
import { useAuthContext } from 'src/auth/hooks';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/hook-form/form-provider';
import { RHFTextField } from 'src/components/hook-form';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import RequestService from '../../../axios/services/service';

export default function RegisterCompanyForm({ setActiveStep, activeStep, setPrevValues, prevValues }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { createCompany } = useAuthContext();

  const RegisterCompanySchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Ingrese un nombre valido')
      .max(50, 'Ingrese un nombre valido')
      .required('Ingrese el nombre'),
    address: Yup.string()
      .min(3, 'Ingrese una dirección valida')
      .max(50, 'Ingrese una dirección valida')
      .required('Ingrese la dirección'),
    nit: Yup.string().required('Ingrese un número de NIT valido'),
    phoneNumber: Yup.string().required('Ingrese un número de teléfono valido'),
    quantityEmployees: Yup.string().required('Ingrese la cantidad de empleados'),
    economicActivity: Yup.string().required('Ingrese la actividad económica'),
    website: Yup.string().required('Ingrese una URL valida')
  });

  const defaultValues = {
    name: prevValues?.name || '',
    address: prevValues?.address || '',
    nit: prevValues?.nit || '',
    phoneNumber: prevValues?.phoneNumber || '',
    website: prevValues?.website || '',
    quantityEmployees: prevValues?.quantityEmployees || '',
    economicActivity: prevValues?.economicActivity || ''
  };

  const methods = useForm({
    resolver: yupResolver(RegisterCompanySchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(prevValues);
      if (prevValues.id) {
        await RequestService.updateCompany({ databody: data, id: prevValues.id });
        enqueueSnackbar('Actualización de la empresa completado', {
          variant: 'success',
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)}>
              <Icon icon="eva:close-fill" />
            </IconButton>
          )
        });
      } else {
        await createCompany({ databody: data });
        enqueueSnackbar('Registro de la empresa completado', {
          variant: 'success',
          action: (key) => (
            <IconButton onClick={() => closeSnackbar(key)}>
              <Icon icon="eva:close-fill" />
            </IconButton>
          )
        });
        setPrevValues(data);
      }
      setActiveStep(1);
    } catch (error) {
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
            fullWidth
            label="Teléfono"
            name="phoneNumber"
            type="string"
            variant="outlined"
            placeholder="Ej: 300 123 4567"
            defaultCountry="co"
            countryCodeEditable={false}
            onlyCountries={['co']}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Sitio web" name="website" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Cantidad de empleados" name="quantityEmployees" />
          <RHFTextField fullWidth label="Actividad económica" name="economicActivity" />
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

RegisterCompanyForm.propTypes = {
  nextStep: PropTypes.func,
  activeStep: PropTypes.number,
  handleBack: PropTypes.func,
  setPrevValues: PropTypes.func,
  prevValues: PropTypes.object,
  setActiveStep: PropTypes.func
};
