import * as XLSX from "xlsx";
import { Client, IImei, IOrder } from "../types/client";

export const exportToExcel = (
  data: IOrder[],
  filename: string,
  channel: string,
) => {
  const paidEnum = {
    pending: "Pendiente",
    approved: "Pagado",
    rejected: "Rechazado",
  };

  const imeiData = data.map((order) =>
    order.Imei.map((imei, index) => ({
      [`IMEI ${index + 1}`]: imei.imei_number || "",
      [`Marca ${index + 1}`]: imei.brand || "",
      [`Modelo ${index + 1}`]: imei.model || "",
    })),
  );

  const exportData = data.map((client, index) => ({
    ID: client.order_number,
    RUT: client.Account?.rut,
    Nombres: client.Account?.Personal?.first_name,
    Apellidos: client.Account?.Personal?.last_name,
    "Tipo Cliente": client.Account?.is_business ? "Empresa" : "Personal",
    Nacionalidad: client.Account?.Personal?.nationality,
    Email: client.email,
    WhatsApp: client.Account?.Personal?.phone_number,
    "Registro IMEI": client.has_registration ? "Sí" : "No",
    "Antivirus Premium": client.has_antivirus ? "Sí" : "No",
    ...(channel === "base" && {
      "Total Pagado": client.total_paid.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
      }),
    }),
    "Estado Registro": client.registered ? "Registrado" : "En Espera",
    "Estado Pago": paidEnum[client.paid],
    "Fecha Pago": client.created_at,
    ...imeiData[index].reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");

  // Generate & Download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportImeisToCSV = (imeis: IImei[]): string => {
  const exportData = imeis.map((imei) => ({
    Numero: imei.imei_number,
    Tipo: imei.type,
    Marca: imei.brand,
    Modelo: imei.model,
  }));

  const headers = Object.keys(exportData[0]).join(",") + "\n";
  const rows = exportData.map((row) => Object.values(row).join(",")).join("\n");
  const csvContent = headers + rows;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = URL.createObjectURL(blob);

  return link;
};
