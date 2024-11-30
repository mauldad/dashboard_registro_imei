import React, { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  CreditCard,
  DollarSign,
  Pencil,
  Shield,
  Smartphone,
  Trash2,
  User,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { IOrder } from "../types/client";
import useClientStore from "../store/clients";
import { exportImeisToCSV } from "../utils/export";
import EditOrderModal from "./EditOrderModal";

const columnHelper = createColumnHelper<IOrder>();

const createColumns = (handleEdit: (order: IOrder) => void) => [
  columnHelper.accessor("order_number", {
    header: "Orden",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("Account.rut", {
    header: "RUT",
    cell: (info) => (
      <div className="flex items-center justify-center gap-2">
        {!info.row.original.Account?.is_business &&
        info.row.original.Account?.Personal?.id_card_url ? (
          <a
            target="_blank"
            href={info.row.original.Account?.Personal?.id_card_url}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {info.getValue()}
          </a>
        ) : (
          <span>{info.getValue() || "-"}</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      row.Account?.is_business
        ? row.Account?.Business?.business_name
        : `${row.Account?.Personal?.first_name} ${row.Account?.Personal?.last_name}`,
    {
      id: "nombreCompleto",
      header: "Nombre Completo",
      cell: (info) => (
        <div className="flex items-center gap-2">
          {info.row.original.Account?.is_business ? (
            <Building2 className="w-4 h-4 text-purple-500" />
          ) : (
            <User className="w-4 h-4 text-blue-500" />
          )}
          {info.row.original.Account ? info.getValue() : "Usuario Eliminado"}
        </div>
      ),
    },
  ),
  columnHelper.accessor(
    (row) =>
      row.Account?.is_business || row.import_receipt_url
        ? row.import_receipt_url
        : row.purchase_receipt_url,
    {
      id: "comprobante",
      header: "Comprobante",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <a
            target="_blank"
            href={info.getValue() as string}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {info.row.original.Account?.is_business ||
            info.row.original.import_receipt_url
              ? "Exportacion"
              : "Compra"}
          </a>
        </div>
      ),
    },
  ),
  columnHelper.accessor((row) => row.Imei, {
    header: "Número de IMEI",
    cell: (info) => {
      const imeis = info.getValue();
      if (imeis.length > 2) return null;

      return imeis.map((imei, index) => (
        <div className="flex items-center gap-2" key={index}>
          <Smartphone className="w-4 h-4 text-gray-500" />
          {imei.imei_image ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={imei.imei_image}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              {imei.imei_number}
            </a>
          ) : (
            <span>{imei.imei_number}</span>
          )}
        </div>
      ));
    },
  }),
  columnHelper.accessor((row) => row.Imei, {
    header: "Marca",
    cell: (info) => {
      const imeis = info.getValue();
      if (imeis.length <= 2) {
        return imeis.map((imei, index) => (
          <div className="flex items-center gap-2" key={index}>
            <span>{imei.brand}</span>
          </div>
        ));
      }

      const csvLink = exportImeisToCSV(imeis);
      return (
        <div className="flex items-center gap-2">
          <a
            href={csvLink}
            download={`${info.row.original.order_number}_imeis.csv`}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Hay {imeis.length + 1} Imeis
          </a>
        </div>
      );
    },
  }),
  columnHelper.accessor((row) => row.Imei, {
    header: "Modelo",
    cell: (info) => {
      const imeis = info.getValue();
      if (imeis.length > 2) return null;

      return imeis.map((imei, index) => (
        <div className="flex items-center gap-2" key={index}>
          <span>{imei.model}</span>
        </div>
      ));
    },
  }),
  columnHelper.accessor("imei_excel_url", {
    id: "excel",
    header: "Excel de IMEIs",
    cell: (info) => (
      <div className="flex items-center gap-2">
        {info.getValue() ? (
          <a
            target="_blank"
            href={info.getValue()}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Excel
          </a>
        ) : (
          <span>No hay Excel</span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor(
    (row) =>
      row.Account?.is_business
        ? [row.has_registration, false, false]
        : [row.has_registration, row.has_antivirus, row.has_insurance],
    {
      header: "Servicios",
      cell: (info) => (
        <div className="flex flex-col gap-1">
          {info.getValue()[0] && (
            <span className="inline-flex items-center gap-1 text-sm">
              <Smartphone className="w-4 h-4 text-blue-500" />
              Registro IMEI
            </span>
          )}
          {info.getValue()[1] && (
            <span className="inline-flex items-center gap-1 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              Antivirus Premium
            </span>
          )}
          {info.getValue()[2] && (
            <span className="inline-flex items-center gap-1 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              Seguro de Equipo
            </span>
          )}
        </div>
      ),
    },
  ),
  columnHelper.accessor("created_at", {
    header: "Fecha",
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        {format(parseISO(info.getValue()), "dd MMM yyyy", { locale: es })}
      </div>
    ),
  }),
  columnHelper.accessor("total_paid", {
    header: "Total Pagado",
    cell: (info) => (
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-green-600" />
        {info.getValue().toLocaleString("es-CL", {
          style: "currency",
          currency: "CLP",
        })}
      </div>
    ),
  }),
  columnHelper.accessor("paid", {
    header: "Estado Pago",
    cell: (info) => (
      <div className="flex items-center gap-1">
        {info.getValue() ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CreditCard className="w-4 h-4" />
            Pagado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4" />
            Pendiente
          </span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("registered", {
    header: "Estado Registro",
    cell: (info) => {
      const [isOpen, setIsOpen] = useState(false);
      const [loading, setLoading] = useState(false);
      const status = info.getValue();
      const updatePaid = useClientStore((state) => state.updatePaid);

      const handleStatusChange = async () => {
        setLoading(true);
        const orderId = info.row.original.id;
        const firstName = info.row.original.Account?.Personal
          ?.first_name as string;
        const lastName = info.row.original.Account?.Personal
          ?.last_name as string;
        const orderNumber = info.row.original.order_number;
        const newStatus = await updatePaid(
          orderId,
          firstName,
          lastName,
          orderNumber,
        );
        setLoading(false);
        setIsOpen(false);
      };

      return (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={!info.row.original.paid || loading}
            className={`w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            } ${loading ? "opacity-50 animate-pulse" : ""}`}
          >
            <span className="flex items-center gap-2">
              {status ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Registrado
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  En Espera
                </>
              )}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border">
              <button
                onClick={() => handleStatusChange()}
                disabled={status || loading}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                  loading ? "opacity-50 animate-pulse" : ""
                }`}
              >
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Registrado
              </button>
              <button
                onClick={() => handleStatusChange()}
                disabled={!status || loading}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 ${
                  loading ? "opacity-50 animate-pulse" : ""
                }`}
              >
                <Clock className="w-4 h-4 text-gray-600" />
                En Espera
              </button>
            </div>
          )}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    header: "Acciones",
    cell: (info) => {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleEdit(info.row.original);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar registro"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      );
    },
  }),
];

interface ClientsTableProps {
  filter: string;
  paymentFilter: string;
  registrationFilter: string;
  monthFilter: string;
  searchQuery?: string;
  clients: IOrder[];
}

const ClientsTable = ({
  filter,
  paymentFilter,
  registrationFilter,
  monthFilter,
  clients,
  searchQuery = undefined,
}: ClientsTableProps) => {
  const [editOrder, setEditOrder] = useState<IOrder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const filteredData = React.useMemo(() => {
    let result = clients;

    if (filter !== "all") {
      result = result.filter((client) =>
        filter === "business"
          ? client.Account?.is_business
          : !client.Account?.is_business,
      );
    }

    if (paymentFilter !== "all") {
      result = result.filter((client) =>
        paymentFilter === "paid" ? client.paid : !client.paid,
      );
    }

    if (registrationFilter !== "all") {
      result = result.filter((client) =>
        registrationFilter === "registered"
          ? client.registered
          : !client.registered,
      );
    }

    if (monthFilter !== "all") {
      result = result.filter((client) => {
        const clientMonth = format(parseISO(client.created_at), "yyyy-MM");
        return clientMonth === monthFilter;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          (client.order_number &&
            client.order_number.toLowerCase().includes(query)) ||
          (client.Account?.rut &&
            client.Account.rut.toLowerCase().includes(query)) ||
          (client.Account?.Personal?.first_name &&
            client.Account.Personal.first_name.toLowerCase().includes(query)) ||
          (client.Account?.Personal?.last_name &&
            client.Account.Personal.last_name.toLowerCase().includes(query)) ||
          (client.Account?.Business?.business_name &&
            client.Account.Business.business_name
              .toLowerCase()
              .includes(query)) ||
          client.Imei.some((imei) =>
            imei.imei_number.toLowerCase().includes(query),
          ) ||
          client.email.toLowerCase().includes(query),
      );
    }

    return result;
  }, [
    filter,
    paymentFilter,
    registrationFilter,
    monthFilter,
    searchQuery,
    clients,
  ]);

  const handleEdit = (order: IOrder) => {
    setEditOrder(order);
    setShowEditModal(true);
  };

  const columns = useMemo(() => createColumns(handleEdit), [handleEdit]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {showEditModal && (
        <EditOrderModal
          order={editOrder as IOrder}
          onClose={() => setShowEditModal(false)}
        />
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700">
            Página{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{" "}
            de <span className="font-medium">{table.getPageCount()}</span>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ClientsTable;
