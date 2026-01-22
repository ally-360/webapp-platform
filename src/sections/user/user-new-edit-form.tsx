/* eslint-disable no-await-in-loop */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
// utils
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
// components
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSwitch, RHFTextField, RHFAutocomplete, RHFSelect } from 'src/components/hook-form';
import { Divider, IconButton, Tooltip, Zoom } from '@mui/material';
import { Icon } from '@iconify/react';
import MenuItem from '@mui/material/MenuItem';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useTheme } from '@mui/material/styles';
import { useCreateContactMutation, useUpdateContactMutation } from 'src/redux/services/contactsApi';
import { useGetDepartmentsQuery, useGetCitiesQuery } from 'src/redux/services/locationsApi';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

// Map UI form values to backend ContactCreateRequest payload
import type { ContactCreateRequest, ContactType, PersonType, IdType } from 'src/redux/services/contactsApi';

function mapFormToContactPayload(data: any): ContactCreateRequest {
  // type mapping: 1 -> client, 2 -> provider
  const type: ContactType[] = data?.type === 2 ? ['provider'] : ['client'];

  // id_type mapping
  let id_type: IdType | undefined;
  if (data?.identity?.typeDocument === 2) {
    id_type = 'NIT';
  } else if (data?.identity?.typeDocument === 1) {
    id_type = 'CC';
  }

  // person type mapping (only relevant for NIT)
  let person_type: PersonType | undefined;
  if (data?.identity?.typeDocument === 2) {
    person_type = data?.identity?.typePerson === 2 ? 'juridica' : 'natural';
  } else {
    person_type = 'natural';
  }

  // name: if natural -> join name + lastname; if juridica -> use provided name as business name
  const isJuridica = id_type === 'NIT' && person_type === 'juridica';
  const joinedName = isJuridica
    ? data?.name || ''
    : [data?.name, data?.lastname]
        .filter((p) => !!p)
        .join(' ')
        .trim();

  // compose billing address
  const billing_address = data?.address
    ? {
        address: data.address || undefined,
        city: data?.town?.name || undefined,
        state: data?.departamento?.name || undefined,
        country: 'CO'
      }
    : undefined;

  const rawNumber = data?.identity?.number as any;
  const id_number =
    rawNumber !== undefined && rawNumber !== null && String(rawNumber).trim() !== '' ? String(rawNumber) : undefined;
  const rawDv = data?.identity?.dv as any;

  const payload: ContactCreateRequest = {
    name: joinedName,
    type,
    email: data?.email || undefined,
    // map phones: mobile from phoneNumber, phone_primary from phoneNumber2
    mobile: data?.phoneNumber || undefined,
    phone_primary: data?.phoneNumber2 || undefined,
    id_type,
    id_number,
    dv: isJuridica && rawDv !== undefined && rawDv !== null && String(rawDv).trim() !== '' ? Number(rawDv) : null,
    person_type,
    billing_address,
    is_active: true
  };

  return payload;
}

