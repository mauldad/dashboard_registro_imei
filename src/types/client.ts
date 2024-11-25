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
  id: number;
  order_number: string;
  total_paid: number;
  paid: boolean;
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
  is_business: boolean;
}

interface IBusiness {
  business_name: string;
}

interface IPersonal {
  last_name: string;
  first_name: string;
  nationality: string;
  phone_number: string;
  id_card_url: string;
}
