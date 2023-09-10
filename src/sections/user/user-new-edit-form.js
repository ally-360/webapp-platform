import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
// utils
import { fData } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// assets
import { countries } from 'src/assets/data';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect
} from 'src/components/hook-form';
import { CardHeader, Divider, IconButton, Tooltip, Zoom } from '@mui/material';
import { Icon } from '@iconify/react';
import MenuItem from '@mui/material/MenuItem';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useSettingsContext } from 'src/components/settings';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import { useTheme } from '@emotion/react';

// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.lazy((value) => {
      console.log('value', value);
      if (value && value.identificationObject.type === 'NIT' && value.typePerson === 'Juridica') {
        return Yup.string().required('Name is required');
      }
      return Yup.object().shape({
        name: Yup.string().required('First Name is required'),
        lastanem: Yup.string().required('Last Name is required')
      });
    }),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    phoneNumber: Yup.string().required('Phone number is required'),
    phoneNumber2: Yup.string().required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    // not required
    identificationObject: Yup.object().shape({
      type: Yup.string().required('Type is required'),
      number: Yup.string().required('Number is required'),
      dv: Yup.string().optional()
    })
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      address: currentUser?.address || '',
      phoneNumber: currentUser?.phoneNumber || '',
      phoneNumber2: currentUser?.phoneNumber2 || '',
      type: currentUser?.type || 'Customer',
      identificationObject: currentUser?.identificationObject || {
        type: 'CC',
        number: '',
        dv: ''
      },
      typePerson: currentUser?.typePerson || 'Natural',
      departamento: currentUser?.departamento || null,
      municipio: currentUser?.municipio || null
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues
  });

  const theme = useTheme();

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    if (values.identificationObject.type === 'NIT' && values.typePerson === 'Juridica') {
      setValue('name', '');
    } else {
      setValue('name', { name: '', lastname: '' });
    }
  }, [values.identificationObject, values.typePerson, setValue]);

  useEffect(() => console.log('values', values), [values]);

  // ----------------------------------------------------------------------

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);
  const { locations } = useSelector((state) => state.locations);
  const departmentValue = watch('departamento');
  const [searchQueryMunicipio, setSearchQueryMunicipio] = useState('');
  const [searchQueryDepartamento, setSearchQueryDepartamento] = useState('');
  const [municipios, setMunicipios] = useState([]);

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

  const isOptionEqualToValue = (option, value = '') => {
    if (option && value) {
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
                <MenuItem value="Customer">Cliente</MenuItem>
                <MenuItem value="Provider">Proveedor</MenuItem>
              </RHFSelect>
              <RHFSelect name="identificationObject.type" label="Tipo de contacto">
                <MenuItem value="CC">CC - Cédula de ciudadania</MenuItem>
                <MenuItem value="NIT">NIT - Número de identificación tributaria</MenuItem>
              </RHFSelect>

              {values.identificationObject.type === 'NIT' && (
                <RHFSelect name="typePerson" label="Tipo de persona* ">
                  <MenuItem value="Natural">Natural</MenuItem>
                  <MenuItem value="Juridica">Juridica</MenuItem>
                </RHFSelect>
              )}

              {/* Si es NIT y Juridica se manda Razón social o nombre completo */}

              {values.identificationObject.type === 'CC' ||
              (values.identificationObject.type === 'NIT' && values.typePerson === 'Natural') ? (
                <>
                  <RHFTextField name="identificationObject.number" label="Número de identificación *" />

                  <RHFTextField name="name.name" label="Nombres" />
                  <RHFTextField name="name.lastname" label="Apellidos" />
                </>
              ) : (
                values.identificationObject.type === 'NIT' &&
                values.typePerson === 'Juridica' && (
                  <>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <RHFTextField
                        sx={{ flex: 3 }}
                        name="identificationObject.number"
                        label="Número de identificación *"
                      />
                      <RHFTextField sx={{ flex: 1 }} name="identificationObject.dv" label="DV *" />
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
                variant="outlined"
                placeholder="Ej: 300 123 4567"
                defaultCountry="co"
                countryCodeEditable={false}
                onlyCountries={['co']}
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
          item
          xs={12}
          md={4}
        >
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center">
                <RHFSwitch sx={{ margin: 0 }} label="Enviar estado de cuenta al correo" name="isVerified" />
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
