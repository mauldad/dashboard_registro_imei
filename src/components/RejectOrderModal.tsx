import React, { useState } from "react";
import { IOrder } from "../types/client";
import useClientStore from "../store/clients";
import toast from "react-hot-toast";

const RejectOrderModal = ({
  order,
  onClose,
}: {
  order: IOrder;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const rejectClient = useClientStore((state) => state.rejectClient);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    toast
      .promise(rejectClient(order, reason), {
        loading: "Procesando el rechazo...",
        success: "Rechazo realizado con éxito!",
        error: "No se pudo realizar el rechazo.",
      })
      .finally(() => {
        setLoading(false);
        onClose();
      });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-screen overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex justify-between">
          <span>Rechazar Orden</span>
          <span className="text-gray-400">#{order.order_number}</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="reason"
              className="text-sm font-medium text-gray-600"
            >
              Razón
            </label>
            <textarea
              required
              id="reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              rows="4" // Puedes ajustar el número de filas según lo necesites
            />
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rechazar
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectOrderModal;
