import { useState } from "react";
import { Calendar, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { exportToExcel } from "@/utils/export";
import useClientStore from "@/store/clients";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import { getAllClients } from "@/data/clients";

const ExportData = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MM"));
  const [selectedQuarter, setSelectedQuarter] = useState("1");
  const [selectedSemester, setSelectedSemester] = useState("1");
  const { loading, loadingExport, setLoadingExport, setErrorExport } =
    useClientStore((state) => state);

  const token = useAuthStore((state) => state.token) as UserPermissionsToken;

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

  const handleExport = async () => {
    try {
      setErrorExport(null);
      setLoadingExport(true);
      let filteredData = await getAllClients();
      let reportName = "reporte";

      switch (timeRange) {
        case "month":
          reportName = `reporte-${selectedYear}-${selectedMonth}`;
          filteredData = filteredData.filter((client) =>
            client.created_at.startsWith(`${selectedYear}-${selectedMonth}`),
          );
          break;
        case "quarter":
          const quarterMonth = (parseInt(selectedQuarter) - 1) * 3;
          reportName = `reporte-${selectedYear}-T${selectedQuarter}`;
          filteredData = filteredData.filter((client) => {
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
          filteredData = filteredData.filter((client) => {
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
          filteredData = filteredData.filter((client) =>
            client.created_at.startsWith(selectedYear),
          );
          break;
      }

      exportToExcel(filteredData, reportName, token.channel, token.is_admin);
    } catch (error) {
      setErrorExport((error as Error).message);
    } finally {
      setLoadingExport(false);
    }
  };

  return (
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
          disabled={loading || loadingExport}
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {loadingExport ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Exportando...
            </>
          ) : (
            <>
              <Download size={20} />
              Exportar Planilla
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportData;
