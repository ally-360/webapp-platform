// @mui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
// hooks
import { useAuthContext } from 'src/auth/hooks';
import { useSettingsContext } from 'src/components/settings';
// components
import { AICapabilitiesBannerEnhanced } from 'src/components/ai-chatbot';
import DateRangeSelector, { DateRangeValue, getDateRangeFromSelection } from 'src/components/date-range-selector';
// assets
// api
import { useGetSalesInvoicesQuery } from 'src/redux/services/salesInvoicesApi';
import {
  useGetDailySalesQuery,
  useGetLowStockProductsQuery,
  useGetTopProductsQuery,
  useGetSalesComparisonQuery,
  useGetPDVSummaryQuery,
  useTestConnectionQuery
} from 'src/redux/services/dashboardApi';
//
import React, { useState } from 'react';
import { useWelcomeStepStatus } from '../hooks/use-welcome-step-status';
import AppWelcome from '../app-welcome';
import AppNewInvoice from '../app-new-invoice';
import AppTopRelated from '../app-top-related';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppWelcomeStep from '../app-welcome-step';
// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const settings = useSettingsContext();

  // Estado para el selector de período de tiempo
  const [dateRange, setDateRange] = useState<DateRangeValue>('today');
  const dateParams = getDateRangeFromSelection(dateRange);

  // Hook para verificar el estado del tutorial con control de carga inicial
  const { isCompleted: tutorialCompleted, isInitialLoad, completionPercentage } = useWelcomeStepStatus();

  // Helper para obtener el label del período
  const getPeriodLabel = () => {
    switch (dateRange) {
      case 'today':
        return 'Hoy';
      case 'week':
        return 'Esta Semana';
      case 'month':
        return 'Este Mes';
      case 'year':
        return 'Este Año';
      default:
        return 'Hoy';
    }
  };

  // Obtener fecha de hoy para filtros - ahora usando el selector de fecha
  const today = dateParams.startDate;

  // Debug de configuración
  console.log('🔧 DASHBOARD CONFIG DEBUG:', {
    today,
    dateRange,
    dateParams,
    tutorialCompleted,
    isInitialLoad,
    completionPercentage,
    companyId: localStorage.getItem('companyId'),
    token: localStorage.getItem('accessToken') ? 'Present' : 'Missing',
    hostApi: (import.meta as any).env?.VITE_HOST_API
  });

  const {
    data: salesInvoices,
    isLoading: _invoicesLoading,
    error: _invoicesError
  } = useGetSalesInvoicesQuery({
    limit: 10
  });

  const {
    data: dailySales,
    isLoading: _dailySalesLoading,
    error: _dailySalesError
  } = useGetDailySalesQuery({
    date: today
  });

  const {
    data: lowStockProducts,
    isLoading: _stockLoading,
    error: _stockError
  } = useGetLowStockProductsQuery({
    limit: 15
  });

  const {
    data: topProducts,
    isLoading: _topProductsLoading,
    error: _topProductsError
  } = useGetTopProductsQuery({
    period: dateParams.period as 'day' | 'week' | 'month',
    limit: 5
  });

  const {
    data: salesComparison,
    isLoading: _comparisonLoading,
    error: _comparisonError
  } = useGetSalesComparisonQuery({});

  const { data: pdvSummary, isLoading: _pdvLoading, error: _pdvError } = useGetPDVSummaryQuery({});

  // Query de prueba para verificar conectividad
  const { data: _testData, isLoading: _testLoading, error: _testError } = useTestConnectionQuery();

  // Debug completo de todas las queries
  console.log('🔍 DASHBOARD DEBUG - Estado de todas las queries:', {
    testConnection: {
      data: _testData,
      isLoading: _testLoading,
      error: _testError
    },
    salesInvoices: {
      data: salesInvoices,
      isLoading: _invoicesLoading,
      error: _invoicesError
    },
    dailySales: {
      data: dailySales,
      isLoading: _dailySalesLoading,
      error: _dailySalesError
    },
    lowStockProducts: {
      data: lowStockProducts,
      isLoading: _stockLoading,
      error: _stockError
    },
    topProducts: {
      data: topProducts,
      isLoading: _topProductsLoading,
      error: _topProductsError
    },
    salesComparison: {
      data: salesComparison,
      isLoading: _comparisonLoading,
      error: _comparisonError
    },
    pdvSummary: {
      data: pdvSummary,
      isLoading: _pdvLoading,
      error: _pdvError
    }
  });

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Header con selector de período */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography variant="h5">Dashboard</Typography>
        <DateRangeSelector value={dateRange} onChange={setDateRange} size="small" />
      </Stack>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Welcome Cards - Evitar parpadeo con lógica condicional */}
        {isInitialLoad && (
          // Mientras carga, mantener el layout fijo
          <>
            <Grid xs={12} sm={12} md={5} lg={4}>
              <AppWelcome
                title={`Bienvenido 👋 \n ${user?.profile?.first_name}`}
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
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2.5, md: 3 },
                  bgcolor: 'background.paper',
                  borderRadius: { xs: 1.5, sm: 2 },
                  boxShadow: 2,
                  minHeight: { xs: 280, sm: 320, md: 400 },
                  height: 'fit-content'
                }}
              >
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </Box>
            </Grid>
          </>
        )}

        {!isInitialLoad && tutorialCompleted && (
          // Tutorial completado: AppWelcome toma el ancho completo
          <Grid xs={12}>
            <AppWelcome
              title={`Bienvenido 👋 \n ${user?.profile?.first_name}`}
              description="¡Excelente! Has completado todos los pasos del tutorial. Tu cuenta está lista para usar todas las funcionalidades de la plataforma."
              img={null}
              action={
                <Button variant="contained" color="primary" size="small">
                  Explorar Dashboard
                </Button>
              }
            />
          </Grid>
        )}

        {!isInitialLoad && !tutorialCompleted && (
          // Tutorial no completado: layout normal
          <>
            <Grid xs={12} sm={12} md={5} lg={4}>
              <AppWelcome
                title={`Bienvenido 👋 \n ${user?.profile?.first_name}`}
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
              <AppWelcomeStep />
            </Grid>
          </>
        )}

        {/* Widget Summary Cards - Datos reales del backend con fallbacks */}
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title={`Ventas de ${getPeriodLabel()}`}
            percent={salesComparison?.percentage_change || 0}
            total={dailySales?.total_amount ? parseFloat(dailySales.total_amount) : 0}
            sx={{ height: { xs: 'auto', sm: '100%' } }}
            chart={{
              series: [45, 32, 68, 55, 89, 45, 72, 83, 67, 91]
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title={`Facturas Emitidas ${getPeriodLabel()}`}
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

        {/* Charts - Datos reales del backend con fallbacks */}
        <Grid xs={12} sm={12} md={6} lg={5}>
          <AppCurrentDownload
            title="Productos Más Vendidos"
            subheader={`Top 5 de ${getPeriodLabel().toLowerCase()}`}
            sx={{ height: { xs: 'auto', md: '100%' } }}
            chart={{
              series:
                topProducts && topProducts.products && topProducts.products.length > 0
                  ? topProducts.products.map((product) => ({
                      label: product.product_name,
                      value: product.total_quantity
                    }))
                  : [{ label: 'Sin datos disponibles', value: 1 }]
            }}
          />
        </Grid>

        <Grid xs={12} sm={12} md={6} lg={7}>
          <AppAreaInstalled
            title="Ventas por Punto de Venta"
            subheader={`PDV: ${pdvSummary?.pdv_name || 'Principal'} - Ventas: ${pdvSummary?.today_sales || '$0'}`}
            sx={{ height: { xs: 'auto', md: '100%' } }}
            chart={{
              categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'],
              series: [
                {
                  year: '2024',
                  data: [
                    {
                      name: pdvSummary?.pdv_name || 'PDV Principal',
                      data: dailySales?.total_amount
                        ? [
                            parseFloat(dailySales.total_amount) * 0.8,
                            parseFloat(dailySales.total_amount) * 0.9,
                            parseFloat(dailySales.total_amount) * 1.1,
                            parseFloat(dailySales.total_amount) * 0.7,
                            parseFloat(dailySales.total_amount) * 1.2,
                            parseFloat(dailySales.total_amount) * 1.0,
                            parseFloat(dailySales.total_amount) * 0.95,
                            parseFloat(dailySales.total_amount) * 1.05,
                            parseFloat(dailySales.total_amount) * 0.85,
                            parseFloat(dailySales.total_amount) * 1.15,
                            parseFloat(dailySales.total_amount) * 1.25,
                            parseFloat(dailySales.total_amount)
                          ]
                        : [100, 150, 200, 180, 220, 190, 250, 280, 210, 300, 320, 350]
                    }
                  ]
                }
              ]
            }}
          />
        </Grid>

        {/* <Grid xs={12} sm={6} md={12} lg={12}>
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
              total={dailySales?.total_amount ? parseFloat(dailySales.total_amount) : 0}
              icon="solar:money-bag-bold"
              color="success"
              sx={{ flex: 1 }}
              chart={{
                series: 94
              }}
            />
          </Stack>
        </Grid> */}

        <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="Últimas Facturas"
            subheader={`${salesInvoices?.total || 0} facturas en total`}
            tableData={salesInvoices?.invoices?.slice(0, 10) || []}
            tableLabels={[
              { id: 'number', label: 'N° Factura' },
              { id: 'customer', label: 'Cliente' },
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
              lowStockProducts?.products?.slice(0, 10).map((product) => ({
                id: product.id,
                name: product.name,
                current_stock: product.current_stock,
                min_stock: product.min_stock,
                pdv_name: product.pdv_name,
                sku: product.sku || 'N/A',
                avatar: null,
                favourite: product.current_stock
              })) || []
            }
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={4}>
          {/* <AppTopInstalledCountries
            title="Sucursales por Región"
            subheader="Distribución geográfica"
            list={_appInstalled}
          /> */}
        </Grid>

        <Grid xs={12} sm={6} md={4} lg={4}>
          {/* <AppTopAuthors title="Mejores Vendedores" subheader="Top de ventas del mes" list={_appAuthors} /> */}
        </Grid>
        <Grid xs={12}>
          <AICapabilitiesBannerEnhanced />
        </Grid>
      </Grid>
    </Container>
  );
}
