import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _orders, ORDER_STATUS_OPTIONS } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
import OrderDetailsToolbar from 'src/sections/order/order-details-toolbar';
import OrderDetailsItems from 'src/sections/order/order-details-item';
import OrderDetailsInfo from 'src/sections/order/order-details-info';
import OrderDetailsHistory from 'src/sections/order/order-details-history';
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { fCurrency } from 'src/utils/format-number';
import { Icon } from '@iconify/react';
import { ProductShopView } from 'src/sections/product/view';
import PosProductShopView from 'src/sections/pos/pos-product-shop-view';
import CartIcon from 'src/sections/product/common/cart-icon';
import PosCartIcon from 'src/sections/pos/pos-cart-icon';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
//

// ----------------------------------------------------------------------

export default function PosContainerView() {
  const settings = useSettingsContext();

  const id = 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1';

  const currentOrder = _orders.filter((order) => order.id === id)[0];

  const [status, setStatus] = useState(currentOrder.status);

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);
  const clientes = [
    { name: 'Cliente 1', id: 1, cc: '123456789', phone: '123456789', email: 'prueba@gmail.com', address: 'Calle 123' },
    { name: 'Cliente 2', id: 2, cc: '123456789', phone: '123456789', email: 'prueba2@gmail.com', address: 'Calle 123' },
    { name: 'Cliente 3', id: 3, cc: '123456789', phone: '123456789', email: 'prueba3@gmail.com', address: 'Calle 123' }
  ];
  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';

  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const [openDrawer, setOpenDrawer] = useState(true);

  const hiddenDrawer = () => {
    // hidden drawer
    setOpenDrawer(!openDrawer);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {/* Header Bar */}
      <AppBar
        position="fixed"
        sx={{
          background: theme.palette.background.paper,
          left: 0,
          width:
            // eslint-disable-next-line no-nested-ternary
            openDrawer ? (isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`) : '100%',
          // eslint-disable-next-line no-nested-ternary
          zIndex: 99999,
          transition: theme.transitions.create('width ', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen
          })
        }}
      >
        <CardHeader
          avatar={<img src="/logo/faviconBackgroundTransparent.svg" alt="logo" width="30" />}
          title={
            <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
              Venta POS
              <Typography component="span" sx={{ color: 'text.secondary' }}>
                &nbsp;(PDV: Palmira)
              </Typography>
            </Typography>
          }
          sx={{ p: 2 }}
          action={
            <IconButton>
              <Icon icon="ic:round-settings" />
            </IconButton>
          }
        />
      </AppBar>
      <Grid container spacing={3}>
        <Grid
          xs={12}
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
            <OrderDetailsToolbar
              backLink={paths.dashboard.order.root}
              orderNumber={currentOrder.orderNumber}
              createdAt={currentOrder.createdAt}
              status={status}
              onChangeStatus={handleChangeStatus}
              statusOptions={ORDER_STATUS_OPTIONS}
            />
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

          <Card
            sx={{ mb: 0, borderRadius: '0 !important', height: '100%', display: 'flex', flexDirection: 'column  ' }}
          >
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
                options={clientes}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} placeholder="Buscar cliente" />}
              />
            </Stack>

            <Divider />
            <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
              <OrderDetailsItems
                items={currentOrder.items}
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
        <Grid xs={12} md={4}>
          {/* <OrderDetailsInfo
            customer={currentOrder.customer}
            delivery={currentOrder.delivery}
            payment={currentOrder.payment}
            shippingAddress={currentOrder.shippingAddress}
          /> */}
        </Grid>
        {/* Bottom container */}
        <AppBar
          position="fixed"
          sx={{
            background: theme.palette.background.paper,
            left: 0,
            bottom: 0,
            top: 'auto',
            width:
              // eslint-disable-next-line no-nested-ternary
              openDrawer ? (isLargeScreen ? `calc(100% - ${drawerWidthLg})` : `calc(100% - ${drawerWidth})`) : '100%',
            // eslint-disable-next-line no-nested-ternary
            zIndex: 99999,
            transition: theme.transitions.create('width ', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen
            })
          }}
        >
          <CardHeader
            title={
              <Typography sx={{ color: theme.palette.text.primary }} variant="h6">
                Venta 1
              </Typography>
            }
            sx={{ p: 2 }}
          />
        </AppBar>
      </Grid>
    </Container>
  );
}
