import { useEffect, useState } from "react";
import { Download, Loader2, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ClientsTable from "@/components/clients/clients-table";
import useClientStore from "@/store/clients";
import ClientsTableSkeleton from "@/components/skeletons/client-table-skeleton";
import useAuthStore, { UserPermissionsToken } from "@/store/auth";
import { ClientsSearch } from "@/components/clients/clients-search";
import { ClientsFilters } from "@/components/clients/clients-filters";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const Clients = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const token = useAuthStore((state) => state.token) as UserPermissionsToken;

  const {
    clients,
    fetchClients,
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
          dateFrom: searchParams.get("dateFrom") || undefined,
          dateTo: searchParams.get("dateTo") || undefined,
          channel: searchParams.get("channel") || undefined,
          internal_channel: searchParams.get("internal_channel") || undefined,
          type: searchParams.get("type") || undefined,
          payment: searchParams.get("payment") || undefined,
          status: searchParams.get("status") || undefined,
        },
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || pageSize,
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
    const params = new URLSearchParams(searchParams);
    params.set("limit", size.toString());
    setSearchParams(params);
  };

  const onPageChange = async (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleExport = async () => {
    await exportClientsExcel("clientes-export", token.channel, token.is_admin, {
      channel: token.channel,
      query: searchParams.get("query") || undefined,
      filters: {
        dateFrom: searchParams.get("dateFrom") || undefined,
        dateTo: searchParams.get("dateTo") || undefined,
        channel: searchParams.get("channel") || undefined,
        type: searchParams.get("type") || undefined,
        payment: searchParams.get("payment") || undefined,
        status: searchParams.get("status") || undefined,
      },
    });
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
            onClick={handleExport}
            disabled={loadingExport || loading}
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
