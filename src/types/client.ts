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
export type InternalFormType =
  | "email"
  | "phone"
  | "in_person"
  | "whatsapp"
  | "social_media";

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
  internal_form: InternalFormType;
  folio: number;
  registered_at: string | null;
}

export interface IImei {
  imei_number: string;
  brand: string;
  type: string;
  model: string;
  imei_image: string;
  serial_number: string | null;
}

interface IAccount {
  id: number;
  passport_number: string;
  rut: string;
  Business: IBusiness | null;
  Personal: IPersonal | null;
  is_business: boolean;
}

interface IBusiness {
  business_name: string;
  business_type: string;
  address: string;
  city: string;
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
  internal_form: InternalFormType | null;
  registered_by: string | null;
}

export interface RejectionAnalitycs {
  fields: string[];
  created_at: string;
  resolved_at: string;
  resolved: boolean;
}

export interface RejectionRate {
  rejectionRate: number;
  reasons: Record<string, number>;
}
