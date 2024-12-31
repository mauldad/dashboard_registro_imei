import { IOrder } from "@/types/order";

interface PersonalOrderData {
  imeis: string[];
  brand: string;
  documentType: "RUT";
  documentNumber: string | undefined;
  fullName: string;
}

interface BusinessOrderData {
  deviceType: string;
  brand: string;
  documentType: "RUT";
  documentNumber: string | undefined;
}

export const copyPersonalOrder = async (order: IOrder): Promise<void> => {
  const data: PersonalOrderData = {
    imeis: order.Imei.map((imei) => imei.imei_number),
    brand: order.Imei[0]?.brand || "",
    documentType: "RUT",
    documentNumber: order.Account?.rut,
    fullName: `${order.Account?.Personal?.first_name || ""} ${
      order.Account?.Personal?.last_name || ""
    }`.trim(),
  };
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
};

export const copyBusinessOrder = async (order: IOrder): Promise<void> => {
  const data: BusinessOrderData = {
    deviceType: order.Imei[0]?.type || "",
    brand: order.Imei[0]?.brand || "",
    documentType: "RUT",
    documentNumber: order.Account?.rut,
  };
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
};

export const exportImeisToCSV = (imeis: IOrder["Imei"]): string => {
  const csvContent = imeis
    .map((imei) => {
      return [
        imei.imei_number,
        imei.brand,
        imei.model,
        imei.type,
        imei.created_at,
      ].join(",");
    })
    .join("\n");

  const header = "IMEI,Marca,Modelo,Tipo,Fecha\n";
  const blob = new Blob([header + csvContent], { type: "text/csv;charset=utf-8;" });
  return URL.createObjectURL(blob);
};
