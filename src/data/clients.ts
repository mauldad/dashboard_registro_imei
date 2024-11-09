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
    created_at,
    Imei (imei_number, brand, model),
    Account (
      rut,
      email,
      has_registration,
      is_active,
      is_business,
      Personal (first_name, last_name, nationality, phone_number, has_antivirus, has_insurance),
      Business (business_name)
    )
  `,
    )
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
