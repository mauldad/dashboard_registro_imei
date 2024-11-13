import React, { useEffect, useState } from "react";
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
import { sendEmailUser } from "../data/clients";

const columnHelper = createColumnHelper<IOrder>();

const columns = [
  columnHelper.accessor("order_number", {
    header: "Orden",
    cell: (info) => (
      <span className="font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("Account.rut", {
    header: "RUT",
    cell: (info) => (
      <div className="flex items-center gap-2">
        {!info.row.original.Account?.is_business ? (
          <a
            target="_blank"
            href={info.row.original.Account?.Personal?.id_card_url}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {info.getValue()}
          </a>
        ) : (
          <span>{info.getValue()}</span>
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
      row.Account?.is_business
        ? row.Account?.Business?.import_receipt_url
        : row.Account?.Personal?.purchase_receipt_url,
    {
      id: "comprobante",
      header: "Comprobante",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <a
            target="_blank"
            href={info.getValue()}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            {info.row.original.Account?.is_business ? "Exportacion" : "Compra"}
          </a>
        </div>
      ),
    },
  ),
  columnHelper.accessor((row) => row.Imei.map((imei) => imei.imei_number), {
    header: "IMEI Principal",
    cell: (info) =>
      info.getValue().map((imei, index) => (
        <div className="flex items-center gap-2" key={index}>
          <Smartphone className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-2">
            {info.row.original.Imei[index].imei_image ? (
              <a
                target="_blank"
                href={info.row.original.Imei[index].imei_image}
                className="text-blue-500 hover:text-blue-700 underline"
              >
                {imei}
              </a>
            ) : (
              <span>{imei}</span>
            )}
          </div>
        </div>
      )),
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
        ? [true, false, false]
        : [
            true,
            row.Account?.Personal?.has_antivirus,
            row.Account?.Personal?.has_insurance,
          ],
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
  columnHelper.accessor("Account.is_active", {
    header: "Estado Registro",
    cell: (info) => {
      const [isOpen, setIsOpen] = useState(false);
      const [status, setStatus] = useState(info.getValue());
      const updatePaid = useClientStore((state) => state.updatePaid);

      const handleStatusChange = async () => {
        const accountId = info.row.original.Account?.id;
        if (!accountId) return;
        const firstName = info.row.original.Account?.Personal
          ?.first_name as string;
        const lastName = info.row.original.Account?.Personal
          ?.last_name as string;
        const newStatus = await updatePaid(accountId, firstName, lastName);
        setStatus(newStatus);
        setIsOpen(false);
      };

      return (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
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
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Registrado
              </button>
              <button
                onClick={() => handleStatusChange()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
    cell: () => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            /* Handle edit */
          }}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar registro"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            /* Handle delete */
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar registro"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  }),
];

interface ClientsTableProps {
  filter: string;
  paymentFilter: string;
  registrationFilter: string;
  monthFilter: string;
  searchQuery: string;
}

const ClientsTable = ({
  filter,
  paymentFilter,
  registrationFilter,
  monthFilter,
  searchQuery,
}: ClientsTableProps) => {
  const clients = useClientStore((state) => state.clients);

  const filteredData = React.useMemo(() => {
    let result = clients;

    if (filter !== "all") {
      // result = result.filter((client) => client.type === filter);
    }

    if (paymentFilter !== "all") {
      // result = result.filter(
      //   (client) => client.paymentStatus === paymentFilter,
      // );
    }

    if (registrationFilter !== "all") {
      // result = result.filter((client) => client.status === registrationFilter);
    }

    if (monthFilter !== "all") {
      // result = result.filter((client) => {
      //   const clientMonth = format(parseISO(client.fechaPago), "yyyy-MM");
      //   return clientMonth === monthFilter;
      // });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.Account?.rut.toLowerCase().includes(query) ||
          client.Account?.Personal?.first_name.toLowerCase().includes(query) ||
          client.Account?.Personal?.last_name.toLowerCase().includes(query) ||
          client.Account?.Business?.business_name
            .toLowerCase()
            .includes(query) ||
          client.Imei.map((imei) => imei.imei_number.includes(query)),
        // client.email.toLowerCase().includes(query),
      );
    }

    return result;
  }, [filter, paymentFilter, registrationFilter, monthFilter, searchQuery]);

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
