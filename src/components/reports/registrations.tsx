import { AtSign, Ban, Filter, PieChart, Users } from "lucide-react";
import useClientStore from "@/store/clients";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import ReportFilters from "./report-filters";
import SLAReport from "./sla-report";
import { useSearchParams } from "react-router-dom";
import { getRegistrationsStats } from "@/utils/registrations-analitycs";

const RegistrationsReport = () => {
  const token = useAuthStore((state) => state.token) as UserPermissionsToken;
  const clients = useClientStore((state) => state.analitycsClients);
  const rejectionsData = useClientStore((state) => state.analitycsRejections);
  const [searchParams] = useSearchParams();

  const stats = getRegistrationsStats(
    clients,
    rejectionsData,
    searchParams.get("sla") || "channels",
  );

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
        {/* Nueva tarjeta para Tasa de Rechazos */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-sm">Tasa de Rechazos</p>
            <Ban className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tasa de Rechazo (%)</span>
              <span className="font-medium">
                {stats.rejections.rejectionRate.toFixed(2)}%
              </span>
            </div>

            {/* Motivos de rechazo */}
            <div>
              <p className="text-sm text-gray-600">Motivos de Rechazo</p>
              <ul className="mt-2 space-y-1">
                {Object.entries(stats.rejections.reasons).map(
                  ([reason, count]) => (
                    <li key={reason} className="flex justify-between text-sm">
                      <span className="text-gray-600">{reason}</span>
                      <span className="font-medium">{count as number}</span>
                    </li>
                  ),
                )}
              </ul>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SLAReport data={stats.sla} />
      </div>
    </>
  );
};

export default RegistrationsReport;
