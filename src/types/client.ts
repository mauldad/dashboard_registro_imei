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
  paymentStatus: "paid" | "pending";
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

export interface IOrder {
  order_number: string;
  total_paid: number;
  paid: boolean;
  created_at: string;
  Imei: IImei[];
  Account: IAccount | null;
  imei_excel_url: string;
}

export interface IImei {
  imei_number: string;
  brand: string;
  model: string;
  imei_image: string;
}

interface IAccount {
  id: number;
  rut: string;
  email: string;
  Business: IBusiness | null;
  Personal: IPersonal | null;
  has_registration: boolean;
  is_active: boolean;
  is_business: boolean;
}

interface IBusiness {
  business_name: string;
  import_receipt_url: string;
}

interface IPersonal {
  last_name: string;
  first_name: string;
  nationality: string;
  phone_number: string;
  has_antivirus: boolean;
  has_insurance: boolean;
  id_card_url: string;
  purchase_receipt_url: string;
}
