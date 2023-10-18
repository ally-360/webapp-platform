import * as React from 'react';
import * as Yup from 'yup';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import match from 'autosuggest-highlight/match';
import Slide from '@mui/material/Slide';
import parse from 'autosuggest-highlight/parse';
import { Box, InputAdornment, TextField, Stack, Link, Typography, Autocomplete, Divider, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import { switchPopup } from 'src/redux/inventory/pdvsSlice';
import FormPDVS from 'src/sections/PDVS/pdv-new-edit-form';
import { LoadingButton } from '@mui/lab';
import ButtonAutocomplete from 'src/sections/product/common/ButtonAutocomplete';
import { setPopupAssignInventory } from 'src/redux/inventory/productsSlice';
import FormProvider from 'src/components/hook-form/form-provider';
import { useForm } from 'react-hook-form';
import { RHFAutocomplete, RHFTextField } from 'src/components/hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

const Transition = React.forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function PopupAssingInventory({ handleAssignInventory, pdvEdit, setAssignWarehouse }) {
  const { enqueueSnackbar } = useSnackbar();

  const assignInventorySchema = Yup.object().shape({
    pdv: Yup.object({
      pdv: Yup.string().required('Punto de venta requerido'),
      id: Yup.string().required('Punto de venta requerido')
    })
      .required('Punto de venta requerido')
      .nullable(),

    quantity: Yup.number().required('Cantidad requerida'),
    minQuantity: Yup.number().optional(),
    edit: Yup.boolean()
  });

  // Form hooks

  const defaultValues = useMemo(
    () => ({
      pdv: pdvEdit ? { pdv: pdvEdit.pdv, id: pdvEdit.id } : { pdv: '', id: '' },
      quantity: pdvEdit ? pdvEdit.quantity : '',
      minQuantity: pdvEdit ? pdvEdit.minQuantity : '',
      // eslint-disable-next-line no-unneeded-ternary
      edit: pdvEdit ? true : false
    }),
    [pdvEdit]
  );

  const methods = useForm({
    resolver: yupResolver(assignInventorySchema),
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
      setValue('pdv', { pdv: pdvEdit.pdv, id: pdvEdit.id });
      setValue('quantity', pdvEdit.quantity);
      setValue('minQuantity', pdvEdit.minQuantity);
      setValue('edit', true);
    } else {
      setValue('pdv', { pdv: '', id: '' });
      setValue('quantity', '');
      setValue('minQuantity', '');
      setValue('edit', false);
    }
  }, [pdvEdit, setValue]);

  const onSubmit = async (data) => {
    try {
      console.log('send values', values);
      const resp = handleAssignInventory(values.pdv, values.quantity, values.minQuantity, values.edit);
      if (resp) {
        reset();
      }
      console.log(resp);
    } catch (error) {
      console.error(error);
    }
  };

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);

  const [selectedOption, setSelectedOption] = React.useState('');
  const handleInputChange = (event, value) => {
    setSearchQuery(value);
  };

  const isOptionEqualToValue = (option, value) => {
    if (option && value) {
      return option.id === value.id && option.pdv === value.pdv;
    }
    return false;
  };

  const handleOptionSelect = (event, option) => {
    setSelectedOption(option);
    setValue('warehouse', option);
  };

  const dispatch = useDispatch();

  // eslint-disable-next-line consistent-return
  const validator = () => {
    if (values.warehouse.id === '') {
      enqueueSnackbar('Debe seleccionar un punto de venta', { variant: 'error' });
      return true;
    }
    if (values.quantity === '') {
      enqueueSnackbar('Debe ingresar una cantidad', { variant: 'error' });
      return true;
    }

    if (values.minQuantity === '') {
      enqueueSnackbar('Debe ingresar una cantidad mínima', { variant: 'error' });
      return true;
    }

    handleSubmit();
  };

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(getWarehouses());
  // }, [dispatch]);

  const { pdvs, openPopup } = useSelector((state) => state.pdvs);

  const { popupAssignInventory } = useSelector((state) => state.products);

  useEffect(() => {
    console.log(pdvs);
    setSearchResults(pdvs);
  }, [pdvs]);
  const [scroll, setScroll] = React.useState('paper');

  useEffect(() => {
    console.log(values);
  }, [values]);

  return (
    <Stack>
      <Button color="primary" variant="outlined" onClick={setAssignWarehouse}>
        Agregar punto de venta
        <Icon style={{ marginLeft: 10 }} icon="gala:add" width={18} height={18} />
      </Button>
      <Dialog
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        sx={{ zIndex: '1200 !important' }}
        maxWidth="sm"
        open={popupAssignInventory}
      >
        <FormProvider methods={methods}>
          <DialogTitle id="scroll-dialog-title" sx={{ p: '20px 20px 14px' }}>
            Seleccionar Punto De Venta
          </DialogTitle>
          <Button
            color="primary"
            sx={{ position: 'absolute', right: 8, height: 50, top: 8, borderRadius: '100%', width: 50, minWidth: 50 }}
            onClick={() => dispatch(setPopupAssignInventory(false))}
          >
            <Icon width={24} height={24} icon="ion:close" />
          </Button>
          <Divider sx={{ mb: 2, mt: 0 }} />
          <DialogContent dividers={scroll === 'paper'} sx={{ pt: 1 }}>
            <RHFAutocomplete
              fullWidth
              disablePortal
              value={values.pdv}
              name="pdv"
              getOptionLabel={(option) => option.name || option.pdv || ''}
              options={searchResults}
              inputValue={searchQuery}
              onInputChange={handleInputChange}
              // onChange={handleOptionSelect}
              isOptionEqualToValue={isOptionEqualToValue}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Punto de venta"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          component={Icon}
                          icon="eva:search-outline"
                          sx={{
                            ml: 1,
                            width: 20,
                            height: 20,
                            color: 'text.disabled'
                          }}
                        />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              renderOption={(props, option) => {
                const matches = match(option.name, searchQuery);
                const parts = parse(option.name, matches);

                return (
                  <li {...props}>
                    <Link onClick={() => handleOptionSelect(option)} to="#" underline="none">
                      <Box sx={{ typography: 'body2', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.primary">
                          {parts.map((part, index) => (
                            <span
                              key={index}
                              style={{
                                fontWeight: part.highlight ? 700 : 400
                              }}
                            >
                              {part.text}
                            </span>
                          ))}
                        </Typography>
                      </Box>
                    </Link>
                  </li>
                );
              }}
              noOptionsText={
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                  No se encontraron resultados a la búsqueda {searchQuery}
                </Typography>
              }
              PaperComponent={({ children }) =>
                ButtonAutocomplete({
                  children,
                  handleOnClick: () => dispatch(switchPopup()),
                  title: 'Agregar punto de venta'
                })
              }
            />
            <Stack direction="row" sx={{ marginTop: 3 }} spacing={2}>
              <RHFTextField fullWidth label="Cantidad" name="quantity" type="number" variant="outlined" />
              <RHFTextField fullWidth label="Cantidad mínima" name="minQuantity" type="number" variant="outlined" />
            </Stack>
          </DialogContent>
          <DialogActions>
            {/* <Button type="submit" variant="outlined" onClick={submitForm}>
                  Guardar
                </Button> */}
            <LoadingButton
              type="button"
              onClick={onSubmit}
              color="primary"
              fullWidth
              variant="contained"
              size="large"
              loading={isSubmitting}
            >
              Guardar
            </LoadingButton>
          </DialogActions>
        </FormProvider>
      </Dialog>
    </Stack>
  );
}

PopupAssingInventory.propTypes = {
  handleAssignInventory: PropTypes.func,
  setAssignWarehouse: PropTypes.func,
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleClickOpen: PropTypes.func,
  pdvEdit: PropTypes.object
};
