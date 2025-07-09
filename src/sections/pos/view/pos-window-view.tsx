import {
  Autocomplete,
  Box,
  Card,
  CardHeader,
  Divider,
  Drawer,
  Grid,
  IconButton,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { Stack } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import React, { useCallback, useEffect, useState } from 'react';
import { paths } from 'src/routes/paths';
import OrderDetailsToolbar from 'src/sections/order/order-details-toolbar';
import { Icon } from '@iconify/react';
import OrderDetailsItems from 'src/sections/order/order-details-item';
import { _orders } from 'src/_mock';
import ButtonAutocomplete from 'src/sections/product/common/ButtonAutocomplete';
import { useAppDispatch, useAppSelector } from 'src/hooks/store';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useForm } from 'react-hook-form';
import { getAllContacts, togglePopup } from 'src/redux/inventory/contactsSlice';
import PosProductShopView from '../pos-product-shop-view';
import PosCartIcon from '../pos-cart-icon';

export default function PosWindowView({ hiddenDrawer, openDrawer, sale }) {
  const id = 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1';

  const currentOrder = _orders.filter((order) => order.id === id)[0];

  const [status, setStatus] = useState(currentOrder.status);

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);

  const defaultValues = {
    name: '',
    address: '',
    nit: '',
    phoneNumber: '',
    website: '',
    quantityEmployees: '',
    economicActivity: ''
  };

  const methods = useForm({
    defaultValues
  });

  const theme = useTheme();

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const dispatch = useAppDispatch();

  const handleClickContactsPopup = () => {
    dispatch(togglePopup());
  };

  const [searchQueryContact, setSearchQueryContact] = useState('');
  const handleInputContactChange = (event, value) => {
    setSearchQueryContact(value);
  };

  const isOptionEqualToValue = (option, value) => {
    if (option && value) {
      return option.id === value.id && option.name === value.name;
    }
    return false;
  };

  useEffect(() => {
    dispatch(getAllContacts());
  }, [dispatch]);

  const { contacts, contactsLoading, contactsEmpty } = useAppSelector((state) => state.contacts);
  return (
    <>
      <Grid
        item
        md={12}
        sx={{
          width:
            // eslint-disable-next-line no-nested-ternary
            openDrawer
              ? isLargeScreen
                ? `calc(100% - ${drawerWidthLg}) !important`
                : `calc(100% - ${drawerWidth}) !important`
              : '100%',
          // eslint-disable-next-line no-nested-ternary
          transition: theme.transitions.create('width ', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        <Card sx={{ p: 2, mb: 2 }}>
          <OrderDetailsToolbar backLink={paths.dashboard.order.root} orderNumber="1" createdAt="12/12/2021" />
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <TextField size="small" fullWidth label="Tipo de venta" name="saleType" />
            <TextField size="small" fullWidth label="IVA" name="iva" />

            <LocalizationProvider>
              <DatePicker
                fullWidth
                sx={{
                  width: '100%',
                  '& input': {
                    fontSize: '1.05rem', // Ajusta el tamaño del texto
                    padding: '8px'
                  }
                }}
                label="Fecha"
                format="MM-DD-YYYY"
              />
            </LocalizationProvider>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <TextField size="small" fullWidth label="Buscar producto" name="search" />
            <TextField size="small" fullWidth label="Forma de pago" name="paymentMethod" />
            <TextField size="small" fullWidth label="Vendedor" name="seller" />
          </Stack>
        </Card>
        <PosProductShopView />
      </Grid>
      <PosCartIcon
        onClick={hiddenDrawer}
        // eslint-disable-next-line no-nested-ternary
        rightDrawer={isLargeScreen ? (openDrawer ? drawerWidthLg : 0) : openDrawer ? drawerWidth : 0}
        totalItems={0}
      />
      <Drawer
        sx={{
          width: drawerWidthLg,
          zIndex: 99999999,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isLargeScreen ? drawerWidthLg : drawerWidth,
            boxSizing: 'border-box',
            boxShadow: '-5px 1px 129px -28px rgb(130 125 125 / 32%)'
          }
        }}
        open={openDrawer}
        variant="persistent"
        anchor="right"
      >
        <Divider />
        <Divider />

        <Card sx={{ mb: 0, borderRadius: '0 !important', height: '100%', display: 'flex', flexDirection: 'column  ' }}>
          <CardHeader
            title="Factura de venta"
            sx={{ mb: 2 }}
            action={
              <>
                <IconButton>
                  <Icon icon="mingcute:print-line" />
                </IconButton>
                <IconButton>
                  <Icon icon="ic:round-settings" />
                </IconButton>
              </>
            }
          />
          <Divider />
          <Stack p={3} direction="row" alignItems="center" justifyContent="space-between">
            <Typography mr={2} variant="subtitle1">
              Cliente:
            </Typography>
            <Autocomplete
              disablePortal
              fullWidth
              size="small"
              options={contacts}
              getOptionLabel={(option) => option.name}
              onInputChange={handleInputContactChange}
              isOptionEqualToValue={isOptionEqualToValue}
              renderInput={(params) => <TextField {...params} placeholder="Buscar cliente" />}
              renderOption={(props, option) => {
                const matches = match(option.name, searchQueryContact);
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
                  {contactsLoading && 'Cargando...'}
                  {contactsEmpty && !contactsLoading && 'No hay contactos registradas'}
                  {!contactsLoading &&
                    !contactsEmpty &&
                    searchQueryContact &&
                    `No se encontraron resultados ${searchQueryContact}`}
                </Typography>
              }
              PaperComponent={({ children }) =>
                ButtonAutocomplete({
                  title: 'Crear Cliente',
                  handleOnClick: handleClickContactsPopup,
                  children
                })
              }
            />
          </Stack>

          <Divider />
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <OrderDetailsItems
              items={currentOrder.items} // TODO: agregar items de sales.
              taxes={currentOrder.taxes}
              shipping={currentOrder.shipping}
              discount={currentOrder.discount}
              subTotal={currentOrder.subTotal}
              totalAmount={currentOrder.totalAmount}
            />

            {/* <OrderDetailsHistory history={currentOrder.history} /> */}
          </Stack>
        </Card>
      </Drawer>
    </>
  );
}
