import { IOrder } from "../types/client";
import supabase from "./supabase";

export async function getClients(): Promise<IOrder[] | undefined> {
  const { data, error } = await supabase
    .from("Order")
    .select(
      `
      order_number,
      total_paid,
      paid,
      imei_excel_url,
      created_at,
      Imei (imei_number, brand, model, imei_image),
      Account (
        id,
        rut,
        email,
        has_registration,
        is_active,
        is_business,
        Personal (first_name, last_name, nationality, phone_number, has_antivirus, has_insurance, id_card_url, purchase_receipt_url),
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
  accountId: number,
  subject: string,
  html: string,
) {
  const { data, error } = await supabase
    .from("Account")
    .select("email")
    .eq("id", accountId)
    .single();

  if (error) {
    console.error("Send Email Error:", error);
    throw new Error("Send email failed");
  }
  const toEmail = data?.email;

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
