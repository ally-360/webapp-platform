import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
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
import { getPDVResponse } from 'src/auth/interfaces/userInterfaces';
import { setPrevValuesPDV, setStep } from 'src/redux/inventory/stepByStepSlice';
import { RegisterPDVSchema } from 'src/auth/interfaces/yupSchemas';

// ----------------------------------------------------------------------

interface Municipio {
  id: string;
  name: string;
}

export default function RegisterPDVForm() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { company, createPDV } = useAuthContext();
  const { activeStep, prevValuesCompany } = useSelector((state) => state.stepByStep);
  const theme = useTheme();

  const preValuesPDV: getPDVResponse = useSelector((state) => state.stepByStep.prevValuesPDV);
  const { locations } = useSelector((state) => state.locations);

  const defaultValues = {
    name: preValuesPDV?.name || '',
    description: preValuesPDV?.description || '',
    departamento: preValuesPDV?.departamento || {},
    municipio: preValuesPDV?.location || {},
    address: preValuesPDV?.address || '',
    main: true,
    phoneNumber: preValuesPDV?.phoneNumber || '',
    company: { id: prevValuesCompany.id } || {}
  };

  const methods = useForm({
    resolver: yupResolver(RegisterPDVSchema),
    defaultValues
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting }
  } = methods;
  const [errorMsg, setErrorMsg] = useState('');

  const [municipios, setMunicipios] = useState<Array<Municipio>>([]);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const databody: getPDVResponse = {
        ...data,
        location: { id: data.municipio.id }
      };

      delete databody.municipio;
      delete databody.departamento;

      await createPDV(databody);
      // TODO: faltan municipios en el endpoint (cali por ejemplo)

      enqueueSnackbar('Registro del punto de venta completado', {
        variant: 'success'
      });

      // TODO: si tengo prevValues, entonces hago un update, sino hago un create

      dispatch(setPrevValuesPDV(databody));
      dispatch(setStep(2));
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
    if (Object.entries(departmentValue).length !== 0) {
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
                {Object.entries(departmentValue).length === 0
                  ? 'Seleciona un departamento'
                  : `No hay resultados para ${searchQueryMunicipio}`}
              </Typography>
            }
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <RHFTextField fullWidth label="Dirección" name="address" />
          <RHFPhoneNumber
            type="string"
            defaultCountry="co"
            countryCodeEditable={false}
            onlyCountries={['co']}
            label="Teléfono"
            name="phoneNumber"
          />
        </Stack>
        <Stack sx={{ marginTop: 8 }} direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button color="primary" onClick={() => dispatch(setStep(0))} variant="outlined" component="label">
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
