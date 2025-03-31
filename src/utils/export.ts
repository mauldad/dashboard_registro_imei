import * as XLSX from "xlsx";
import { IImei, IOrder } from "../types/client";

const internalFormMap = {
  email: "Correo",
  phone: "Teléfono",
  in_person: "Presencial",
  whatsapp: "WhatsApp",
  social_media: "Redes Sociales",
};

export const exportToExcel = (
  data: IOrder[],
  filename: string,
  channel: string,
  isAdmin: boolean,
) => {
  const paidEnum = {
    pending: "Pendiente",
    approved: "Pagado",
    rejected: "Rechazado",
  };

  const exportData = data.map((client, index) => ({
    ID: client.order_number,
    Canal:
      client.channel === "base"
        ? "Registro de IMEI"
        : client.channel.charAt(0).toUpperCase() + client.channel.slice(1),
    ...(client.channel === "base" && {
      "Canal Interno": client.internal_form
        ? internalFormMap[client.internal_form]
        : "-",
    }),
    "Numero de Orden": client.purchase_number || "-",
    RUT: client.Account?.rut || "-",
    Pasaporte: client.Account?.passport_number || "-",
    Nombres: client.Account?.Personal?.first_name,
    Apellidos: client.Account?.Personal?.last_name,
    "Tipo Cliente": client.Account?.is_business ? "Empresa" : "Personal",
    Nacionalidad: client.Account?.Personal?.nationality,
    Email: client.email,
    WhatsApp: client.phone_number,
    "Registro IMEI": client.has_registration ? "Sí" : "No",
    "Antivirus Premium": client.has_antivirus ? "Sí" : "No",
    ...(channel === "base"
      ? isAdmin && {
          "Total Pagado": client.total_paid.toLocaleString("es-CL", {
            style: "currency",
            currency: "CLP",
          }),
        }
      : {
          "Numero de Orden": client.purchase_number,
        }),
    "Estado Registro": client.registered ? "Registrado" : "En Espera",
    "Estado Pago": paidEnum[client.paid],
    "Fecha Pago": client.created_at,
    "Cantidad de IMEIs": client.Imei.length,
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
