import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CheckCircle,
  Download,
  Users,
  XCircle,
} from "lucide-react";
import ClientsTable from "@/components/clients/clients-table";
import AnalyticsChart from "../components/AnalyticsChart";
import { exportToExcel } from "../utils/export";
import useClientStore from "../store/clients";
import ClientsTableSkeleton from "../components/skeletons/client-table-skeleton";
import useAuthStore from "../store/auth";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const getChannelToken = useAuthStore((state) => state.getChannelToken);
  const channel = getChannelToken();
  const {
    clients,
    fetchClients,
    updateRegisterStatus,
    currentPage,
    totalPages,
    pageSize,
  } = useClientStore((state) => state);

  useEffect(() => {
    const getClients = async () => {
      setLoading(true);
      await fetchClients({
        channel,
        query: searchParams.get("query") || undefined,
        filters: {
          month: searchParams.get("month") || undefined,
          channel: searchParams.get("channel") || undefined,
          type: searchParams.get("type") || undefined,
          payment: searchParams.get("payment") || undefined,
          status: searchParams.get("status") || undefined,
        },
      });
      setLoading(false);
    };
    getClients();
  }, [searchParams]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const empresas = clients.filter((c) => c.Account?.is_business).length;
    const validados = clients.filter((c) => c.registered).length;
    const pendientes = clients.filter((c) => !c.registered).length;

    const stats = [
      {
        title: "Total Clientes",
        value: totalClients.toString(),
        icon: Users,
        color: "bg-blue-500",
      },
      {
        title: "Empresas",
        value: empresas.toString(),
        icon: Building2,
        color: "bg-purple-500",
      },
      {
        title: "Validados SUBTEL",
        value: validados.toString(),
        icon: CheckCircle,
        color: "bg-green-500",
      },
      {
        title: "Pendientes",
        value: pendientes.toString(),
        icon: XCircle,
        color: "bg-red-500",
      },
    ];

    if (channel !== "base") {
      return stats.filter((s) => s.title !== "Empresas");
    }
    return stats;
  }, [clients]);

  const onStatusChange = async (id: number) => {
    await toast.promise(updateRegisterStatus(id), {
      loading: "Actualizando registro...",
      success: "Registro actualizado!",
      error:
        "Fallo al actualizar el registro. Porfavor intenta de nuevo más tarde.",
    });
  };

  const onPageSizeChange = async (size: number) => {
    setLoading(true);
    await fetchClients({
      channel,
      query: searchParams.get("query") || undefined,
      filters: {
        month: searchParams.get("month") || undefined,
        channel: searchParams.get("channel") || undefined,
        type: searchParams.get("type") || undefined,
        payment: searchParams.get("payment") || undefined,
        status: searchParams.get("status") || undefined,
      },
      limit: size,
    });
    setLoading(false);
  };

  const onPageChange = async (page: number) => {
    setLoading(true);
    await fetchClients({
      channel,
      query: searchParams.get("query") || undefined,
      filters: {
        month: searchParams.get("month") || undefined,
        channel: searchParams.get("channel") || undefined,
        type: searchParams.get("type") || undefined,
        payment: searchParams.get("payment") || undefined,
        status: searchParams.get("status") || undefined,
      },
      limit: pageSize,
      page,
    });
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <button
          onClick={() => exportToExcel(clients, "dashboard-export", channel)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          Exportar Planilla
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Análisis Mensual
            </h2>
          </div>
          <AnalyticsChart />
        </div>

        {channel === "base" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
              Distribución de Clientes
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Empresas</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (clients.filter((c) => c.Account?.is_business).length /
                          clients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Personas</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (clients.filter((c) => !c.Account?.is_business).length /
                          clients.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Listado de Clientes</h2>
          </div>
          {loading ? (
            <ClientsTableSkeleton />
          ) : (
            <ClientsTable
              orders={clients}
              totalClients={clients.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onStatusChange={onStatusChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
