import { useState } from "react";
import { IImei, IOrder } from "../types/client";
import { Building2, Plus, Trash2, User } from "lucide-react";
import * as XLSX from "xlsx";
import {
  updateBusinessUser,
  updatePersonalUser,
  uploadBusinessImportReceipt,
  uploadExcelImeisFile,
  uploadPersonalPurchaseReceipt,
} from "../data/clients";
import useClientStore from "../store/clients";

const EditOrderModal = ({
  order,
  onClose,
}: {
  order: IOrder;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [updatedOrder, setUpdatedOrder] = useState<IOrder>(order);
  const updateClient = useClientStore((state) => state.updateClient);
  const paidEnum = {
    pending: "Pendiente",
    approved: "Pagado",
    rejected: "Rechazado",
  };

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

  const handlePaidChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as "approved" | "pending" | "rejected";
    setUpdatedOrder((prevOrder) => ({
      ...prevOrder,
      paid: status,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let data;
    setLoading(true);
    if (order.Account?.is_business) {
      data = await updateBusinessUser(updatedOrder, order.id);
    } else data = await updatePersonalUser(updatedOrder, order.id);
    setLoading(false);
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
              required
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
              required
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
            <select
              id="paid"
              value={updatedOrder.paid}
              onChange={handlePaidChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {Object.entries(paidEnum).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar cambios
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

const PersonalForm = ({
  updatedOrder,
  setUpdatedOrder,
  handleInputChange,
  handleCheckboxChange,
}: any) => {
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const handleUploadPurchaseReceipt = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingReceipt(true);
    const purchaseReceiptUrl = await uploadPersonalPurchaseReceipt(file);
    setLoadingReceipt(false);
    if (!purchaseReceiptUrl) return;
    setUpdatedOrder((prevOrder: IOrder) => ({
      ...prevOrder,
      purchase_receipt_url: purchaseReceiptUrl,
    }));
  };

  const handleAddImei = () => {
    setUpdatedOrder((prevOrder: IOrder) => ({
      ...prevOrder,
      Imei: [
        ...prevOrder.Imei,
        { imei_number: "", brand: "", model: "" }, // Valores iniciales
      ],
    }));
  };

  const handleDeleteImei = (idx: number) => {
    setUpdatedOrder((prevOrder: IOrder) => ({
      ...prevOrder,
      Imei: prevOrder.Imei.filter((_, index) => index !== idx),
    }));
  };

  const handleImeiChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
    field: keyof IImei,
  ) => {
    const { value } = e.target;
    setUpdatedOrder((prevOrder: IOrder) => ({
      ...prevOrder,
      Imei: prevOrder.Imei.map((item, index) =>
        index === idx ? { ...item, [field]: value } : item,
      ),
    }));
  };

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
            required
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
            required
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
          <div
            key={`${idx}`}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex flex-col">
              <label
                htmlFor={`imei_number_${idx}`}
                className="text-sm font-medium text-gray-600"
              >
                IMEI {idx + 1}
              </label>
              <input
                required
                type="text"
                id={`imei_number_${idx}`}
                name={`imei_number_${idx}`}
                value={imei.imei_number}
                onChange={(e) => handleImeiChange(e, idx, "imei_number")}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor={`brand_${idx}`}
                className="text-sm font-medium text-gray-600"
              >
                Marca {idx + 1}
              </label>
              <input
                required
                type="text"
                id={`brand_${idx}`}
                name={`brand_${idx}`}
                value={imei.brand}
                onChange={(e) => handleImeiChange(e, idx, "brand")}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor={`model_${idx}`}
                className="text-sm font-medium text-gray-600"
              >
                Modelo {idx + 1}
              </label>
              <input
                required
                type="text"
                id={`model_${idx}`}
                name={`model_${idx}`}
                value={imei.model}
                onChange={(e) => handleImeiChange(e, idx, "model")}
                className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
            </div>
            {updatedOrder.Imei.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteImei(idx)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {updatedOrder.Imei.length < 2 && (
          <button
            type="button"
            onClick={handleAddImei}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-md"
          >
            <Plus className="w-5 h-5" />
            Agregar IMEI
          </button>
        )}
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
            <a
              href={updatedOrder.purchase_receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 underline ${
                loadingReceipt && "opacity-50"
              }`}
            >
              Ver archivo subido
            </a>
          </div>
        )}

        <input
          disabled={loadingReceipt}
          type="file"
          id="purchase_receipt_url"
          name="purchase_receipt_url"
          onChange={handleUploadPurchaseReceipt}
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
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const brands = [
    "Samsung",
    "Apple",
    "Xiaomi",
    "Huawei",
    "Motorola",
    "LG",
    "Sony",
    "OnePlus",
    "OPPO",
    "Vivo",
    "Otro",
  ];

  const handleUploadImportReceipt = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingReceipt(true);
    const importReceiptUrl = await uploadBusinessImportReceipt(file);
    setLoadingReceipt(false);
    if (!importReceiptUrl) return;
    setUpdatedOrder((prevOrder: IOrder) => ({
      ...prevOrder,
      import_receipt_url: importReceiptUrl,
    }));
  };

  const handleUploadImeisExcel = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingExcel(true);
    const imeiExcelUrl = await uploadExcelImeisFile(file);
    setLoadingExcel(false);
    processExcelFile(file);
    if (!imeiExcelUrl) return;
    setUpdatedOrder((prevOrder: IOrder) => ({
      ...prevOrder,
      imei_excel_url: imeiExcelUrl,
    }));
  };

  const validateImei = (imei: string): boolean => {
    // Validación básica: 15 dígitos y algoritmo Luhn
    if (!/^\d{15}$/.test(imei)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = imei.length - 1; i >= 0; i--) {
      let digit = parseInt(imei[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  const processExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        const imeis = jsonData
          .flat()
          .filter((cell) => cell)
          .map((cell) => cell.toString().trim());

        const validSet: Set<string> = new Set();
        const invalidSet: Set<string> = new Set();

        imeis.forEach((imei) => {
          if (validateImei(imei)) {
            validSet.add(imei);
          } else {
            invalidSet.add(imei);
          }
        });

        const valid = Array.from(validSet).slice(0, 50000);

        if (valid.length === 0) return;
        const imeiBrand = updatedOrder.Imei[0].brand;
        setUpdatedOrder((prevOrder: IOrder) => ({
          ...prevOrder,
          Imei: valid.map((imei) => ({
            imei_number: imei,
            brand: imeiBrand,
            model: "Varios",
          })),
        }));
      } catch (error) {
        console.error("Error processing Excel file:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

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
          required
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

      <div>
        <div className="flex flex-col">
          <label
            htmlFor="imei_excel_url"
            className="text-sm font-medium text-gray-600"
          >
            Excel de IMEIs
          </label>
          {updatedOrder.imei_excel_url && (
            <div className="mb-2">
              <a
                href={updatedOrder.imei_excel_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-blue-600 underline ${
                  loadingExcel && "opacity-50"
                }`}
              >
                Hay {updatedOrder.Imei.length + 1} imeis validos en el archivo
              </a>
            </div>
          )}

          <input
            disabled={loadingExcel}
            type="file"
            id="imei_excel_url"
            name="imei_excel_url"
            onChange={(e) => handleUploadImeisExcel(e)}
            className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marca de los dispositivos
        </label>
        <select
          disabled={loadingExcel}
          value={updatedOrder.Imei[0].brand}
          onChange={(e) =>
            setUpdatedOrder((prevOrder: IOrder) => ({
              ...prevOrder,
              Imei: prevOrder.Imei.map((item) => ({
                ...item,
                brand: e.target.value,
              })),
            }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="import_receipt_url"
          className="text-sm font-medium text-gray-600"
        >
          Comprobante de importación
        </label>

        {updatedOrder.import_receipt_url && (
          <div className="mb-2">
            <a
              href={updatedOrder.import_receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 underline ${
                loadingReceipt && "opacity-50"
              }`}
            >
              Ver archivo subido
            </a>
          </div>
        )}

        <input
          type="file"
          id="import_receipt_url"
          name="import_receipt_url"
          disabled={loadingReceipt}
          onChange={(e) => handleUploadImportReceipt(e)}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
    </>
  );
};

export default EditOrderModal;
