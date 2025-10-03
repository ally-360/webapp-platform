// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
// _mock
import { _appAuthors, _appInstalled } from 'src/_mock';
// components
import { AICapabilitiesBannerEnhanced } from 'src/components/ai-chatbot';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
// api
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import {
  useGetDailySalesQuery,
  useGetLowStockProductsQuery,
  useGetTopProductsQuery,
  useGetSalesComparisonQuery
} from 'src/redux/services/dashboardApi';
//
import React from 'react';
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

  // Obtener fecha de hoy para filtros
  const today = new Date().toISOString().split('T')[0];

  // RTK Query hooks - datos reales del backend
  const { data: salesInvoices } = useGetSalesInvoicesQuery({
    limit: 10
  });

  const { data: dailySales } = useGetDailySalesQuery({
    date: today
  });

  const { data: lowStockProducts } = useGetLowStockProductsQuery({
    limit: 15
  });

  const { data: topProducts } = useGetTopProductsQuery({
    period: 'week',
    limit: 5
  });

  const { data: salesComparison } = useGetSalesComparisonQuery({});

  console.log('Dashboard Data:', {
    salesInvoices,
    dailySales,
    lowStockProducts,
    topProducts,
    salesComparison
  });

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

        {/* Widget Summary Cards - Datos reales del backend */}
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Ventas de Hoy"
            percent={salesComparison?.percentage_change || 0}
            total={parseFloat(dailySales?.total_amount || '0')}
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            chart={{
              series: [45, 32, 68, 55, 89, 45, 72, 83, 67, 91]
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Facturas Emitidas Hoy"
            percent={8.2}
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            total={dailySales?.total_invoices || 0}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [28, 45, 72, 38, 52, 67, 84, 59, 73, 42]
            }}
          />
        </Grid>

        <Grid xs={12} sm={12} md={4}>
          <AppWidgetSummary
            title="Productos con Stock Bajo"
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            percent={-2.1}
            total={lowStockProducts?.total_count || 0}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [15, 28, 45, 22, 38, 55, 29, 47, 68, 35]
            }}
          />
        </Grid>

        {/* AI Capabilities Banner - Prominent Section */}
        <Grid xs={12}>
          <AICapabilitiesBannerEnhanced />
        </Grid>

        {/* Space for future AI features */}
        {/* <Grid xs={12} lg={6}>
          <Stack spacing={{ xs: 2, sm: 3 }} direction={{ xs: 'column', sm: 'row' }}>
            <AppWidget
              title="Precisión de IA"
              total={97}
              icon="material-symbols:psychology"
              sx={{ flex: 1 }}
              chart={{
                series: 97
              }}
            />
            <AppWidget
              title="Consultas por Día"
              total={156}
              icon="material-symbols:chat"
              color="info"
              sx={{ flex: 1 }}
              chart={{
                series: 78
              }}
            />
          </Stack>
        </Grid> */}

        {/* Charts - Datos reales del backend */}
        <Grid xs={12} sm={12} md={6} lg={5}>
          <AppCurrentDownload
            title="Productos Más Vendidos"
            subheader="Top 5 de la semana"
            sx={{ height: { xs: 'auto', md: '100%' } }}
            chart={{
              series: topProducts?.products?.map((product) => ({
                label: product.product_name,
                value: product.total_quantity
              })) || [{ label: 'Cargando...', value: 0 }]
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

        {/* Table - Últimas facturas reales del backend */}
        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="Últimas Facturas"
            subheader={`${salesInvoices?.total || 0} facturas en total`}
            tableData={salesInvoices?.invoices?.slice(0, 10) || []}
            tableLabels={[
              { id: 'number', label: 'N° Factura' },
              { id: 'issue_date', label: 'Fecha' },
              { id: 'total_amount', label: 'Valor Total' },
              { id: 'status', label: 'Estado' },
              { id: '' }
            ]}
          />
        </Grid>

        {/* Side widgets - Información real de productos y alertas */}
        <Grid xs={12} sm={6} md={4} lg={4}>
          <AppTopRelated
            title="Productos con Stock Bajo"
            subheader={`${lowStockProducts?.total_count || 0} productos críticos`}
            list={
              lowStockProducts?.products?.slice(0, 5).map((product) => ({
                id: product.id,
                name: product.name,
                avatar: null,
                favourite: product.current_stock
              })) || []
            }
          />
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
              title="Comparación vs Ayer"
              total={Math.abs(salesComparison?.percentage_change || 0)}
              icon="solar:chart-square-bold"
              sx={{ flex: 1 }}
              chart={{
                series: Math.abs(salesComparison?.percentage_change || 0)
              }}
            />

            <AppWidget
              title="Total Productos"
              total={topProducts?.products?.length || 0}
              icon="solar:box-bold"
              color="info"
              sx={{ flex: 1 }}
              chart={{
                series: 85
              }}
            />

            <AppWidget
              title="Alertas de Stock"
              total={lowStockProducts?.total_count || 0}
              icon="solar:danger-triangle-bold"
              color="warning"
              sx={{ flex: 1 }}
              chart={{
                series: lowStockProducts?.total_count || 0
              }}
            />

            <AppWidget
              title="Ventas del Día"
              total={parseFloat(dailySales?.total_amount || '0')}
              icon="solar:money-bag-bold"
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
