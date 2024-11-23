import { IOrder } from "../types/client";
import supabase from "./supabase";

export async function getClients(): Promise<IOrder[] | undefined> {
  const { data, error } = await supabase
    .from("Order")
    .select(
      `
      id,
      order_number,
      total_paid,
      paid,
      imei_excel_url,
      created_at,
      has_registration
      has_antivirus,
      has_insurance,
      registered,
      Imei (imei_number, brand, model, imei_image),
      Account (
        id,
        rut,
        email,
        is_business,
        Personal (first_name, last_name, nationality, phone_number, id_card_url, purchase_receipt_url),
        Business (business_name, import_receipt_url)
      )
    `,
    )
    .not("Account", "is", null)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function sendEmailUser(
  toEmail: string,
  subject: string,
  html: string,
) {
  try {
    const response = await fetch("/.netlify/functions/send_email", {
      method: "POST",
      body: JSON.stringify({ toEmail, subject, html }),
    });
    if (!response.ok) {
      throw new Error("Failed to send email");
    }
  } catch (error) {
    console.error("Send Email Error:", error);
    throw new Error("Send email failed");
  }
}

const transformToPersonalUser = (formData) => {
  const imeis = [formData.imei1, formData.imei2];
  const p_imeis = imeis.map(
    (imei) =>
      imei.modelo && {
        imei_number: imei.numero,
        brand: imei.marca,
        model: imei.modelo,
      },
  );
  return {
    p_rut: formData.rut,
    p_email: formData.email,
    p_has_registration: formData.servicios.registroIMEI,
    p_total_paid: formData.totalPaid,
    p_paid: false,
    p_first_name: formData.nombres,
    p_last_name: formData.apellidos,
    p_phone_number: formData.whatsapp,
    p_nationality: formData.nacionalidad,
    p_has_antivirus: formData.servicios.antivirusPremium,
    p_has_insurance: formData.servicios.seguro,
    p_is_business: false,
    p_imeis,
  };
};

export async function createPersonalUser(formData) {
  const body = transformToPersonalUser(formData);
  const { data, error } = await supabase.rpc("create_personal_user", body);
  if (error) return;
  return data; // Account id and order id
}

const transformToBusinessUser = (formData) => {
  const imeis = [formData.imei1, formData.imei2];
  const p_imeis = imeis.map(
    (imei) =>
      imei.modelo && {
        imei_number: imei.numero,
        brand: imei.marca,
        model: imei.modelo,
      },
  );
  return {
    p_rut: formData.rut,
    p_email: formData.email,
    p_has_registration: formData.servicios.registroIMEI,
    p_total_paid: formData.totalPaid,
    p_paid: false,
    p_business_name: formData.nombreEmpresa,
    p_address: formData.direccion,
    p_business_type: formData.giro,
    p_is_business: true,
    p_imeis,
  };
};

export async function createBusinessUser(formData) {
  const body = transformToBusinessUser(formData);
  const { data, error } = await supabase.rpc("create_business_user", body);

  if (error) return;
  return data; // Account id and order id
}
