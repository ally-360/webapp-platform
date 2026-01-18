import { useMemo } from 'react';
import { Card, CardHeader, CardContent, Box } from '@mui/material';
import { ApexOptions } from 'apexcharts';

// Components
import Chart, { useChart } from 'src/components/chart';

// Utils
import { fCurrency } from 'src/utils/format-number';

// Types
import type { TreasuryMovement } from 'src/sections/treasury/types';

// ----------------------------------------------------------------------

type Props = {
  movements: TreasuryMovement[];
  isLoading?: boolean;
};

// ----------------------------------------------------------------------

export default function CashFlowChart({ movements, isLoading }: Props) {
  // Process data for last 30 days
  const chartData = useMemo(() => {
    const today = new Date();
    const last30Days: { date: string; inflow: number; outflow: number }[] = [];

    // Generate last 30 days
    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      last30Days.push({
        date: dateStr,
        inflow: 0,
        outflow: 0
      });
    }

    // Aggregate movements by day
    movements.forEach((movement) => {
      const movementDate = movement.movement_date.split('T')[0];
      const dayData = last30Days.find((d) => d.date === movementDate);

      if (dayData) {
        const amount = parseFloat(movement.amount);
        if (movement.movement_type === 'inflow') {
          dayData.inflow += amount;
        } else {
          dayData.outflow += amount;
        }
      }
    });

    return last30Days;
  }, [movements]);

  const chartOptions = useChart({
    chart: {
      type: 'bar',
      stacked: false
    },
    colors: ['#22C55E', '#EF4444'],
    plotOptions: {
      bar: {
        columnWidth: '50%',
        borderRadius: 4
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: chartData.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      labels: {
        rotate: -45,
        rotateAlways: false
      }
    },
    yaxis: {
      title: {
        text: 'Monto (COP)'
      },
      labels: {
        formatter: (value: number) => fCurrency(value)
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => fCurrency(value)
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    dataLabels: {
      enabled: false
    }
  } as ApexOptions);

  const series = [
    {
      name: 'Entradas',
      data: chartData.map((d) => d.inflow)
    },
    {
      name: 'Salidas',
      data: chartData.map((d) => d.outflow)
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Flujo de Efectivo" subheader="Últimos 30 días" />
        <CardContent>
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Cargando gráfico...
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Flujo de Efectivo" subheader="Ingresos y egresos de los últimos 30 días" />

      <CardContent>
        <Chart type="bar" series={series} options={chartOptions} height={400} />
      </CardContent>
    </Card>
  );
}