// Helper to map contact back to form values for editing
function mapContactToFormValues(contact: any) {
  if (!contact) return {};

  // Extract type: convert array back to number
  const typeNum = contact.type?.includes('provider') ? 2 : 1;

  // Extract identity info
  const typeDocument = contact.id_type === 'NIT' ? 2 : 1;
  const typePerson = contact.person_type === 'juridica' || contact.person_type === 'JURIDICA' ? 2 : 1;

  // Parse name for natural persons (might have lastname)
  let name = contact.name || '';
  let lastname = '';

  if (typeDocument === 1 || (typeDocument === 2 && typePerson === 1)) {
    // Natural person - try to split name
    const nameParts = (contact.name || '').split(' ');
    if (nameParts.length > 1) {
      name = nameParts[0];
      lastname = nameParts.slice(1).join(' ');
    }
  }

  return {
    name,
    lastname,
    email: contact.email || '',
    phoneNumber: contact.mobile || '',
    phoneNumber2: contact.phone_primary || '',
    address: contact.billing_address?.address || '',
    type: typeNum,
    identity: {
      typeDocument,
      number: contact.id_number ? Number(contact.id_number) : '',
      dv: contact.dv || null,
      typePerson
    },
    // For now, we don't reconstruct departamento/town from address
    departamento: null,
    town: null,
    sendEmail: false // Default value
  };
}

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    lastname: Yup.string().optional(),
    email: Yup.string().required('Correo electronico es requerido').email('Ingrese un correo valido'),
    phoneNumber: Yup.string().required('Número de celular es requerido'),
    phoneNumber2: Yup.string().optional(),
    address: Yup.string().required('Dirección es requerida'),
    type: Yup.number().required('Tipo de contacto es requerido'),
    departamento: Yup.mixed().nullable().optional(),
    town: Yup.mixed().nullable().optional(),
    sendEmail: Yup.boolean().optional(),
    // not required
    identity: Yup.object().shape({
      typeDocument: Yup.number().required('Tipo de identificación es requerido'),
      number: Yup.number().required('Number is required'),
      dv: Yup.number().nullable().optional(),
      typePerson: Yup.number().optional()
    })
  });

  type FormValues = {
    name: string;
    lastname: string | null;
    email: string;
    address: string;
    phoneNumber: string | null;
    phoneNumber2: string | null;
    type: number;
    identity: {
      typeDocument: number;
      number: string | number | null;
      dv: number | null;
      typePerson: number;
    };
    departamento: any | null;
    town: any | null;
    sendEmail: boolean;
  };

  const defaultValues: FormValues = useMemo(() => {
    if (currentUser) {
      return mapContactToFormValues(currentUser) as FormValues;
    }
    return {
      name: '',
      lastname: '',
      email: '',
      address: '',
      phoneNumber: '',
      phoneNumber2: '',
      type: 1,
      identity: {
        typeDocument: 1,
        number: '',
        dv: null,
        typePerson: 1
      },
      departamento: null,
      town: null,
      sendEmail: false
    };
  }, [currentUser]);

  const methods = useForm<any>({
    resolver: yupResolver(NewUserSchema),
    defaultValues
  });

  const theme = useTheme();

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const values = watch();

  // RTK Query hooks for departments and cities
  const { data: departmentsResponse, isLoading: isDepartmentsLoading } = useGetDepartmentsQuery();
  const departments = useMemo(() => departmentsResponse?.departments || [], [departmentsResponse]);

  // Watch for department changes to fetch cities
  const selectedDepartment = watch('departamento');
  const departmentId = selectedDepartment?.id;

  const { data: citiesResponse, isLoading: isCitiesLoading } = useGetCitiesQuery(
    { department_id: departmentId },
    { skip: !departmentId }
  );
  const cities = useMemo(() => citiesResponse?.cities || [], [citiesResponse]);

  const [createContact] = useCreateContactMutation();
  const [updateContact] = useUpdateContactMutation();

  const onSubmit = handleSubmit(async (data) => {
    try {
      // Remove department
      const { departamento: _departamento, ...rest } = data;

      if (currentUser?.id) {
        // Update existing contact
        await updateContact({
          id: currentUser.id,
          ...mapFormToContactPayload(rest)
        }).unwrap();
      } else {
        // Create new contact
        await createContact(mapFormToContactPayload(rest)).unwrap();
      }

      reset();
      enqueueSnackbar(
        currentUser ? 'Se ha actualizado correctamente el contacto!' : 'Se ha creado correctamente el contacto!'
      );
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error(error);
      const err = error as any;
      const messages = err?.data?.detail || err?.data?.message || err?.error || 'Error al procesar contacto';
      const msg = Array.isArray(messages) ? messages.map((m) => t(String(m))).join(' | ') : t(String(messages));
      enqueueSnackbar(msg, { variant: 'error' });
    }
  });

  // no-op

  // ----------------------------------------------------------------------

  const [searchQueryMunicipio, setSearchQueryMunicipio] = useState('');
  const [searchQueryDepartamento, setSearchQueryDepartamento] = useState('');

  // Effect to clear city when department changes
  useEffect(() => {
    if (selectedDepartment) {
      // Check if current city belongs to selected department
      const currentCity = watch('town');
      if (currentCity && currentCity.department_id !== selectedDepartment.id) {
        setValue('town', null);
        setSearchQueryMunicipio('');
      }
    } else {
      setValue('town', null);
      setSearchQueryMunicipio('');
    }
  }, [selectedDepartment, setValue, watch]);

  // Effect to populate department and city when editing
  useEffect(() => {
    if (currentUser && departments.length > 0) {
      const stateName = currentUser.billing_address?.state;
      const cityName = currentUser.billing_address?.city;

      if (stateName && !selectedDepartment) {
        // Find department by name
        const department = departments.find((dept) => dept.name === stateName);
        if (department) {
          setValue('departamento', department);

          // If we also have a city name, we'll set it when cities load
          if (cityName && cities.length > 0) {
            const city = cities.find((c) => c.name === cityName && c.department_id === department.id);
            if (city) {
              setValue('town', city);
            }
          }
        }
      }
    }
  }, [currentUser, departments, cities, selectedDepartment, setValue]);

  const handleInputDepartamentoChange = (event, value) => {
    setSearchQueryDepartamento(value);
  };

  const handleInputMunicipioChange = (event, value) => {
    setSearchQueryMunicipio(value);
  };

  const getCitiesNoOptionsText = () => {
    if (!selectedDepartment) return 'Selecciona un departamento';
    if (isCitiesLoading) return 'Cargando ciudades...';
    return 'No hay ciudades disponibles';
  };

  const isOptionEqualToValue = (option: any, value: any) => {
    if (!option || !value) return false;
    if (typeof option === 'object' && typeof value === 'object') {
      return option.id === value.id && option.name === value.name;
    }
    return false;
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3, overflow: 'visible', zIndex: 99 }}>
            <Typography variant="h4">Información general</Typography>
            <Divider sx={{ mb: 3, mt: 0.5 }} />

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)'
              }}
            >
              <RHFSelect name="type" label="Tipo de contacto">
                <MenuItem value={1}>Cliente</MenuItem>
                <MenuItem value={2}>Proveedor</MenuItem>
              </RHFSelect>
              <RHFSelect name="identity.typeDocument" label="Tipo de contacto">
                <MenuItem value={1}>CC - Cédula de ciudadania</MenuItem>
                <MenuItem value={2}>NIT - Número de identificación tributaria</MenuItem>
              </RHFSelect>

              {values.identity.typeDocument === 2 && (
                <RHFSelect name="identity.typePerson" label="Tipo de persona* ">
                  <MenuItem value={1}>Natural</MenuItem>
                  <MenuItem value={2}>Juridica</MenuItem>
                </RHFSelect>
              )}

              {/* Si es NIT y Juridica se manda Razón social o nombre completo */}

              {values.identity.typeDocument === 1 ||
              (values.identity.typeDocument === 2 && values.identity.typePerson === 1) ? (
                <>
                  <RHFTextField name="identity.number" type="number" label="Número de identificación *" />

                  <RHFTextField name="name" label="Nombres" />
                  <RHFTextField name="lastname" label="Apellidos" />
                </>
              ) : (
                values.identity.typeDocument === 2 &&
                values.identity.typePerson === 2 && (
                  <>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <RHFTextField
                        sx={{ flex: 3 }}
                        name="identity.number"
                        type="number"
                        label="Número de identificación *"
                      />
                      <RHFTextField sx={{ flex: 1 }} type="number" name="identity.dv" label="DV *" />
                    </Stack>
                    <RHFTextField name="name" label="Razón social / Nombre completo *" />
                  </>
                )
              )}
              <RHFAutocomplete
                name="departamento"
                placeholder="Ej: Valle del Cauca"
                fullWidth
                label="Departamento"
                onInputChange={handleInputDepartamentoChange}
                isOptionEqualToValue={isOptionEqualToValue}
                getOptionLabel={(option) => (option.name ? option.name : '')}
                options={departments}
                loading={isDepartmentsLoading}
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
                    {isDepartmentsLoading ? 'Cargando departamentos...' : 'No hay departamentos disponibles'}
                  </Typography>
                }
              />
              <RHFAutocomplete
                name="town"
                fullWidth
                placeholder="Ej: Cali"
                label="Municipio"
                onInputChange={handleInputMunicipioChange}
                isOptionEqualToValue={isOptionEqualToValue}
                getOptionLabel={(option) => (option.name ? option.name : '')}
                options={cities}
                loading={isCitiesLoading}
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
                    {getCitiesNoOptionsText()}
                  </Typography>
                }
              />
              {/* Colocar departamento y municipio */}
              <RHFTextField name="address" label="Dirección *" />
            </Box>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h4">Contacto</Typography>
            <Divider sx={{ mb: 3, mt: 0.5 }} />

            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)'
              }}
            >
              <RHFTextField name="email" label="Correo electrónico" />
              <RHFPhoneNumber
                fullWidth
                label="Celular"
                name="phoneNumber"
                type="string"
                placeholder="Ej: 300 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}

                // onlyCountries={['co']}
              />
              <RHFTextField name="phoneNumber2" label="Teléfono" />
            </Box>
          </Card>
        </Grid>
        <Grid
          sx={{
            position: 'sticky ',
            top: '50px',
            height: 'fit-content'
          }}
          xs={12}
          md={4}
        >
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center">
                <RHFSwitch
                  sx={{ margin: 0 }}
                  label="Enviar estado de cuenta al correo"
                  name="sendEmail"
                  helperText=" "
                />
                <Tooltip
                  title="En cada factura enviada por correo, tu cliente recibirá su estado de cuenta."
                  TransitionComponent={Zoom}
                  arrow
                >
                  <IconButton>
                    <Icon icon="ph:question" width={20} height={20} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <LoadingButton
                color="primary"
                type="submit"
                sx={{ mt: 3 }}
                fullWidth
                variant="outlined"
                loading={isSubmitting}
              >
                Guardar y crear otro
              </LoadingButton>
              <Stack direction="row" alignItems="center" sx={{ mt: 1.5 }} gap={1.5}>
                <Button fullWidth variant="outlined" color="error">
                  Cancelar
                </Button>
                <LoadingButton color="primary" type="submit" fullWidth variant="contained" loading={isSubmitting}>
                  {!currentUser ? 'Guardar' : 'Guardar cambios'}
                </LoadingButton>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object
};
