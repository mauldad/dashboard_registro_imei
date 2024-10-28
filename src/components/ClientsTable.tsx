import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { CheckCircle, Clock, Building2, User, Smartphone, Shield, CreditCard, DollarSign, Calendar, Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockClients } from '../data/mockClients';
import type { Client } from '../types/client';

const columnHelper = createColumnHelper<Client>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
  }),
  columnHelper.accessor('rut', {
    header: 'RUT',
  }),
  columnHelper.accessor(row => `${row.nombres} ${row.apellidos}`, {
    id: 'nombreCompleto',
    header: 'Nombre Completo',
    cell: (info) => (
      <div className="flex items-center gap-2">
        {info.row.original.type === 'business' ? (
          <Building2 className="w-4 h-4 text-purple-500" />
        ) : (
          <User className="w-4 h-4 text-blue-500" />
        )}
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('imei1.numero', {
    header: 'IMEI Principal',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Smartphone className="w-4 h-4 text-gray-500" />
        {info.getValue()}
      </div>
    ),
  }),
  columnHelper.accessor('servicios', {
    header: 'Servicios',
    cell: (info) => (
      <div className="flex flex-col gap-1">
        {info.getValue().registroIMEI && (
          <span className="inline-flex items-center gap-1 text-sm">
            <Smartphone className="w-4 h-4 text-blue-500" />
            Registro IMEI
          </span>
        )}
        {info.getValue().antivirusPremium && (
          <span className="inline-flex items-center gap-1 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            Antivirus Premium
          </span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('fechaPago', {
    header: 'Fecha',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        {format(parseISO(info.getValue()), 'dd MMM yyyy', { locale: es })}
      </div>
    ),
  }),
  columnHelper.accessor('totalPago', {
    header: 'Total Pagado',
    cell: (info) => (
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-green-600" />
        {info.getValue().toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP'
        })}
      </div>
    ),
  }),
  columnHelper.accessor('paymentStatus', {
    header: 'Estado Pago',
    cell: (info) => (
      <div className="flex items-center gap-1">
        {info.getValue() === 'paid' ? (
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
  columnHelper.accessor('status', {
    header: 'Estado Registro',
    cell: (info) => {
      const [isOpen, setIsOpen] = useState(false);
      const [status, setStatus] = useState(info.getValue());

      const handleStatusChange = (newStatus: 'registered' | 'waiting') => {
        setStatus(newStatus);
        setIsOpen(false);
      };

      return (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === 'registered'
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              {status === 'registered' ? (
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
                onClick={() => handleStatusChange('registered')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Registrado
              </button>
              <button
                onClick={() => handleStatusChange('waiting')}
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
    id: 'actions',
    header: 'Acciones',
    cell: (info) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {/* Handle edit */}}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar registro"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => {/* Handle delete */}}
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

const ClientsTable = ({ filter, paymentFilter, registrationFilter, monthFilter, searchQuery }: ClientsTableProps) => {
  const filteredData = React.useMemo(() => {
    let result = mockClients;

    if (filter !== 'all') {
      result = result.filter((client) => client.type === filter);
    }

    if (paymentFilter !== 'all') {
      result = result.filter((client) => client.paymentStatus === paymentFilter);
    }

    if (registrationFilter !== 'all') {
      result = result.filter((client) => client.status === registrationFilter);
    }

    if (monthFilter !== 'all') {
      result = result.filter((client) => {
        const clientMonth = format(parseISO(client.fechaPago), 'yyyy-MM');
        return clientMonth === monthFilter;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((client) => 
        client.rut.toLowerCase().includes(query) ||
        client.nombres.toLowerCase().includes(query) ||
        client.apellidos.toLowerCase().includes(query) ||
        client.imei1.numero.includes(query) ||
        client.email.toLowerCase().includes(query)
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
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
            Página{' '}
            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> de{' '}
            <span className="font-medium">{table.getPageCount()}</span>
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
          onChange={e => {
            table.setPageSize(Number(e.target.value));
          }}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
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