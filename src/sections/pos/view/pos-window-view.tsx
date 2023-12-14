import {
  Autocomplete,
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
import React, { useCallback, useState } from 'react';
import { paths } from 'src/routes/paths';
import OrderDetailsToolbar from 'src/sections/order/order-details-toolbar';
import { Icon } from '@iconify/react';
import OrderDetailsItems from 'src/sections/order/order-details-item';
import { ORDER_STATUS_OPTIONS, _orders } from 'src/_mock';
import PosProductShopView from '../pos-product-shop-view';
import PosCartIcon from '../pos-cart-icon';

export default function PosWindowView({ hiddenDrawer, openDrawer, sale }) {
  const clientes = [
    { name: 'Cliente 1', id: 1, cc: '123456789', phone: '123456789', email: 'prueba@gmail.com', address: 'Calle 123' },
    { name: 'Cliente 2', id: 2, cc: '123456789', phone: '123456789', email: 'prueba2@gmail.com', address: 'Calle 123' },
    { name: 'Cliente 3', id: 3, cc: '123456789', phone: '123456789', email: 'prueba3@gmail.com', address: 'Calle 123' }
  ];

  const id = 'e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1';

  const currentOrder = _orders.filter((order) => order.id === id)[0];

  const [status, setStatus] = useState(currentOrder.status);

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);

  const theme = useTheme();

  const drawerWidthLg = '30vw';
  const drawerWidth = '500px';
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

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
        {sale.id}
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
    </>
  );
}
