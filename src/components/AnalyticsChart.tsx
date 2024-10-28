import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Client } from '../types/client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

interface AnalyticsChartProps {
  data: Client[];
}

const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  // Group data by month
  const monthlyData = data.reduce((acc, client) => {
    const month = format(parseISO(client.fechaPago), 'MMMM yyyy', { locale: es });
    if (!acc[month]) {
      acc[month] = { registered: 0, waiting: 0 };
    }
    if (client.status === 'registered') {
      acc[month].registered++;
    } else {
      acc[month].waiting++;
    }
    return acc;
  }, {} as Record<string, { registered: number; waiting: number }>);

  const labels = Object.keys(monthlyData);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Clientes Validados',
        data: labels.map(month => monthlyData[month].registered),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
      {
        label: 'Clientes Pendientes',
        data: labels.map(month => monthlyData[month].waiting),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};

export default AnalyticsChart;