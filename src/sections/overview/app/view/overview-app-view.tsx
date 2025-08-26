// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
// _mock
import { _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import React from 'react';
import { useAuthContext } from 'src/auth/hooks';
import AppWidget from '../app-widget';
import AppWelcome from '../app-welcome';
import AppNewInvoice from '../app-new-invoice';
import AppTopAuthors from '../app-top-authors';
import AppTopRelated from '../app-top-related';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppTopInstalledCountries from '../app-top-installed-countries';
import AppWelcomeStep from '../app-welcome-step';
// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useAuthContext();

  const theme = useTheme();

  const settings = useSettingsContext();

  console.log('User in OverviewAppView:', user);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Welcome Cards - Stack on mobile, side by side on larger screens */}
        <Grid xs={12} sm={12} md={5} lg={4}>
          <AppWelcome
            title={`Bienvenido 👋 \n ${user?.profile?.name}`}
            description=""
            img={null}
            action={
              <Button variant="contained" color="primary" size="small">
                Explorar
              </Button>
            }
          />
        </Grid>

        <Grid xs={12} sm={12} md={7} lg={8}>
          <AppWelcomeStep
            title={`Bienvenido 👋 \n ${user?.profile?.name}`}
            description="Bienvenidos al sistema de facturación de la empresa. \n En este sistema podrás realizar las siguientes acciones:"
            img={<SeoIllustration />}
            action={
              <Button variant="contained" color="primary" size="small">
                Explorar
              </Button>
            }
          />
        </Grid>

        {/* Widget Summary Cards - Full width on mobile, 2 columns on tablet, 3 on desktop */}
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Ventas del Mes"
            percent={15.8}
            total={2847650}
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            chart={{
              series: [45, 32, 68, 55, 89, 45, 72, 83, 67, 91]
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Facturas Emitidas"
            percent={8.2}
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            total={1247}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [28, 45, 72, 38, 52, 67, 84, 59, 73, 42]
            }}
          />
        </Grid>

        <Grid xs={12} sm={12} md={4}>
          <AppWidgetSummary
            title="Clientes Activos"
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            percent={3.7}
            total={892}
            chart={{
              colors: [theme.palette.success.light, theme.palette.success.main],
              series: [15, 28, 45, 22, 38, 55, 29, 47, 68, 35]
            }}
          />
        </Grid>

        {/* Charts - Stack on mobile and tablet */}
        <Grid xs={12} sm={12} md={6} lg={5}>
          <AppCurrentDownload
            title="Productos Más Vendidos"
            subheader="(+15.8%) más que el mes anterior"
            sx={{ height: { xs: 'auto', md: '100%' } }}
            chart={{
              series: [
                { label: 'Laptops HP', value: 234567 },
                { label: 'Mouse Inalámbrico', value: 189234 },
                { label: 'Teclado Mecánico', value: 145678 },
                { label: 'Monitor 24"', value: 98345 },
                { label: 'Otros Productos', value: 67890 }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} sm={12} md={6} lg={7}>
          <AppAreaInstalled
            title="Ventas por Punto de Venta"
            subheader="(+12.3%) más que el mes anterior"
            sx={{ height: { xs: 'auto', md: '100%' } }}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'],
              series: [
                {
                  year: '2024',
                  data: [
                    {
                      name: 'Sede Principal',
                      data: [320, 441, 385, 551, 649, 762, 869, 891, 948, 735, 851, 949]
                    },
                    {
                      name: 'Sucursal Norte',
                      data: [210, 334, 413, 356, 477, 588, 699, 577, 645, 413, 556, 677]
                    },
                    {
                      name: 'Sucursal Sur',
                      data: [180, 267, 298, 445, 389, 456, 523, 398, 467, 298, 445, 389]
                    }
                  ]
                },
                {
                  year: '2025',
                  data: [
                    {
                      name: 'Sede Principal',
                      data: [851, 735, 841, 610, 991, 869, 762, 1048, 891, 869, 762, 849]
                    },
                    {
                      name: 'Sucursal Norte',
                      data: [556, 413, 634, 410, 677, 699, 588, 545, 577, 699, 588, 677]
                    },
                    {
                      name: 'Sucursal Sur',
                      data: [445, 298, 467, 310, 489, 523, 456, 367, 398, 523, 456, 489]
                    }
                  ]
                }
              ]
            }}
          />
        </Grid>

        {/* Table - Full width on mobile and tablet */}
        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="Últimas Facturas"
            subheader="(+12.3%) más que el mes anterior"
            tableData={_appInvoices}
            tableLabels={[
              { id: 'invoiceNumber', label: 'N° Factura' },
              { id: 'category', label: 'Categoría' },
              { id: 'price', label: 'Valor Total' },
              { id: 'status', label: 'Estado' },
              { id: '' }
            ]}
          />
        </Grid>

        {/* Side widgets - Better distribution on mobile and tablet */}
        <Grid xs={12} sm={6} md={4} lg={4}>
          <AppTopRelated title="Productos Relacionados" subheader="Productos con mayor rotación" list={_appRelated} />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={4}>
          <AppTopInstalledCountries
            title="Sucursales por Región"
            subheader="Distribución geográfica"
            list={_appInstalled}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={4}>
          <AppTopAuthors title="Mejores Vendedores" subheader="Top de ventas del mes" list={_appAuthors} />
        </Grid>

        <Grid xs={12} sm={6} md={12} lg={12}>
          <Stack spacing={{ xs: 2, sm: 3 }} direction={{ xs: 'column', sm: 'row' }}>
            <AppWidget
              title="Tasa de Conversión"
              total={73}
              icon="solar:chart-square-bold"
              sx={{ flex: 1 }}
              chart={{
                series: 73
              }}
            />

            <AppWidget
              title="Órdenes Pendientes"
              total={42}
              icon="solar:bell-bing-bold"
              color="warning"
              sx={{ flex: 1 }}
              chart={{
                series: 42
              }}
            />

            <AppWidget
              title="Productos Activos"
              total={856}
              icon="solar:box-bold"
              color="info"
              sx={{ flex: 1 }}
              chart={{
                series: 85
              }}
            />

            <AppWidget
              title="Satisfacción Cliente"
              total={94}
              icon="solar:heart-bold"
              color="success"
              sx={{ flex: 1 }}
              chart={{
                series: 94
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
