import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Alert, Autocomplete, Stack, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { Icon } from '@iconify/react';
import PropTypes from 'prop-types';
import { useAuthContext } from 'src/auth/hooks';
import { LoadingButton } from '@mui/lab';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/hook-form/form-provider';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import { Box, useTheme } from '@mui/system';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import RequestService from '../../../axios/services/service';

export default function RegisterPDVForm({ setActiveStep, handleBack, setPrevValues, prevValues }) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { company, createPDV } = useAuthContext();
  const theme = useTheme();

  const RegisterPDVSchema = Yup.object().shape({
    name: Yup.string().required('Nombre requerido'),
    description: Yup.string().required('Descripción requerida'),
    departamento: Yup.object().required('Departamento requerido'),
    municipio: Yup.object().required('Ciudad requerida'),
    address: Yup.string().required('Dirección requerida'),
    phoneNumber: Yup.string().required('Teléfono requerido')
  });

  const defaultValues = {
    name: prevValues?.name || '',
    description: prevValues?.description || '',
    departamento: prevValues?.departamento || '',
    municipio: prevValues?.location?.id || '',
    address: prevValues?.address || '',
    main: true,
    phoneNumber: prevValues?.phoneNumber || '',
    company: { id: company[0] ? company[0].id : company.id }
  };

  const methods = useForm({
    resolver: yupResolver(RegisterPDVSchema),
    defaultValues
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting }
  } = methods;
  const [errorMsg, setErrorMsg] = useState('');

  const [municipios, setMunicipios] = useState([]);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);
  const { locations } = useSelector((state) => state.locations);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const databody = {
        name: data.name,
        description: data.description,
        address: data.address,
        phoneNumber: data.phoneNumber,
        main: data.main,
        company: { id: data.company.id },
        location: {
          id: data.municipio.id
        }
      };
      await createPDV(databody);
      // TODO: faltan municipios en el endpoint (cali por ejemplo)

      enqueueSnackbar('Registro del punto de venta completado', {
        variant: 'success'
      });
      setPrevValues(data);
      // TODO: si tengo prevValues, entonces hago un update, sino hago un create

      setActiveStep(2);
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  // TODO: validar que el departamento tenga municipios

  // useEffect(() => {
  //   if (company !== undefined && company !== null) {
  //     setFieldValue('company', { id: company[0] ? company[0].id : company.id });
  //     console.log(company);
  //   }
  // }, [company, setFieldValue]);
  // useEffect(() => {
  //   // setMunicipios(department?.towns);
  //   const towns = department?.towns ? department.towns : [];
  //   setMunicipios(towns);
  //   // setMunicipios(municipiosOfDepartment);
  // }, [values.departamento, department]);

  const departmentValue = watch('departamento');
  const [searchQueryMunicipio, setSearchQueryMunicipio] = React.useState('');
  const [searchQueryDepartamento, setSearchQueryDepartamento] = React.useState('');
  const isOptionEqualToValue = (option, value = '') => {
    if (option && value) {
      return option.id === value.id && option.name === value.name;
    }
    return false;
  };

  useEffect(() => {
    if (departmentValue) {
      setMunicipios(departmentValue.towns);
      const selectedMunicipio = watch('municipio');
      if (selectedMunicipio) {
        const municipioExist = departmentValue.towns.filter((municipio) => municipio.name === selectedMunicipio.name);
        if (municipioExist.length === 0) {
          setValue('municipio', '');
          setSearchQueryMunicipio('');
        }
      }
    } else {
      setMunicipios([]);
      setValue('municipio', null);
      setSearchQueryMunicipio('');
    }
  }, [departmentValue, locations, setValue, watch]);

  const handleInputDepartamentoChange = (event, value) => {
    setSearchQueryDepartamento(value);
  };

  const handleInputMunicipioChange = (event, value) => {
    setSearchQueryMunicipio(value);
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack sx={{ marginTop: 1 }} spacing={3}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <Typography sx={{ mb: 3 }} variant="subtitle1" textAlign="center">
          Agrega tu punto de venta principal, despues podrás agregar más puntos de venta.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Nombre Punto De Venta" name="name" />
          <RHFTextField fullWidth label="Descripción" name="description" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFAutocomplete
            name="departamento"
            placeholder="Ej: Valle del Cauca"
            fullWidth
            label="Departamento"
            onInputChange={handleInputDepartamentoChange}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={(option) => (option.name ? option.name : '')}
            options={locations}
            renderOption={(props, option) => {
              const matches = match(option.name, searchQueryDepartamento);
              const parts = parse(option.name, matches);

              return (
                <li {...props}>
                  <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.primary">
                      {parts.map((part, index) => (
                        <span
                          key={index}
                          style={{
                            fontWeight: part.highlight ? 700 : 400,
                            color: part.highlight ? theme.palette.primary.main : 'inherit'
                          }}
                        >
                          {part.text}
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </li>
              );
            }}
            noOptionsText={
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                No hay resultados para {searchQueryMunicipio}
              </Typography>
            }
          />
          <RHFAutocomplete
            name="municipio"
            fullWidth
            placeholder="Ej: Cali"
            label="Municipio"
            onInputChange={handleInputMunicipioChange}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={(option) => (option.name ? option.name : '')}
            options={municipios}
            renderOption={(props, option) => {
              const matches = match(option.name, searchQueryMunicipio);
              const parts = parse(option.name, matches);

              return (
                <li {...props}>
                  <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.primary">
                      {parts.map((part, index) => (
                        <span
                          key={index}
                          style={{
                            fontWeight: part.highlight ? 700 : 400,
                            color: part.highlight ? theme.palette.primary.main : 'inherit'
                          }}
                        >
                          {part.text}
                        </span>
                      ))}
                    </Typography>
                  </Box>
                </li>
              );
            }}
            noOptionsText={
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                {municipios.length === 0
                  ? 'Seleciona un departamento'
                  : `No hay resultados para ${searchQueryMunicipio}`}
              </Typography>
            }
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Dirección" name="address" />
          <RHFPhoneNumber
            fullWidth
            type="string"
            variant="outlined"
            placeholder="Ej: 300 123 4567"
            defaultCountry="co"
            countryCodeEditable={false}
            onlyCountries={['co']}
            label="Teléfono"
            name="phoneNumber"
          />
        </Stack>
        <Stack sx={{ marginTop: 8 }} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button color="primary" onClick={handleBack} variant="outlined" component="label">
            Anterior
          </Button>
          <LoadingButton
            color="primary"
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Siguiente paso
          </LoadingButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}

RegisterPDVForm.propTypes = {
  nextStep: PropTypes.func,
  handleBack: PropTypes.func,
  setPrevValues: PropTypes.func,
  prevValues: PropTypes.object,
  setActiveStep: PropTypes.func
};
