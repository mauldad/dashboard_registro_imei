import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { AtSign } from "lucide-react";
import useClientStore from "@/store/clients";
import { useSearchParams } from "react-router-dom";

interface SLAReportProps {
  data: any;
  filters?: boolean;
  title: string;
}

const SLAReport = ({ data, filters, title }: SLAReportProps) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      // Destruir gráfico previo
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.map((s) => s.label),
          datasets: [
            {
              label: "SLA Promedio (Horas)",
              data: data.map((s) => s.avgSLA),
              backgroundColor: "#fa570a",
            },
            {
              label: "% Cumplimiento SLA",
              data: data.map((s) => s.complianceRate),
              backgroundColor: "#007bff",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: "Horas / Porcentaje" },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm">SLA {title && `de ${title}`}</p>
        </div>
        <AtSign className="w-5 h-5 text-blue-500" />
      </div>
      {filters ? (
        <SLAFilter />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 h-11"></div>
      )}
      <div className="mt-4 space-y-2">
        <canvas ref={chartRef} className="mt-4"></canvas>
      </div>
    </div>
  );
};

const SLAFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading } = useClientStore((state) => state);

  const handleParamChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  return (
    <>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
          <select
            value={searchParams.get("sla") || "channels"}
            onChange={(e) => handleParamChange("sla", e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="channels">Canales</option>
            <option value="services">Servicios</option>
          </select>
        </div>
      )}
    </>
  );
};

export default SLAReport;
