// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tooltip,
  Zoom,
  MenuItem
} from '@mui/material';
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
import { createContact, closePopup } from 'src/redux/inventory/contactsSlice';
import { store } from 'src/redux/store';
import { LoadingButton } from '@mui/lab';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import { useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function UserPopupCreateView() {
  return <UserNewEditFormPopup />;
}

// ----------------------------------------------------------------------

function UserNewEditFormPopup({ currentUser }) {
  const router = useRouter();
  const { contactsPopup: open } = useAppSelector((state) => state.contacts);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const submitRef = useRef<HTMLButtonElement | null>(null);

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    lastname: Yup.string().optional(),
    email: Yup.string().required('Correo electronico es requerido').email('Ingrese un correo valido'),
    phoneNumber: Yup.string().required('Número de celular es requerido'),
    phoneNumber2: Yup.string().optional(),
    address: Yup.string().required('Dirección es requerida'),
    type: Yup.number().required('Tipo de contacto es requerido'),
    sendEmail: Yup.boolean().optional(),
    // not required
    identity: Yup.object().shape({
      typeDocument: Yup.number().required('Tipo de identificación es requerido'),
      number: Yup.number().required('Number is required'),
      dv: Yup.number().nullable().optional(),
      typePerson: Yup.number().optional()
    }),
    departamento: Yup.object()
      .shape({ id: Yup.string().required(), name: Yup.string().required() })
      .required('El departamento es requerido'),
    town: Yup.object()
      .shape({ id: Yup.string().required(), name: Yup.string().required() })
      .required('El municipio es requerido')
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
      sendEmail: currentUser?.sendEmail ?? false,
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

  const {
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const values = watch();

  const onSubmit = async (data: any) => {
    try {
      const { departamento: _departamento, town, identity, ...rest } = data;

      if (!_departamento || !town?.id) {
        enqueueSnackbar('Selecciona un departamento y municipio antes de guardar.', {
          variant: 'warning'
        });
        return;
      }

      const mappedIdentity = {
        ...identity
      };

      const payload: any = {
        ...rest,
        identity: mappedIdentity,
        townId: town?.id
      };

      const created = await dispatch<any>(createContact(payload));

      if (!created || (created as any)?.error) {
        const err = store.getState().contacts.contactError as unknown as string;
        const message = typeof err === 'string' ? err : 'No se pudo crear el contacto';
        enqueueSnackbar(message, { variant: 'error' });
        return;
      }

      reset();
      enqueueSnackbar(
        currentUser ? 'Se ha actualizado correctamente el usuario!' : 'Se ha creado correctamente el contacto!'
      );
      dispatch(closePopup());
      router.push(paths.dashboard.user.list);
    } catch (error) {
      console.error(error);
    }
  };

  // Removed unnecessary effect that only destructured an unused variable

  // ----------------------------------------------------------------------

  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);

  const { locations } = useAppSelector((state) => state.locations);
  const departmentValue = watch('departamento');
  const [searchQueryMunicipio, setSearchQueryMunicipio] = useState('');
  const [searchQueryDepartamento, setSearchQueryDepartamento] = useState('');
  const [municipios, setMunicipios] = useState<any[]>([]);

  useEffect(() => {
    if (departmentValue) {
      setMunicipios((departmentValue as any).towns || []);
      const selectedMunicipio = watch('town');
      if (selectedMunicipio) {
        const municipioExist = ((departmentValue as any).towns || []).filter(
          (town: any) => town.name === selectedMunicipio.name
        );
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

  const handleInputDepartamentoChange = useCallback((_event, value) => {
    setSearchQueryDepartamento(value);
  }, []);

  const handleInputMunicipioChange = useCallback((_event, value) => {
    setSearchQueryMunicipio(value);
  }, []);

  const isOptionEqualToValue = React.useMemo(
    () =>
      (option, value = '') => {
        if (option && value) {
          return (option as any).id === (value as any).id && (option as any).name === (value as any).name;
        }
        return false;
      },
    []
  );

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Dialog
        sx={{ zIndex: 99999999999999 }}
        fullWidth
        maxWidth="md"
        open={open}
        onClose={() => dispatch(closePopup())}
      >
        <DialogTitle boxShadow={2} sx={{ padding: '23px  40px 18px 40px!important', zIndex: 999 }}>
          <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="ic:round-store" width={24} height={24} />
            <Box sx={{ fontSize: 18, fontWeight: 500 }}>Crear Contacto</Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => dispatch(closePopup())}
            sx={{
              position: 'absolute',
              right: 10,
              top: 16,
              color: (theme as any).palette.primary.main
            }}
          >
            <Icon icon="ic:round-close" width={24} height={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* The inner form is rendered by FormProvider */}

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
                    getOptionLabel={(option) => ((option as any).name ? (option as any).name : '')}
                    options={locations}
                    renderOption={(props, option) => {
                      const matches = match((option as any).name, searchQueryDepartamento);
                      const parts = parse((option as any).name, matches);

                      return (
                        <li {...props}>
                          <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.primary">
                              {parts.map((part, index) => (
                                <span
                                  key={index}
                                  style={{
                                    fontWeight: part.highlight ? 700 : 400,
                                    color: part.highlight ? (theme as any).palette.primary.main : 'inherit'
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
                        No hay resultados para {searchQueryDepartamento}
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
                    getOptionLabel={(option) => ((option as any).name ? (option as any).name : '')}
                    options={municipios}
                    renderOption={(props, option) => {
                      const matches = match((option as any).name, searchQueryMunicipio);
                      const parts = parse((option as any).name, matches);

                      return (
                        <li {...props}>
                          <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.primary">
                              {parts.map((part, index) => (
                                <span
                                  key={index}
                                  style={{
                                    fontWeight: part.highlight ? 700 : 400,
                                    color: part.highlight ? (theme as any).palette.primary.main : 'inherit'
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
                    label="Celular"
                    name="phoneNumber"
                    type="string"
                    placeholder="Ej: 300 123 4567"
                    defaultCountry="co"
                    countryCodeEditable={false}
                  />
                  <RHFTextField name="phoneNumber2" label="Teléfono" />
                </Box>{' '}
                <Stack direction="row" alignItems="center">
                  <RHFSwitch
                    sx={{ margin: 0 }}
                    label="Enviar estado de cuenta al correo"
                    name="sendEmail"
                    helperText=""
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
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button fullWidth variant="outlined" onClick={() => dispatch(closePopup())} color="error">
            Cancelar
          </Button>
          <LoadingButton
            color="primary"
            onClick={() => submitRef.current?.click()}
            fullWidth
            variant="contained"
            loading={isSubmitting}
            type="submit"
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
