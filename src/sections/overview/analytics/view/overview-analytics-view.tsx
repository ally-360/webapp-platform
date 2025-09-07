import React from 'react';
// @mui
import Grid from '@mui/material/Unstable_Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// _mock
import { _analyticTasks, _analyticPosts, _analyticTraffic, _analyticOrderTimeline } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
//
import AnalyticsNews from '../analytics-news';
import AnalyticsTasks from '../analytics-tasks';
import AnalyticsCurrentVisits from '../analytics-current-visits';
import AnalyticsOrderTimeline from '../analytics-order-timeline';
import AnalyticsWebsiteVisits from '../analytics-website-visits';
import AnalyticsWidgetSummary from '../analytics-widget-summary';
import AnalyticsTrafficBySite from '../analytics-traffic-by-site';
import AnalyticsCurrentSubject from '../analytics-current-subject';
import AnalyticsConversionRates from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export default function OverviewAnalyticsView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      >
        Hola, Bienvenido de vuelta 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Ventas del Mes"
            total={2840000}
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Clientes Activos"
            total={4521}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Órdenes Procesadas"
            total={8976}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_buy.png" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="Productos en Stock"
            total={15643}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsWebsiteVisits
            title="Ventas Mensuales"
            subheader="(+18%) respecto al año anterior"
            chart={{
              labels: [
                'Ene 2024',
                'Feb 2024',
                'Mar 2024',
                'Abr 2024',
                'May 2024',
                'Jun 2024',
                'Jul 2024',
                'Ago 2024',
                'Sep 2024',
                'Oct 2024',
                'Nov 2024',
                'Dic 2024'
              ],
              series: [
                {
                  name: 'Ventas Directas',
                  type: 'column',
                  fill: 'solid',
                  data: [2800, 3100, 2900, 3400, 3200, 3600, 4100, 3800, 4200, 3900, 4300, 4500]
                },
                {
                  name: 'Ventas Online',
                  type: 'area',
                  fill: 'gradient',
                  data: [1200, 1400, 1600, 1800, 2100, 2300, 2500, 2700, 2900, 3100, 3300, 3500]
                },
                {
                  name: 'Ventas B2B',
                  type: 'line',
                  fill: 'solid',
                  data: [800, 950, 1100, 1250, 1400, 1550, 1700, 1850, 2000, 2150, 2300, 2450]
                }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Ventas por Región"
            chart={{
              series: [
                { label: 'Norte', value: 4850 },
                { label: 'Centro', value: 6200 },
                { label: 'Sur', value: 3100 },
                { label: 'Oriente', value: 2890 }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Productos Más Vendidos"
            subheader="(+25%) respecto al mes anterior"
            chart={{
              series: [
                { label: 'Laptops Dell', value: 1850 },
                { label: 'Smartphones Samsung', value: 2100 },
                { label: 'Tablets iPad', value: 1650 },
                { label: 'Monitores LG', value: 1200 },
                { label: 'Impresoras HP', value: 980 },
                { label: 'Teclados Logitech', value: 850 },
                { label: 'Mouse Wireless', value: 750 },
                { label: 'Auriculares Sony', value: 650 },
                { label: 'Cámaras Canon', value: 500 },
                { label: 'Discos SSD', value: 450 }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title="Rendimiento por Departamento"
            chart={{
              categories: ['Ventas', 'Marketing', 'Producción', 'Logística', 'Finanzas', 'Recursos Humanos'],
              series: [
                { name: 'Eficiencia', data: [85, 72, 88, 65, 92, 58] },
                { name: 'Satisfacción', data: [78, 85, 70, 82, 75, 88] },
                { name: 'Productividad', data: [90, 68, 85, 75, 80, 65] }
              ]
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsNews title="Noticias Empresariales" list={_analyticPosts} />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsOrderTimeline title="Cronograma de Órdenes" list={_analyticOrderTimeline} />
        </Grid>

        {/* <Grid xs={12} md={6} lg={4}>
          <AnalyticsTrafficBySite title="Tráfico por Plataforma" list={_analyticTraffic} />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsTasks title="Tareas Pendientes" list={_analyticTasks} />
        </Grid> */}
      </Grid>
    </Container>
  );
}
