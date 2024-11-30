import { useState } from "react";
import { IImei, IOrder } from "../types/client";
import { Building2, User } from "lucide-react";
import { updateBusinessUser, updatePersonalUser } from "../data/clients";
import useClientStore from "../store/clients";

const EditOrderModal = ({
  order,
  onClose,
}: {
  order: IOrder;
  onClose: () => void;
}) => {
  const [updatedOrder, setUpdatedOrder] = useState<IOrder>(order);
  const updateClient = useClientStore((state) => state.updateClient);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedOrder((prevOrder) => ({
      ...prevOrder,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUpdatedOrder((prevOrder) => ({
      ...prevOrder,
      [name]: checked,
    }));
  };

  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { value } = e.target;
  //   if (!updatedOrder.Account) return;
  //   setUpdatedOrder((prevOrder) => ({
  //     ...prevOrder,
  //     Account: {
  //       ...prevOrder.Account,
  //       is_business: value === "empresa",
  //     },
  //   }));
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let data;
    if (order.Account?.is_business) {
      data = await updateBusinessUser(updatedOrder, order.id);
    } else data = await updatePersonalUser(updatedOrder, order.id);

    if (!data) return;
    updateClient(updatedOrder);
    onClose(); // Cerrar el modal después de enviar la información
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-screen overflow-y-auto space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex justify-between">
          <span>Editar Orden</span>
          <span className="text-gray-400">#{order.order_number}</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div className="relative">
            <select
              value={updatedOrder.Account?.is_business ? "empresa" : "personal"}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              <option value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Personal
              </option>
              <option value="empresa" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                Empresa
              </option>
            </select>

            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
              {updatedOrder.Account?.is_business ? (
                <Building2 className="w-4 h-4 text-purple-500" />
              ) : (
                <User className="w-4 h-4 text-blue-500" />
              )}
            </div>
          </div> */}

          <div className="flex flex-col">
            <label htmlFor="rut" className="text-sm font-medium text-gray-600">
              RUT
            </label>
            <input
              type="text"
              id="rut"
              name="rut"
              value={updatedOrder.Account?.rut}
              onChange={(e) =>
                setUpdatedOrder((prevOrder: IOrder) => ({
                  ...prevOrder,
                  Account: {
                    ...prevOrder.Account,
                    rut: e.target.value,
                  },
                }))
              }
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          {order.Account?.is_business ? (
            <BusinessForm
              updatedOrder={updatedOrder}
              setUpdatedOrder={setUpdatedOrder}
              handleInputChange={handleInputChange}
            />
          ) : (
            <PersonalForm
              updatedOrder={updatedOrder}
              setUpdatedOrder={setUpdatedOrder}
              handleInputChange={handleInputChange}
              handleCheckboxChange={handleCheckboxChange}
            />
          )}

          <div className="flex flex-col">
            <label
              htmlFor="total_paid"
              className="text-sm font-medium text-gray-600"
            >
              Total a pagar
            </label>
            <input
              type="number"
              id="total_paid"
              name="total_paid"
              value={updatedOrder.total_paid}
              onChange={handleInputChange}
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="paid" className="text-sm font-medium text-gray-600">
              Orden Pagada
            </label>
            <input
              type="checkbox"
              id="paid"
              name="paid"
              checked={updatedOrder.paid}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PersonalForm = ({
  updatedOrder,
  setUpdatedOrder,
  handleInputChange,
  handleCheckboxChange,
}: any) => {
  return (
    <>
      <div className="flex items-center gap-5">
        <div className="flex flex-col">
          <label
            htmlFor="first_name"
            className="text-sm font-medium text-gray-600"
          >
            Nombres
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={updatedOrder.Account?.Personal?.first_name}
            onChange={(e) =>
              setUpdatedOrder((prevOrder: IOrder) => ({
                ...prevOrder,
                Account: {
                  ...prevOrder.Account,
                  Personal: {
                    ...prevOrder.Account?.Personal,
                    first_name: e.target.value,
                  },
                },
              }))
            }
            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="last_name"
            className="text-sm font-medium text-gray-600"
          >
            Apellidos
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={updatedOrder.Account?.Personal?.last_name}
            onChange={(e) =>
              setUpdatedOrder((prevOrder: IOrder) => ({
                ...prevOrder,
                Account: {
                  ...prevOrder.Account,
                  Personal: {
                    ...prevOrder.Account?.Personal,
                    last_name: e.target.value,
                  },
                },
              }))
            }
            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <>
        <h4 className="mt-2 text-lg">IMEIs:</h4>
        {updatedOrder.Imei?.map((imei: IImei, idx: number) => (
          <div className="flex items-center justify-between gap-2">
            <div key={`${idx}-${imei.imei_number}`} className="flex flex-col">
              <label
                htmlFor={`imei_number_${idx}`}
                className="text-sm font-medium text-gray-600"
              >
                IMEI {idx + 1}
              </label>
              <input
                type="text"
                id={`imei_number_${idx}`}
                name={`imei_number_${idx}`}
                value={imei.imei_number}
                onChange={handleInputChange}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div key={idx} className="flex flex-col">
              <label
                htmlFor={`brand_${idx}`}
                className="text-sm font-medium text-gray-600"
              >
                Marca {idx + 1}
              </label>
              <input
                type="text"
                id={`brand_${idx}`}
                name={`brand_${idx}`}
                value={imei.brand}
                onChange={handleInputChange}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div key={idx} className="flex flex-col">
              <label
                htmlFor={`model_${idx}`}
                className="text-sm font-medium text-gray-600"
              >
                Modelo {idx + 1}
              </label>
              <input
                type="text"
                id={`model_${idx}`}
                name={`model_${idx}`}
                value={imei.model}
                onChange={handleInputChange}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
        ))}
      </>

      <div className="flex items-center space-x-2">
        <label
          htmlFor="has_antivirus"
          className="text-sm font-medium text-gray-600"
        >
          Antivirus
        </label>
        <input
          type="checkbox"
          id="has_antivirus"
          name="has_antivirus"
          checked={updatedOrder.has_antivirus}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-primary focus:ring-primary"
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="purchase_receipt_url"
          className="text-sm font-medium text-gray-600"
        >
          Comprobante de compra
        </label>

        {updatedOrder.purchase_receipt_url && (
          <div className="mb-2">
            <img
              src={updatedOrder.purchase_receipt_url}
              alt="Comprobante de compra"
              className="max-w-full h-auto border border-gray-300 rounded-md"
            />
          </div>
        )}

        <input
          type="file"
          id="purchase_receipt_url"
          name="purchase_receipt_url"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Aquí puedes manejar la subida del archivo, por ejemplo, a un servicio o almacenamiento.
              // Asegúrate de procesar el archivo adecuadamente antes de actualizar el estado.
              const fileURL = URL.createObjectURL(file);
              setUpdatedOrder((prevOrder: IOrder) => ({
                ...prevOrder,
                purchase_receipt_url: fileURL, // Guardamos la URL temporal del archivo
              }));
            }
          }}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
    </>
  );
};

