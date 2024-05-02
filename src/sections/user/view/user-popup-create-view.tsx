// @mui
// routes
// components
import { useSettingsContext } from 'src/components/settings';
//
import {
  Box,
  Dialog,
  DialogTitle,
  IconButton,
  useTheme,
  Divider,
  Tooltip,
  Zoom,
  DialogActions,
  DialogContent,
  MenuItem
} from '@mui/material';
import { Icon } from '@iconify/react';

/* eslint-disable no-await-in-loop */
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
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

import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import { createContact, togglePopup } from 'src/redux/inventory/contactsSlice';
import { store } from 'src/redux/store';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

export default function UserPopupCreateView() {
  const settings = useSettingsContext();

  const theme = useTheme();

  return <UserNewEditFormPopup />;
}

// ----------------------------------------------------------------------

function UserNewEditFormPopup({ currentUser }) {
  const router = useRouter();
  const { contacsPopup: open } = useAppSelector((state) => state.contacts);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const submitRef = useRef();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    lastname: Yup.string().optional(),
    email: Yup.string().required('Correo electronico es requerido').email('Ingrese un correo valido'),
    phoneNumber: Yup.string().required('Número de celular es requerido'),
    phoneNumber2: Yup.string().optional(),
    address: Yup.string().required('Dirección es requerida'),
    type: Yup.number().required('Tipo de contacto es requerido'),
    // not required
    identity: Yup.object().shape({
      typeDocument: Yup.number().required('Tipo de identificación es requerido'),
      number: Yup.number().required('Number is required'),
      dv: Yup.number().nullable().optional(),
      typePerson: Yup.number().optional()
    })
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      lastname: currentUser?.lastname || null,
      email: currentUser?.email || '',
      address: currentUser?.address || '',
      phoneNumber: currentUser?.phoneNumber || null,
      phoneNumber2: currentUser?.phoneNumber2 || null,
      // Tipo de contacto
      type: currentUser?.type || 1,
      identity: currentUser?.identity || {
        typeDocument: 1,
        number: null,
        dv: 0,
        typePerson: 1
      },
      departamento: currentUser?.departamento || null,
      town: currentUser?.town || null
    }),
    [currentUser]
  );
  const dispatch = useAppDispatch();

  const methods = useForm({
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

  const onSubmit = handleSubmit(async (data) => {
    console.log('data', data);
    try {
      // Remove department
      const { departamento, ...rest } = data;
      console.log('rest send', rest);
      dispatch(createContact(rest));

      while (store.getState().contacts.contactLoading) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      if (store.getState().contacts.contactError) {
        // enqueueSnackbar(store.getState().contacts.contactError, { variant: 'error' });
        const errorMessages = store.getState().contacts.contactError.message;
        if (errorMessages && errorMessages.length > 0) {
          const translatedErrors = errorMessages.map((error) => t(error));
          const combinedMessage = translatedErrors.join(' | ');
          enqueueSnackbar(combinedMessage, { variant: 'error' });
        }
      } else {
        reset();
        enqueueSnackbar(
          currentUser ? 'Se ha actualizado correctamente el usuario!' : 'Se ha creado correctamente el contacto!'
        );
        router.push(paths.dashboard.user.list);
      }
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    // Remove department
    const { departamento, ...rest } = values;
    console.log('rest', rest);
  }, [values]);

  // ----------------------------------------------------------------------

  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);

  const { locations } = useAppSelector((state) => state.locations);
  const departmentValue = watch('departamento');
  const [searchQueryMunicipio, setSearchQueryMunicipio] = useState('');
  const [searchQueryDepartamento, setSearchQueryDepartamento] = useState('');
  const [municipios, setMunicipios] = useState([]);

  useEffect(() => {
    if (departmentValue) {
      setMunicipios(departmentValue.towns);
      const selectedMunicipio = watch('town');
      if (selectedMunicipio) {
        const municipioExist = departmentValue.towns.filter((town) => town.name === selectedMunicipio.name);
        if (municipioExist.length === 0) {
          setValue('town', '');
          setSearchQueryMunicipio('');
        }
      }
    } else {
      setMunicipios([]);
      setValue('town', null);
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
    <FormProvider methods={methods}>
      <Dialog sx={{ zIndex: 99999999999999 }} fullWidth maxWidth="md" open={open} onClose={() => console.log('exit')}>
        <DialogTitle boxShadow={2} sx={{ padding: '23px  40px 18px 40px!important', zIndex: 999 }}>
          <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="ic:round-store" width={24} height={24} />
            <Box sx={{ fontSize: 18, fontWeight: 500 }}>Crear Contacto</Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => dispatch(togglePopup())}
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
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <button ref={submitRef} type="submit" style={{ display: 'none' }} />

            <Grid container spacing={3}>
              <Grid xs={12} md={12}>
                <Card sx={{ p: 3, overflow: 'visible', zIndex: 99, boxShadow: '0' }}>
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
                    <RHFSelect name="identity.typeDocument" label="Tipo de documento">
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
                      name="town"
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

                <Card sx={{ p: 3, mt: 3, boxShadow: '0' }}>
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

                      // onlyCountries={['co']}
                    />
                    <RHFTextField name="phoneNumber2" label="Teléfono" />
                  </Box>{' '}
                  <Stack direction="row" alignItems="center">
                    <RHFSwitch sx={{ margin: 0 }} label="Enviar estado de cuenta al correo" name="sendEmail" />
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
                </Card>
              </Grid>
            </Grid>
          </form>
        </DialogContent>

        <DialogActions>
          <Button fullWidth variant="outlined" onClick={() => dispatch(togglePopup())} color="error">
            Cancelar
          </Button>
          <LoadingButton
            color="primary"
            onClick={() => submitRef.current.click()}
            fullWidth
            variant="contained"
            loading={isSubmitting}
          >
            Guardar
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}

UserNewEditFormPopup.propTypes = {
  currentUser: PropTypes.object
};
