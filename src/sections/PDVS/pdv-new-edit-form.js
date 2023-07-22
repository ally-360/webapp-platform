import PropTypes, { number } from 'prop-types';
import * as Yup from 'yup';
import React, { useMemo, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import parse from 'autosuggest-highlight/parse';

// routes
import { paths } from 'src/routes/paths';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';

// components
import { useSnackbar } from 'src/components/snackbar';
import { useRouter } from 'src/routes/hook';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllMunicipios } from 'src/redux/inventory/locationsSlice';
import match from 'autosuggest-highlight/match';
// eslint-disable-next-line import/no-extraneous-dependencies
import MuiPhoneNumber from 'material-ui-phone-number-2';
import RHFPhoneNumber from 'src/components/hook-form/rhf-phone-number';
import { createPDV, getAllPDVS, getPDVById } from 'src/redux/inventory/pdvsSlice';

import RequestService from '../../axios/services/service';

// ----------------------------------------------------------------------

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function FormPDVS({ open, handleClose }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { editId } = useSelector((state) => state.pdvs);
  const { locations } = useSelector((state) => state.locations);

  const [pdvEdit, setPdvEdit] = useState(null);

  const getPdvInfo = React.useCallback(async () => {
    const resp = await dispatch(getPDVById(editId));
    const municipio = resp.location;
    const departamento = locations.find((dep) => dep.towns.find((m) => m.id === municipio.id));
    const pdv = {
      ...resp,
      municipio,
      departamento
    };
    setPdvEdit(pdv);
  }, [editId, dispatch, setPdvEdit, locations]);

  useEffect(() => {
    if (editId) {
      getPdvInfo();
    } else {
      setPdvEdit(false);
    }
  }, [editId, dispatch, setPdvEdit, getPdvInfo]);

  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();

  const NewPDVSchema = Yup.object().shape({
    name: Yup.string().required('Nombre es requerido'),
    description: Yup.string().required('Descripción es requerida'),
    departamento: Yup.object().required('Departamento es requerido'),
    municipio: Yup.object().required('Municipio es requerido'),
    address: Yup.string().required('Dirección es requerida'),
    phone: Yup.string().required('Teléfono es requerido'),
    main: Yup.boolean().optional()
  });

  const defaultValues = useMemo(
    () => ({
      name: pdvEdit?.name || '',
      description: pdvEdit?.description || '',
      departamento: pdvEdit?.departamento || '',
      municipio: pdvEdit?.municipio || '',
      address: pdvEdit?.address || '',
      phone: pdvEdit?.phone || '',
      // TODO: extraer el company id del usuario logueado
      company: { id: '1b02d2b6-c354-4a74-9e48-5162af036b36' },
      main: pdvEdit?.main || false
    }),
    [pdvEdit]
  );

  const methods = useForm({
    resolver: yupResolver(NewPDVSchema),
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

  useEffect(() => {
    if (pdvEdit) {
      reset(defaultValues);
    }
  }, [pdvEdit, defaultValues, reset]);

  useEffect(() => {
    if (!pdvEdit) {
      reset(defaultValues);
    }
  }, [pdvEdit, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      data.location = { id: data.municipio.id };
      delete data.municipio;
      delete data.departamento;
      if (pdvEdit) {
        await RequestService.editPDV({ id: pdvEdit.id, databody: data });
      } else {
        await RequestService.createPDV(data);
      }
      dispatch(getAllPDVS());
      reset();
      enqueueSnackbar(
        pdvEdit ? t(`Punto De Venta ${data.name} editado correctamente`) : t(`Punto De Venta ${data.name} Creado`),
        {
          variant: 'success'
        }
      );
      dispatch(handleClose());
    } catch (error) {
      enqueueSnackbar(t('No se ha podido crear el punto de venta, verifica los datos nuevamente'), {
        variant: 'error'
      });
      console.log(error);
    }
  });

  // ----------------------------------------------------------------------

  useEffect(() => {
    dispatch(getAllMunicipios());
  }, [dispatch]);
  const [searchQueryMunicipio, setSearchQueryMunicipio] = React.useState('');

  const [searchQueryDepartamento, setSearchQueryDepartamento] = React.useState('');
  const [scroll, setScroll] = React.useState('paper');

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  const [municipios, setMunicipios] = useState([]);
  const departmentValue = watch('departamento');

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

  const handleInputMunicipioChange = (event, value) => {
    setSearchQueryMunicipio(value);
  };

  const handleInputDepartamentoChange = (event, value) => {
    setSearchQueryDepartamento(value);
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      maxWidth="sm"
      fullWidth
      onClose={() => dispatch(handleClose())}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle id="scroll-dialog-title" boxShadow={2} sx={{ padding: '23px  40px 18px 40px!important' }}>
          <Box gap={1} p={0} sx={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="ic:round-store" width={24} height={24} />
            {t('Crear Punto De Venta')}
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            // Estilos para el scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
              background: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '0px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555'
            }
          }}
          dividers={scroll === 'paper'}
        >
          <DialogContentText id="alert-dialog-slide-description" ref={descriptionElementRef} tabIndex={-1}>
            <Grid container spacing={3}>
              <Stack spacing={2} mt={1} sx={{ p: 3, width: '100%' }}>
                <RHFTextField name="name" placeholder="Ej: Almacen Norte" label="Nombre Punto De Venta" />
                <RHFTextField name="description" label="Descripción" rows={4} />
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
                <RHFTextField name="address" label="Dirección" placeholder="Ej: Calle 63 # 28 - 35" />
                <RHFPhoneNumber
                  fullWidth
                  type="string"
                  variant="outlined"
                  placeholder="Ej: 300 123 4567"
                  name="phone"
                  defaultCountry="co"
                  label="teléfono"
                  countryCodeEditable={false}
                  onlyCountries={['co']}
                />
              </Stack>
            </Grid>
          </DialogContentText>
        </DialogContent>

        <DialogActions
          boxShadow={2}
          sx={{
            padding: '20px 35px 15px 40px!important',
            display: 'flex',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            flexDirection: isMobile ? 'column' : 'row',
            '& > button': {
              flexGrow: isMobile ? 1 : 0,
              minWidth: isMobile ? '100%' : 'auto',
              marginBottom: isMobile ? theme.spacing(1) : 0,
              marginLeft: isMobile ? '0 !important' : theme.spacing(1)
            }
          }}
        >
          <LoadingButton color="primary" variant="contained" type="submit" loading={isSubmitting}>
            Crear Punto De Venta
          </LoadingButton>
          <Button color="primary" variant="outlined" onClick={() => dispatch(handleClose())}>
            Cancelar
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

FormPDVS.propTypes = { open: PropTypes.bool, handleClose: PropTypes.func };
