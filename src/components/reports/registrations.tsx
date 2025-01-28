import { AtSign, Filter, PieChart, Users } from "lucide-react";
import useClientStore from "@/store/clients";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import ReportFilters from "./report-filters";

const RegistrationsReport = () => {
  const token = useAuthStore((state) => state.token) as UserPermissionsToken;
  const clients = useClientStore((state) => state.analitycsClients);

  const getStats = () => {
    const filteredData = clients;

    const companyCount = filteredData.reduce(
      (acc, client) => {
        if (client.is_business) {
          acc[client.rut] = (acc[client.rut] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostRepeatedBusinesses = Object.entries(companyCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([rut, count]) => {
        return {
          rut,
          count,
        };
      });

    const stats = {
      total: filteredData.length,
      business: filteredData.filter((c) => c.is_business).length,
      personal: filteredData.filter((c) => !c.is_business).length,
      registered: filteredData.filter((c) => c.registered).length,
      waiting: filteredData.filter((c) => !c.registered).length,
      base: filteredData.filter((c) => c.channel === "base" && c.registered)
        .length,
      falabella: filteredData.filter(
        (c) => c.channel === "falabella" && c.registered,
      ).length,
      walmart: filteredData.filter(
        (c) => c.channel === "walmart" && c.registered,
      ).length,
      topClients: mostRepeatedBusinesses,
    };

    return stats;
  };

  const stats = getStats();

  return (
    <>
      <ReportFilters />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {token.channel === "base" && token.is_admin && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm">Total Registros</p>
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
              <p className="text-sm">Estado Registros</p>
            </div>
            <Filter className="w-5 h-5 text-blue-500" />
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

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm">Registros completados por Canal</p>
            </div>
            <AtSign className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Registro de IMEI</span>
              <span className="font-medium">{stats.base}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Falabella</span>
              <span className="font-medium">{stats.falabella}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Walmart</span>
              <span className="font-medium">{stats.walmart}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm">Empresas que más se repiten</p>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <ul className="mt-4 space-y-2">
            {stats.topClients.map((client, index) => (
              <li className="flex justify-between text-sm" key={index}>
                <span className="text-gray-600">
                  {index + 1}. {client.rut}
                </span>
                <span className="font-medium">{client.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default RegistrationsReport;
