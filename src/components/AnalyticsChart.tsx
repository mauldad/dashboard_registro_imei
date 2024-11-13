import React from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { Client, IOrder } from "../types/client";
import useClientStore from "../store/clients";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const AnalyticsChart = () => {
  // Group data by month
  const data = useClientStore((state) => state.clients);
  const monthlyData = data.reduce(
    (acc, client) => {
      const month = format(parseISO(client.created_at), "MMMM yyyy", {
        locale: es,
      });
      if (!acc[month]) {
        acc[month] = { registered: 0, waiting: 0 };
      }
      if (client.Account?.is_active) {
        acc[month].registered++;
      } else {
        acc[month].waiting++;
      }
      return acc;
    },
    {} as Record<string, { registered: number; waiting: number }>,
  );

  const labels = Object.keys(monthlyData);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Clientes Validados",
        data: labels.map((month) => monthlyData[month].registered),
        backgroundColor: "rgba(34, 197, 94, 0.5)",
      },
      {
        label: "Clientes Pendientes",
        data: labels.map((month) => monthlyData[month].waiting),
        backgroundColor: "rgba(239, 68, 68, 0.5)",
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};

export default AnalyticsChart;
