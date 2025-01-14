import { IOrder } from "@/types/order";

interface PersonalOrderData {
  isBusiness: false;
  imeis: string[];
  brand: string;
  documentType: "RUT";
  documentNumber: string | undefined;
  fullName: string;
  technicalDetails: string;
  description: string;
  nationality: string;
}

interface BusinessOrderData {
  isBusiness: true;
  deviceType: string;
  brand: string;
  documentType: "RUT";
  documentNumber: string | undefined;
  description: string;
}

export const copyPersonalOrder = async (order: IOrder): Promise<void> => {
  const data: PersonalOrderData = {
    isBusiness: false,
    imeis: order.Imei.map((imei) => imei.imei_number),
    brand: "OTRAS MARCAS",
    documentType: "RUT",
    documentNumber: order.Account?.rut,
    fullName: `${order.Account?.Personal?.first_name || ""} ${
      order.Account?.Personal?.last_name || ""
    }`.trim(),
    technicalDetails: order.order_number,
    description: "Uso personal",
    nationality: order.nationality || "",
  };
  await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
};

export const copyBusinessOrder = async (order: IOrder): Promise<void> => {
  const data: BusinessOrderData = {
    isBusiness: true,
    deviceType: "OTROS DISPOSITIVOS",
    brand: "OTRAS MARCAS",
    documentType: "RUT",
    documentNumber: order.Account?.rut,
    description: `RUT Empresa: ${order.Account?.rut}\nNombre de Empresa: ${order.Account?.Business?.business_name}\nNombre Contacto: ${order.registrant_name}\nEmail: ${order.email}`,
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
  const blob = new Blob([header + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  return URL.createObjectURL(blob);
};
