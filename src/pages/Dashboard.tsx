import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CheckCircle,
  Download,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import ClientsTable from "@/components/clients/clients-table";
import AnalyticsChart from "../components/AnalyticsChart";
import useClientStore from "../store/clients";
import ClientsTableSkeleton from "../components/skeletons/client-table-skeleton";
import useAuthStore, { UserPermissionsToken } from "../store/auth";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const token = useAuthStore((state) => state.token) as UserPermissionsToken;

  const {
    clients,
    analitycsClients,
    fetchClients,
    fetchAnalitycsClients,
    updateRegisterStatus,
    currentPage,
    totalPages,
    pageSize,
    exportClientsExcel,
    loadingExport,
  } = useClientStore((state) => state);

  useEffect(() => {
    const getClients = async () => {
      setLoading(true);
      await fetchClients({
        channel: token.channel,
        query: searchParams.get("query") || undefined,
        filters: {
          month: searchParams.get("month") || undefined,
          channel:
            token.channel === "base"
              ? searchParams.get("channel")
              : token.channel,
          type: searchParams.get("type") || undefined,
          payment: searchParams.get("payment") || undefined,
          status: searchParams.get("status") || undefined,
        },
      });
      await fetchAnalitycsClients(token.channel);
      setLoading(false);
    };
    getClients();
  }, [searchParams]);

  const stats = useMemo(() => {
    const totalClients = analitycsClients.length;
    const empresas = analitycsClients.filter((c) => c.is_business).length;
    const validados = analitycsClients.filter((c) => c.registered).length;
    const pendientes = analitycsClients.filter((c) => !c.registered).length;

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

    if (token.channel !== "base") {
      return stats.filter((s) => s.title !== "Empresas");
    }
    return stats;
  }, [analitycsClients]);

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
      channel: token.channel,
      query: searchParams.get("query") || undefined,
      filters: {
        month: searchParams.get("month") || undefined,
        channel:
          token.channel === "base"
            ? searchParams.get("channel")
            : token.channel,
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
      channel: token.channel,
      query: searchParams.get("query") || undefined,
      filters: {
        month: searchParams.get("month") || undefined,
        channel:
          token.channel === "base"
            ? searchParams.get("channel")
            : token.channel,
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
          onClick={async () =>
            await exportClientsExcel(
              "clientes-export",
              token.channel,
              token.is_admin,
            )
          }
          disabled={loadingExport || loading}
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

        {token.channel === "base" && (
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
                        (analitycsClients.filter((c) => c.is_business).length /
                          analitycsClients.length) *
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
                        (analitycsClients.filter((c) => !c.is_business).length /
                          analitycsClients.length) *
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
