import * as XLSX from 'xlsx';
import { Client } from '../types/client';

export const exportToExcel = (data: Client[], filename: string) => {
  const exportData = data.map(client => ({
    ID: client.id,
    RUT: client.rut,
    Nombres: client.nombres,
    Apellidos: client.apellidos,
    'Tipo Cliente': client.type === 'business' ? 'Empresa' : 'Personal',
    Nacionalidad: client.nacionalidad,
    Email: client.email,
    WhatsApp: client.whatsapp,
    'IMEI 1': client.imei1.numero,
    'Marca 1': client.imei1.marca,
    'Modelo 1': client.imei1.modelo,
    'IMEI 2': client.imei2?.numero || '',
    'Marca 2': client.imei2?.marca || '',
    'Modelo 2': client.imei2?.modelo || '',
    'Registro IMEI': client.servicios.registroIMEI ? 'Sí' : 'No',
    'Antivirus Premium': client.servicios.antivirusPremium ? 'Sí' : 'No',
    'Total Pagado': client.totalPago.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }),
    'Estado Registro': client.status === 'registered' ? 'Registrado' : 'En Espera',
    'Estado Pago': client.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente',
    'Fecha Pago': client.fechaPago
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
  
  // Generate & Download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};