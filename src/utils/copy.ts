import { IImei, IOrder } from "@/types/client";

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
    imeis: order.Imei.map((imei: IImei) => imei.imei_number),
    brand: "OTRAS MARCAS",
    documentType: "RUT",
    documentNumber: order.Account?.rut,
    fullName: `${order.Account?.Personal?.first_name.split(" ")[0] || ""} ${
      order.Account?.Personal?.last_name.split(" ")[0] || ""
    }`.trim(),
    technicalDetails: order.order_number,
    description: "Uso personal",
    nationality: order.Account?.Personal?.nationality || "",
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
  const imeiCountBySerial: Record<string, number> = imeis.reduce(
    (acc, imei) => {
      const serialNumber = imei.serial_number || "-";
      acc[serialNumber] = (acc[serialNumber] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const csvContent = imeis
    .map((imei: IImei) => {
      const serialNumber = imei.serial_number || "-";
      const imeiCount = imeiCountBySerial[serialNumber];
      return [imei.imei_number, serialNumber, imeiCount].join(";");
    })
    .join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  return URL.createObjectURL(blob);
};
