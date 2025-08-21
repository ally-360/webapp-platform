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
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={3} md={3}>
          <AppWelcome
            title={`Bienvenido 👋 \n ${user?.profile?.name}`}
            description=""
            action={
              <Button variant="contained" color="primary">
                Explorar
              </Button>
            }
          />
        </Grid>
        <Grid xs={9} md={9}>
          <AppWelcomeStep
            title={`Bienvenido 👋 \n ${user?.profile?.name}`}
            description="Bienvenidos al sistema de facturación de la empresa. \n En este sistema podrás realizar las siguientes acciones:"
            img={<SeoIllustration />}
            action={
              <Button variant="contained" color="primary">
                Explorar
              </Button>
            }
          />
        </Grid>
        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total ventas"
            percent={2.6}
            total={18765}
            sx={{}}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20]
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total facturas"
            percent={0.2}
            sx={{}}
            total={4876}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26]
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title="Total clientes"
            sx={{}}
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31]
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppCurrentDownload
            title="Productos más vendidos"
            subheader="(+43%) más que el mes pasado"
            sx={{}}
            chart={{
              series: [
                { label: 'Otros', value: 12244 },
                { label: 'Iphone 12 pro max', value: 53345 },
                { label: 'Samsung Galaxy s23', value: 44313 },
                { label: 'Xiaomi T13 Pro', value: 78343 }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AppAreaInstalled
            title="Ventas por Punto de Venta"
            subheader="(+43%) más que el mes pasado"
            sx={{}}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              series: [
                {
                  year: '2024',
                  data: [
                    {
                      name: 'Asia',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49]
                    },
                    {
                      name: 'America',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77]
                    }
                  ]
                },
                {
                  year: '2025',
                  data: [
                    {
                      name: 'Asia',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49]
                    },
                    {
                      name: 'America',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77]
                    }
                  ]
                }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="Ultimas Facturas"
            subheader="(+43%) más que el mes pasado"
            tableData={_appInvoices}
            tableLabels={[
              { id: 'id', label: 'SKU' },
              { id: 'category', label: 'Categoria' },
              { id: 'price', label: 'Precio' },
              { id: 'status', label: 'Estado' },
              { id: '' }
            ]}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopRelated title="Top Related Applications" list={_appRelated} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopInstalledCountries title="Top Installed Countries" list={_appInstalled} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppTopAuthors title="Top Authors" list={_appAuthors} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <Stack spacing={3}>
            <AppWidget
              title="Conversion"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 48
              }}
            />

            <AppWidget
              title="Applications"
              total={55566}
              icon="fluent:mail-24-filled"
              color="info"
              chart={{
                series: 75
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
