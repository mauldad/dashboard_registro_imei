import React, { useState } from 'react';
import { Users, Filter, Download, Calendar, Plus, Search } from 'lucide-react';
import ClientsTable from '../components/ClientsTable';
import AddClientModal from '../components/AddClientModal';
import { exportToExcel } from '../utils/export';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { mockClients } from '../data/mockClients';

const Clients = () => {
  const [filter, setFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: es })
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nuevo Registro
          </button>
          <button
            onClick={() => exportToExcel(mockClients, 'clientes-export')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Exportar Listado
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por RUT, nombre, IMEI..."
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-80"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-white">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="text-sm border-none focus:ring-0 p-0 pr-8"
                >
                  <option value="all">Todos los meses</option>
                  {last12Months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos los Clientes</option>
                <option value="business">Empresas</option>
                <option value="personal">Personas</option>
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos los Pagos</option>
                <option value="paid">Pagados</option>
                <option value="pending">Pendientes de Pago</option>
              </select>
              <select
                value={registrationFilter}
                onChange={(e) => setRegistrationFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Todos los Estados</option>
                <option value="registered">Registrados</option>
                <option value="waiting">En Espera</option>
              </select>
            </div>
          </div>
          <ClientsTable 
            filter={filter} 
            paymentFilter={paymentFilter}
            registrationFilter={registrationFilter}
            monthFilter={monthFilter}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default Clients;