import { useEffect, useState } from "react";
import { Download, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ClientsTable from "@/components/clients/clients-table";
import { exportToExcel } from "@/utils/export";
import useClientStore from "@/store/clients";
import ClientsTableSkeleton from "@/components/skeletons/client-table-skeleton";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import { ClientsSearch } from "@/components/clients/clients-search";
import { ClientsFilters } from "@/components/clients/clients-filters";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const Clients = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const token = useAuthStore((state) => state.token) as UserPermissionsToken;

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
        channel: token.channel,
        query: searchParams.get("query") || undefined,
        filters: {
          month: searchParams.get("month") || undefined,
          year: searchParams.get("year") || undefined,
          channel: searchParams.get("channel") || undefined,
          type: searchParams.get("type") || undefined,
          payment: searchParams.get("payment") || undefined,
          status: searchParams.get("status") || undefined,
        },
      });
      setLoading(false);
    };
    getClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
      channel: token.channel,
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
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Clientes
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              exportToExcel(clients, "clientes-export", token.channel)
            }
            disabled={loading}
          >
            <Download size={20} />
            Exportar Listado
          </Button>
          <ClientsSearch />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm p-6">
        <ClientsFilters channel={token.channel} />
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
  );
};

export default Clients;
