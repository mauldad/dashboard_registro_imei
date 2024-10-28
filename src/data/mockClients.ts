import { Client } from '../types/client';

export const mockClients: Client[] = [
  {
    id: "CL001",
    rut: "16.992.600-K",
    nombres: "Marlyn",
    apellidos: "Villarroel",
    nacionalidad: "Chile",
    email: "maduoseo@maduo.cl",
    whatsapp: "+56 9 9666 1625",
    type: "personal",
    status: "registered",
    paymentStatus: "paid",
    imei1: {
      numero: "354626223546262",
      marca: "Samsung",
      modelo: "Galaxy S21"
    },
    servicios: {
      registroIMEI: true,
      antivirusPremium: true
    },
    totalPago: 19980,
    fechaPago: "2024-02-15"
  },
  {
    id: "CL002",
    rut: "76.543.210-8",
    nombres: "Empresa",
    apellidos: "Tecnológica SpA",
    nacionalidad: "Chile",
    email: "contacto@empresatech.cl",
    whatsapp: "+56 9 8765 4321",
    type: "business",
    status: "waiting",
    paymentStatus: "pending",
    imei1: {
      numero: "865432109876543",
      marca: "iPhone",
      modelo: "13 Pro"
    },
    servicios: {
      registroIMEI: true,
      antivirusPremium: false
    },
    totalPago: 9990,
    fechaPago: "2024-02-10"
  },
  {
    id: "CL003",
    rut: "12.345.678-9",
    nombres: "Juan",
    apellidos: "Pérez",
    nacionalidad: "Chile",
    email: "juan.perez@gmail.com",
    whatsapp: "+56 9 1234 5678",
    type: "personal",
    status: "registered",
    paymentStatus: "paid",
    imei1: {
      numero: "123456789012345",
      marca: "Xiaomi",
      modelo: "Redmi Note 12"
    },
    servicios: {
      registroIMEI: true,
      antivirusPremium: true
    },
    totalPago: 19980,
    fechaPago: "2024-01-15"
  },
  {
    id: "CL004",
    rut: "77.777.777-7",
    nombres: "Comercial",
    apellidos: "Mobile Ltda",
    nacionalidad: "Chile",
    email: "ventas@comercialmobile.cl",
    whatsapp: "+56 9 7777 7777",
    type: "business",
    status: "registered",
    paymentStatus: "paid",
    imei1: {
      numero: "777777777777777",
      marca: "Samsung",
      modelo: "A54"
    },
    imei2: {
      numero: "888888888888888",
      marca: "Motorola",
      modelo: "Edge 40"
    },
    servicios: {
      registroIMEI: true,
      antivirusPremium: true
    },
    totalPago: 19980,
    fechaPago: "2024-02-01"
  },
  {
    id: "CL005",
    rut: "15.151.515-5",
    nombres: "María",
    apellidos: "González",
    nacionalidad: "Chile",
    email: "maria.gonzalez@outlook.com",
    whatsapp: "+56 9 5555 5555",
    type: "personal",
    status: "waiting",
    paymentStatus: "pending",
    imei1: {
      numero: "555555555555555",
      marca: "Huawei",
      modelo: "P40 Lite"
    },
    servicios: {
      registroIMEI: true,
      antivirusPremium: false
    },
    totalPago: 9990,
    fechaPago: "2024-02-20"
  }
];