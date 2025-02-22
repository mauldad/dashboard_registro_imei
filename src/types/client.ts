export interface Client {
  id: string;
  rut: string;
  nombres: string;
  apellidos: string;
  nacionalidad: string;
  email: string;
  whatsapp: string;
  type: "business" | "personal";
  status: "registered" | "waiting";
  paymentStatus: "approved" | "pending";
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

export type PaymentStatus = "approved" | "pending" | "rejected";
export type ChannelType = "base" | "falabella" | "walmart";

export interface IOrder {
  id: number;
  order_number: string;
  total_paid: number;
  paid: PaymentStatus;
  created_at: string;
  Imei: IImei[];
  Account: IAccount | null;
  imei_excel_url: string;
  registered: boolean;
  has_registration: boolean;
  has_antivirus: boolean;
  has_insurance: boolean;
  import_receipt_url: string | null;
  purchase_receipt_url: string | null;
  registrant_name: string | null;
  email: string;
  phone_number: string | null;
  channel: string;
  purchase_number?: string;
  reject_reason: string | null;
}

export interface IImei {
  imei_number: string;
  brand: string;
  type: string;
  model: string;
  imei_image: string;
}

interface IAccount {
  id: number;
  rut: string;
  Business: IBusiness | null;
  Personal: IPersonal | null;
  is_business: boolean;
}

interface IBusiness {
  business_name: string;
}

interface IPersonal {
  last_name: string;
  first_name: string;
  nationality: string;
  id_card_url: string;
}

export interface OrderAnalitycs {
  rut: string;
  is_business: boolean;
  registered: boolean;
  total_paid: number;
  registered_at: string | null;
  created_at: string;
  channel: ChannelType;
  paid: PaymentStatus;
}

export interface RejectionAnalitycs {
  reason: string;
  created_at: string;
  resolved_at: string;
  resolved: boolean;
}
