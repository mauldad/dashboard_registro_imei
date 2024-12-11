import React, { useEffect, useState } from "react";
import {
  Calendar,
  Download,
  FileSpreadsheet,
  Filter,
  PieChart,
} from "lucide-react";
import { endOfYear, format, startOfYear, subMonths, subYears } from "date-fns";
import { es } from "date-fns/locale";
import { exportToExcel } from "../utils/export";
import useClientStore from "../store/clients";
import useAuthStore from "../store/auth";

const Reports = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MM"));
  const [selectedQuarter, setSelectedQuarter] = useState("1");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const [loading, setLoading] = useState(false);

  const getChannelToken = useAuthStore((state) => state.getChannelToken);
  const channel = getChannelToken();

  const clients = useClientStore((state) => state.clients);
  const fetchClients = useClientStore((state) => state.fetchClients);

  useEffect(() => {
    const getClients = async () => {
      setLoading(true);
      await fetchClients(channel);
      setLoading(false);
    };
    getClients();
  }, [clients.length]);

  // Generate years for selection (current year and 2 years back)
  const years = Array.from({ length: 3 }, (_, i) =>
    (new Date().getFullYear() - i).toString(),
  );

  // Generate months for selection
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString().padStart(2, "0"),
    label: format(new Date(2024, i, 1), "MMMM", { locale: es }),
  }));

  const quarters = [
    { value: "1", label: "Primer Trimestre (Ene - Mar)" },
    { value: "2", label: "Segundo Trimestre (Abr - Jun)" },
    { value: "3", label: "Tercer Trimestre (Jul - Sep)" },
    { value: "4", label: "Cuarto Trimestre (Oct - Dic)" },
  ];

  const semesters = [
    { value: "1", label: "Primer Semestre (Ene - Jun)" },
    { value: "2", label: "Segundo Semestre (Jul - Dic)" },
  ];

  const handleExport = () => {
    let filteredData = [...clients];
    let reportName = "reporte";

    switch (timeRange) {
      case "month":
        reportName = `reporte-${selectedYear}-${selectedMonth}`;
        filteredData = clients.filter((client) =>
          client.created_at.startsWith(`${selectedYear}-${selectedMonth}`),
        );
        break;
      case "quarter":
        const quarterMonth = (parseInt(selectedQuarter) - 1) * 3;
        reportName = `reporte-${selectedYear}-T${selectedQuarter}`;
        filteredData = clients.filter((client) => {
          const month = parseInt(client.created_at.split("-")[1]);
          return (
            client.created_at.startsWith(selectedYear) &&
            month >= quarterMonth + 1 &&
            month <= quarterMonth + 3
          );
        });
        break;
      case "semester":
        const semesterMonth = (parseInt(selectedSemester) - 1) * 6;
        reportName = `reporte-${selectedYear}-S${selectedSemester}`;
        filteredData = clients.filter((client) => {
          const month = parseInt(client.created_at.split("-")[1]);
          return (
            client.created_at.startsWith(selectedYear) &&
            month >= semesterMonth + 1 &&
            month <= semesterMonth + 6
          );
        });
        break;
      case "year":
        reportName = `reporte-${selectedYear}`;
        filteredData = clients.filter((client) =>
          client.created_at.startsWith(selectedYear),
        );
        break;
    }

    exportToExcel(filteredData, reportName, channel);
  };

  const getStats = () => {
    const filteredData = clients;
    const stats = {
      total: filteredData.length,
      business: filteredData.filter((c) => c.Account?.is_business).length,
      personal: filteredData.filter((c) => !c.Account?.is_business).length,
      registered: filteredData.filter((c) => c.registered).length,
      waiting: filteredData.filter((c) => !c.registered).length,
      totalAmount: filteredData.reduce(
        (sum, client) => sum + client.total_paid,
        0,
      ),
    };
    return stats;
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Reportes y Análisis
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channel === "base" && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Registros</p>
                <p className="text-2xl font-semibold mt-1">{stats.total}</p>
              </div>
              <PieChart className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Empresas</span>
                <span className="font-medium">{stats.business}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Personas</span>
                <span className="font-medium">{stats.personal}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Estado Registros</p>
              <p className="text-2xl font-semibold mt-1">
                {stats.registered + stats.waiting}
              </p>
            </div>
            <Filter className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Registrados</span>
              <span className="font-medium">{stats.registered}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">En Espera</span>
              <span className="font-medium">{stats.waiting}</span>
            </div>
          </div>
        </div>

        {channel === "base" && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Recaudado</p>
                <p className="text-2xl font-semibold mt-1">
                  {stats.totalAmount.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </p>
              </div>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Exportar Datos</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>

              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>

              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="month">Mensual</option>
                  <option value="quarter">Trimestral</option>
                  <option value="semester">Semestral</option>
                  <option value="year">Anual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {timeRange === "month" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mes
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {timeRange === "quarter" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trimestre
                  </label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {quarters.map((quarter) => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {timeRange === "semester" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semestre
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {semesters.map((semester) => (
                      <option key={semester.value} value={semester.value}>
                        {semester.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <button
            disabled={loading}
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            Exportar Reporte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