const BusinessForm = ({
  updatedOrder,
  setUpdatedOrder,
  handleInputChange,
}: any) => {
  return (
    <>
      <div className="flex flex-col">
        <label
          htmlFor="business_name"
          className="text-sm font-medium text-gray-600"
        >
          Nombre de la empresa
        </label>
        <input
          type="text"
          id="business_name"
          name="business_name"
          value={updatedOrder.Account?.Business?.business_name}
          onChange={(e) =>
            setUpdatedOrder((prevOrder: IOrder) => ({
              ...prevOrder,
              Account: {
                ...prevOrder.Account,
                Business: {
                  ...prevOrder.Account?.Business,
                  business_name: e.target.value,
                },
              },
            }))
          }
          className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="imei_excel_url"
          className="text-sm font-medium text-gray-600"
        >
          Excel de IMEIs
        </label>
        <input
          type="text"
          id="imei_excel_url"
          name="imei_excel_url"
          value={updatedOrder.imei_excel_url}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="import_receipt_url"
          className="text-sm font-medium text-gray-600"
        >
          Comprobante de importación
        </label>
        <input
          type="text"
          id="import_receipt_url"
          name="import_receipt_url"
          value={updatedOrder.import_receipt_url || ""}
          onChange={handleInputChange}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
    </>
  );
};

export default EditOrderModal;
