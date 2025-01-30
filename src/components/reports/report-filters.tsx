import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSearchParams } from "react-router-dom";
import useClientStore from "@/store/clients";

const ReportFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { loading } = useClientStore((state) => state);

  const handleTimeRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const year =
      params.get("year") || format(new Date(), "yyyy", { locale: es });
    const month =
      params.get("month") || format(new Date(), "MM", { locale: es });

    if (value === "all") {
      params.set("timeRange", value);
      params.delete("year");
      params.delete("month");
    } else if (value === "year") {
      params.set("timeRange", value);
      params.set("year", year);
      params.delete("month");
    } else {
      params.set("timeRange", value);
      params.set("year", year);
      params.set("month", month);
    }
    setSearchParams(params);
  };

  const handleParamChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const years = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) =>
        (new Date().getFullYear() - i).toString(),
      ),
    [],
  );
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString().padStart(2, "0"),
        label: format(new Date(2024, i, 1), "MMMM", { locale: es }),
      })),
    [],
  );

  return (
    <>
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
              value={searchParams.get("timeRange") || "all"}
              onChange={(e) => handleTimeRangeChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Total</option>
              <option value="year">Anual</option>
              <option value="month">Mensual</option>
            </select>
          </div>

          {(searchParams.get("timeRange") === "year" ||
            searchParams.get("timeRange") === "month") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <select
                value={
                  searchParams.get("year") ||
                  format(new Date(), "yyyy", { locale: es })
                }
                onChange={(e) => handleParamChange("year", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}

          {searchParams.get("timeRange") === "month" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mes
              </label>
              <select
                value={
                  searchParams.get("month") ||
                  format(new Date(), "MM", { locale: es })
                }
                onChange={(e) => handleParamChange("month", e.target.value)}
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
        </div>
      )}
    </>
  );
};

export default ReportFilters;
