import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Client } from '../types/client';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddClientModal = ({ isOpen, onClose }: AddClientModalProps) => {
  const [formData, setFormData] = useState({
    rut: '',
    nombres: '',
    apellidos: '',
    nacionalidad: 'Chile',
    email: '',
    whatsapp: '',
    type: 'personal',
    imei1: {
      numero: '',
      marca: '',
      modelo: ''
    },
    imei2: {
      numero: '',
      marca: '',
      modelo: ''
    },
    servicios: {
      registroIMEI: false,
      antivirusPremium: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    // For now, we'll just close the modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Nuevo Registro</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cliente
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'personal' | 'business' })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="personal">Persona</option>
                <option value="business">Empresa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RUT
              </label>
              <input
                type="text"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="12.345.678-9"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres
              </label>
              <input
                type="text"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos
              </label>
              <input
                type="text"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">IMEI Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número IMEI
                </label>
                <input
                  type="text"
                  value={formData.imei1.numero}
                  onChange={(e) => setFormData({
                    ...formData,
                    imei1: { ...formData.imei1, numero: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.imei1.marca}
                  onChange={(e) => setFormData({
                    ...formData,
                    imei1: { ...formData.imei1, marca: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.imei1.modelo}
                  onChange={(e) => setFormData({
                    ...formData,
                    imei1: { ...formData.imei1, modelo: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">IMEI Secundario (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número IMEI
                </label>
                <input
                  type="text"
                  value={formData.imei2.numero}
                  onChange={(e) => setFormData({
                    ...formData,
                    imei2: { ...formData.imei2, numero: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.imei2.marca}
                  onChange={(e) => setFormData({
                    ...formData,
                    imei2: { ...formData.imei2, marca: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.imei2.modelo}
                  onChange={(e) => setFormData({
                    ...formData,
                    imei2: { ...formData.imei2, modelo: e.target.value }
                  })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Servicios</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.servicios.registroIMEI}
                  onChange={(e) => setFormData({
                    ...formData,
                    servicios: { ...formData.servicios, registroIMEI: e.target.checked }
                  })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Registro IMEI</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.servicios.antivirusPremium}
                  onChange={(e) => setFormData({
                    ...formData,
                    servicios: { ...formData.servicios, antivirusPremium: e.target.checked }
                  })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Antivirus Premium</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientModal;