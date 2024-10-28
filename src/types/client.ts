export interface Client {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  nacionalidad: string;
  email: string;
  whatsapp: string;
  type: 'business' | 'personal';
  status: 'registered' | 'waiting';
  paymentStatus: 'paid' | 'pending';
  imei1: {
    numero: string;
    marca: string;
    modelo: string;
  };
  imei2?: {
    numero: string;
    marca: string;
    modelo: string;
  };
  servicios: {
    registroIMEI: boolean;
    antivirusPremium: boolean;
  };
  totalPago: number;
  fechaPago: string;
}