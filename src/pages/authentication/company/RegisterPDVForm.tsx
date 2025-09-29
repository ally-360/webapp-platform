/* eslint-disable no-nested-ternary */
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
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import { Box, useTheme } from '@mui/system';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import { GetPDVResponse } from 'src/interfaces/auth/userInterfaces';
import { setStep, setPrevValuesPDV } from 'src/redux/inventory/stepByStepSlice';
import { RegisterPDVSchema } from 'src/interfaces/auth/yupSchemas';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import type { InferType } from 'yup';
import { useNavigate } from 'react-router';

// ----------------------------------------------------------------------

interface Municipio {
  id: string;
  name: string;
}

interface Departamento {
  id: string;
  name: string;
  towns: Array<Municipio>;
}

type RegisterPDVFormValues = InferType<typeof RegisterPDVSchema>;

export default function RegisterPDVForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { createPDV, updatePDV } = useAuthContext();
  const navigator = useNavigate();
  const { prevValuesCompany } = useAppSelector((state) => state.stepByStep);

  if (!prevValuesCompany) {
    throw new Error('prevValuesCompany is required');
    navigator('/404');
  }

  const theme = useTheme();

  const preValuesPDV: GetPDVResponse | undefined = useAppSelector((state) => state.stepByStep.preValuesPDV);
  const { locations } = useAppSelector((state) => state.locations);

  console.log('preValuesPDV', preValuesPDV);

  const defaultValues: RegisterPDVFormValues = {
    name: preValuesPDV?.name ?? '',
    description: preValuesPDV?.description ?? '',
    departamento:
      typeof preValuesPDV?.departamento === 'object' &&
      preValuesPDV?.departamento !== null &&
      Object.keys(preValuesPDV.departamento).length > 0
        ? preValuesPDV.departamento
        : ({} as any),
    municipio:
      preValuesPDV?.location && Object.keys(preValuesPDV.location).length > 0 ? preValuesPDV.location : ({} as any),
    address: preValuesPDV?.address ?? '',
    phoneNumber: preValuesPDV?.phoneNumber ?? '',
    main: true,
    companyId: prevValuesCompany?.id
  };

  const methods = useForm<RegisterPDVFormValues>({
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

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Validar que municipio tenga datos válidos
      const municipio = data.municipio as any;
      if (!municipio || Object.keys(municipio).length === 0 || !municipio.id) {
        setErrorMsg('Por favor selecciona un municipio válido');
        return;
      }

      // Crear datos para enviar al backend (sin municipio y departamento)
      const { departamento: _departamento, municipio: _, ...pdvData } = data;

      const databody = {
        ...pdvData,
        location: municipio
      };

      if (preValuesPDV?.id) {
        // TODO: validar que funcione el update
        await updatePDV(preValuesPDV.id, databody);
      } else {
        await createPDV(databody);
      }

      enqueueSnackbar('Registro del punto de venta completado', {
        variant: 'success'
      });

      dispatch(setPrevValuesPDV(databody as unknown as GetPDVResponse));
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

  const departmentValue: Partial<Departamento> = watch('departamento');
  const [searchQueryMunicipio, setSearchQueryMunicipio] = React.useState('');
  const [searchQueryDepartamento, setSearchQueryDepartamento] = React.useState('');
  const isOptionEqualToValue = (option: any, value: any) => {
    // Si value es null, undefined o un objeto vacío, no hay coincidencia
    if (!value || Object.keys(value).length === 0) {
      return false;
    }

    // Si option es null o undefined, no hay coincidencia
    if (!option) {
      return false;
    }

    // Comparar por id y name si ambos existen
    if (option.id && value.id) {
      return option.id === value.id;
    }

    return false;
  };

  useEffect(() => {
    if (departmentValue && Object.entries(departmentValue).length !== 0) {
      setMunicipios(departmentValue.towns ?? []);
      const selectedMunicipio = watch('municipio') as Partial<Municipio>;
      if (selectedMunicipio && Object.keys(selectedMunicipio).length > 0) {
        const municipioExist = (departmentValue.towns ?? []).filter(
          (municipio) => municipio.name === selectedMunicipio.name
        );
        if (municipioExist.length === 0) {
          setValue('municipio', {} as any);
          setSearchQueryMunicipio('');
        }
      }
    } else {
      setMunicipios([]);
      setValue('municipio', {} as any);
      setSearchQueryMunicipio('');
    }
  }, [departmentValue, locations, setValue, watch]);

  const handleInputDepartamentoChange = (event, value) => {
    setSearchQueryDepartamento(value || '');
    console.log(value);
    console.log(departmentValue);
  };

  const handleInputMunicipioChange = (event, value) => {
    setSearchQueryMunicipio(value || '');
    console.log(value);
    console.log(departmentValue);
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
            getOptionLabel={(option) => (option && option.name ? option.name : '')}
            options={locations}
            value={watch('departamento') || null}
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
            getOptionLabel={(option) => (option && option.name ? option.name : '')}
            options={municipios}
            value={watch('municipio') || null}
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
                {departmentValue && Object.keys(departmentValue).length === 0
                  ? 'Seleciona un departamento'
                  : searchQueryMunicipio.length > 0
                  ? `No hay resultados para ${searchQueryMunicipio}`
                  : 'Seleciona un departamento primero'}
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
