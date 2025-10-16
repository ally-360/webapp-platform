/* eslint-disable no-nested-ternary */
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import FormProvider from 'src/components/hook-form/form-provider';
import { Box, useTheme } from '@mui/system';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import { RegisterPDVSchema } from 'src/interfaces/auth/yupSchemas';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { setPDVData, setPDVResponse, goToNextStep, goToPreviousStep } from 'src/redux/slices/stepByStepSlice';
import { useCreatePDVMutation, useUpdatePDVMutation, useGetAllPDVsQuery } from 'src/redux/services/authApi';
import { useGetDepartmentsQuery, useGetCitiesQuery } from 'src/redux/services/locationsApi';
import type { Department, City } from 'src/redux/services/locationsApi';

// ----------------------------------------------------------------------

type RegisterPDVFormValues = {
  name: string;
  departamento: Department | null;
  municipio: City | null;
  address: string;
  phone_number: string;
  main: boolean;
  company_id: string;
};

export default function RegisterPDVForm() {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const companyResponse = useAppSelector((state) => state.stepByStep.companyResponse);
  const pdvData = useAppSelector((state) => state.stepByStep.pdvData);
  const pdvResponse = useAppSelector((state) => state.stepByStep.pdvResponse);
  const { data: departments } = useGetDepartmentsQuery();
  const { data: allPDVs } = useGetAllPDVsQuery();

  // Query hooks for creating and updating PDVs
  const [createPDV] = useCreatePDVMutation();
  const [updatePDV] = useUpdatePDVMutation();

  const firstPDV = allPDVs?.pdvs?.[0];
  const isEditing = !!firstPDV;

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [hasInitialReset, setHasInitialReset] = useState(false);

  const defaultValues: RegisterPDVFormValues = {
    name: firstPDV?.name || pdvResponse?.name || pdvData?.name || '',
    departamento: null as any,
    municipio: null as any,
    address: firstPDV?.address || pdvResponse?.address || pdvData?.address || '',
    phone_number: firstPDV?.phone_number || pdvResponse?.phone_number || pdvData?.phone_number || '',
    main: true,
    company_id: companyResponse?.id || ''
  };

  const methods = useForm<RegisterPDVFormValues>({
    resolver: yupResolver(RegisterPDVSchema),
    defaultValues
  });

  const {
    handleSubmit,
    setValue,
    reset,
    setError: setFormError,
    formState: { isSubmitting }
  } = methods;
  const [errorMsg, setErrorMsg] = useState('');

  const departmentId = selectedDepartment?.id || null;
  const { data: cities } = useGetCitiesQuery(departmentId ? { department_id: departmentId } : { limit: 0 }, {
    skip: !departmentId
  });

  const filteredCities = cities?.cities || [];

  useEffect(() => {
    if (firstPDV && !pdvResponse) {
      dispatch(
        setPDVResponse({
          id: firstPDV.id,
          name: firstPDV.name,
          address: firstPDV.address,
          phone_number: firstPDV.phone_number || '',
          department_id: firstPDV.department_id ? Number(firstPDV.department_id) : undefined,
          city_id: firstPDV.city_id ? Number(firstPDV.city_id) : undefined,
          main: true,
          company_id: companyResponse?.id || '',
          created_at: firstPDV.created_at,
          updated_at: firstPDV.updated_at
        })
      );
    }
  }, [firstPDV, pdvResponse, dispatch, companyResponse]);

  useEffect(() => {
    if (departments?.departments && (firstPDV?.department_id || pdvResponse?.department_id)) {
      const savedDepartmentId = firstPDV?.department_id || pdvResponse?.department_id;

      if (savedDepartmentId) {
        const foundDepartment = departments.departments.find((dept) => dept.id === Number(savedDepartmentId));
        if (foundDepartment && (!selectedDepartment || selectedDepartment.id !== foundDepartment.id)) {
          console.log('🔄 Restoring department:', foundDepartment);
          setSelectedDepartment(foundDepartment);
          setValue('departamento', foundDepartment);
        }
      }
    }
  }, [departments, firstPDV, pdvResponse, selectedDepartment, setValue]);

  useEffect(() => {
    if (selectedDepartment && cities?.cities && (firstPDV?.city_id || pdvResponse?.city_id)) {
      const savedCityId = firstPDV?.city_id || pdvResponse?.city_id;

      if (savedCityId) {
        const foundCity = cities.cities.find((city) => city.id === Number(savedCityId));
        if (foundCity && (!selectedCity || selectedCity.id !== foundCity.id)) {
          console.log('🔄 Restoring city:', foundCity);
          setSelectedCity(foundCity);
          setValue('municipio', foundCity);
        }
      }
    }
  }, [selectedDepartment, cities, firstPDV, pdvResponse, selectedCity, setValue]);

  useEffect(() => {
    if (selectedDepartment && selectedCity && !hasInitialReset) {
      const completeFormData = {
        name: firstPDV?.name || pdvResponse?.name || pdvData?.name || '',
        departamento: selectedDepartment,
        municipio: selectedCity,
        address: firstPDV?.address || pdvResponse?.address || pdvData?.address || '',
        phone_number: firstPDV?.phone_number || pdvResponse?.phone_number || pdvData?.phone_number || '',
        main: true,
        company_id: companyResponse?.id || ''
      };

      reset(completeFormData);
      setHasInitialReset(true);
    }
  }, [selectedDepartment, selectedCity, hasInitialReset, firstPDV, pdvResponse, pdvData, companyResponse, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      const municipio = data.municipio as any;
      const departamento = data.departamento as any;

      if (!municipio || Object.keys(municipio).length === 0 || !municipio.id) {
        setErrorMsg('Por favor selecciona un municipio válido');
        return;
      }

      if (!departamento || Object.keys(departamento).length === 0 || !departamento.id) {
        setErrorMsg('Por favor selecciona un departamento válido');
        return;
      }

      const pdvPayload = {
        name: data.name,
        address: data.address,
        phone_number: data.phone_number || null,
        department_id: departamento.id,
        city_id: municipio.id,
        is_active: true
      };

      let result;
      if (isEditing && firstPDV?.id) {
        result = await updatePDV({ id: firstPDV.id, data: pdvPayload }).unwrap();
        enqueueSnackbar('Punto de venta actualizado exitosamente', { variant: 'success' });
      } else {
        result = await createPDV(pdvPayload).unwrap();
        enqueueSnackbar('Punto de venta creado exitosamente', { variant: 'success' });
      }

      dispatch(
        setPDVData({
          name: data.name,
          description: '',
          address: data.address,
          phone_number: data.phone_number || '',
          location: {
            id: String(municipio.id),
            name: municipio.name
          },
          main: true,
          company_id: companyResponse?.id || ''
        })
      );

      dispatch(
        setPDVResponse({
          id: result.id,
          name: result.name,
          address: result.address,
          phone_number: result.phone_number || '',
          department_id: departamento.id,
          city_id: municipio.id,
          main: true,
          company_id: companyResponse?.id || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      );

      dispatch(goToNextStep());
    } catch (error: any) {
      console.error('❌ PDV error:', error);

      let errorMessage = isEditing ? 'Error actualizando el punto de venta' : 'Error creando el punto de venta';

      if (error?.data?.detail && Array.isArray(error.data.detail)) {
        error.data.detail.forEach((err: any) => {
          if (err.loc && err.loc[1]) {
            const fieldName = err.loc[1];
            const fieldError = err.msg || 'Error de validación';
            setFormError(fieldName, { message: fieldError });
          }
        });

        const validationErrors = error.data.detail.map((err: any) => err.msg || 'Error de validación').join(', ');
        errorMessage = `Errores de validación: ${validationErrors}`;
      } else if (error?.data?.detail && typeof error.data.detail === 'string') {
        errorMessage = error.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrorMsg(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  });

  const handleBack = () => {
    dispatch(goToPreviousStep());
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">{isEditing ? 'Editar Punto de Venta' : 'Registrar Punto de Venta'}</Typography>
      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">Datos del punto de venta principal</Typography>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

      <RHFTextField name="name" label="Nombre del punto de venta" />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFAutocomplete
          fullWidth
          name="departamento"
          label="Departamento"
          options={departments?.departments || []}
          getOptionLabel={(option: Department | any) => {
            if (typeof option === 'string') return option;
            return option.name || '';
          }}
          isOptionEqualToValue={(option: Department | any, value: Department | any) => {
            if (!value || Object.keys(value).length === 0) return false;
            return option.id === value.id;
          }}
          renderOption={(props, option: Department, { inputValue }) => {
            const matches = match(option.name, inputValue);
            const parts = parse(option.name, matches);

            return (
              <Box component="li" {...props}>
                <div>
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        fontWeight: part.highlight ? 700 : 400,
                        color: part.highlight ? theme.palette.primary.main : theme.palette.text.primary
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </Box>
            );
          }}
          onChange={(event, newValue) => {
            setSelectedDepartment(newValue || null);
            setSelectedCity(null);
            setValue('departamento', (newValue ?? null) as any, { shouldValidate: true });
            setValue('municipio', null as any, { shouldValidate: false });
          }}
        />

        <RHFAutocomplete
          fullWidth
          name="municipio"
          label="Municipio"
          options={filteredCities || []}
          getOptionLabel={(option: City | any) => {
            if (typeof option === 'string') return option;
            return option.name || '';
          }}
          isOptionEqualToValue={(option: City | any, value: City | any) => {
            if (!value || Object.keys(value).length === 0) return false;
            return option.id === value.id;
          }}
          renderOption={(props, option: City, { inputValue }) => {
            const matches = match(option.name, inputValue);
            const parts = parse(option.name, matches);

            return (
              <Box component="li" {...props}>
                <div>
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      style={{
                        fontWeight: part.highlight ? 700 : 400,
                        color: part.highlight ? theme.palette.primary.main : theme.palette.text.primary
                      }}
                    >
                      {part.text}
                    </span>
                  ))}
                </div>
              </Box>
            );
          }}
          onChange={(event, newValue) => {
            setSelectedCity(newValue || null);
            setValue('municipio', (newValue ?? null) as any, { shouldValidate: true });
          }}
          disabled={!selectedDepartment}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <RHFTextField name="address" label="Dirección" />
        <RHFPhoneNumber
          type="string"
          defaultCountry="co"
          countryCodeEditable={false}
          onlyCountries={['co']}
          name="phone_number"
          label="Teléfono"
          helperText="Ingrese el número de teléfono del punto de venta"
        />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <Button variant="outlined" onClick={handleBack}>
          Volver
        </Button>

        <LoadingButton fullWidth color="primary" size="large" type="submit" variant="contained" loading={isSubmitting}>
          {isEditing ? 'Actualizar' : 'Continuar'}
        </LoadingButton>
      </Stack>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
