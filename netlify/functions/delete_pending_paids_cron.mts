import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async (req: Request) => {
  const { data: orders, error: ordersError } = await supabase
    .from("Order")
    .select(
      "id, account_id, purchase_receipt_url, import_receipt_url, imei_excel_url, created_at",
    )
    .eq("paid", "pending")
    .lt(
      "created_at",
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    );

  if (ordersError) {
    console.error("Error al obtener órdenes pendientes:", ordersError);
    return;
  }

  if (!orders.length) {
    console.log("No hay órdenes pendientes con más de 7 días. ✅");
    return;
  }

  const orderFiles = orders
    .map((order) =>
      [
        order.purchase_receipt_url
          ? formatUrl(order.purchase_receipt_url)
          : null,
        order.import_receipt_url ? formatUrl(order.import_receipt_url) : null,
        order.imei_excel_url ? formatUrl(order.imei_excel_url) : null,
      ].filter(Boolean),
    )
    .flat();

  const { data: accounts, error: accountsError } = await supabase
    .from("Account")
    .select("id, Personal(id_card_url)")
    .in(
      "id",
      orders.map((order) => order.account_id),
    );

  if (accountsError) {
    console.error("Error al obtener cuentas:", accountsError);
    return;
  }

  const accountFiles = accounts
    .map((account) =>
      account.Personal.id_card_url
        ? formatUrl(account.Personal.id_card_url)
        : null,
    )
    .filter(Boolean);

  const { data: imeis, error: imeisError } = await supabase
    .from("Imei")
    .select("imei_image")
    .in(
      "order_id",
      orders.map((order) => order.id),
    );

  if (imeisError) {
    console.error("Error al obtener IMEIs:", imeisError);
    return;
  }

  const imeiFiles = imeis
    .map((imei) => (imei.imei_image ? formatUrl(imei.imei_image) : null))
    .filter(Boolean);

  console.log(
    "Ordenes a eliminar: ",
    orders.map((order) => order.id),
  );
  console.log(
    "Cuentas a eliminar: ",
    accounts.map((account) => account.id),
  );

  const { error: deleteOrdersError } = await supabase
    .from("Order")
    .delete()
    .in(
      "id",
      orders.map((order) => order.id),
    );
  if (deleteOrdersError) {
    console.error("Error al eliminar órdenes:", deleteOrdersError);
    return;
  }

  const { error: deleteAccountsError } = await supabase
    .from("Account")
    .delete()
    .in(
      "id",
      accounts.map((account) => account.id),
    );
  if (deleteAccountsError) {
    console.error("Error al eliminar cuentas:", deleteAccountsError);
    return;
  }

  console.log("Archivos a eliminar:", orderFiles, accountFiles, imeiFiles);
  const { error: deleteFilesError } = await supabase.storage
    .from("imeis")
    .remove([...orderFiles, ...accountFiles, ...imeiFiles] as string[]);

  if (deleteFilesError) {
    console.error("Error al eliminar archivos:", deleteFilesError);
    return;
  }

  console.log("Órdenes pendientes eliminadas correctamente. ✅");
};

export const formatUrl = (url: string) => {
  return url
    .replace("public", "sign")
    .replace(`${supabaseUrl}/storage/v1/object/sign/imeis/`, "");
};

export const config: Config = {
  schedule: "@weekly",
};
