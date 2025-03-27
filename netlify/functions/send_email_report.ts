import type { Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY!;
const resend = new Resend(resendApiKey);

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  user_id: string;
  email: string;
  channel: string;
  is_admin: boolean;
  is_operator: boolean;
  is_client: boolean;
}

interface Order {
  id: number;
  order_number: string;
  rut: string;
  passport_number: string;
  email: string;
  phone_number: string;
  imei: Array<{ imei_number: string }>;
  created_at: string;
  registered_at: string;
  paid: "approved" | "pending" | "rejected";
  registered: boolean;
  channel: string;
  personal?: {
    first_name: string;
    last_name: string;
  };
}

const paidStatus = {
  approved: "En Espera",
  pending: "Pago Pendiente",
  rejected: "Rechazado",
};

export default async () => {
  const { data: clients, error: clientsError } = await supabase
    .from("user_details")
    .select("*")
    .eq("is_client", true)
    .eq("receive_weekly_reports", true);

  const falabellaClients =
    (clients?.filter((c) => c.channel === "falabella") as User[]) || [];
  const walmartClients =
    (clients?.filter((c) => c.channel === "walmart") as User[]) || [];

  if (
    clientsError ||
    (falabellaClients.length === 0 && walmartClients.length === 0)
  ) {
    return new Response(
      JSON.stringify({
        error: "No Falabella and Walmart registered clients found",
      }),
      {
        status: 500,
      },
    );
  }

  const { data: falabellaOrders, error: falabellaError } =
    await getLastWeekOrdersQuery("falabella");
  const { data: walmartOrders, error: walmartError } =
    await getLastWeekOrdersQuery("walmart");

  if (falabellaError || walmartError) {
    console.log("get orders of falabella: ", falabellaError);
    console.log("get orders of walmart: ", walmartError);
  }

  const { excel: falabellaExcel, error: falabellaExcelError } =
    await getExcel(falabellaOrders);
  const { excel: walmartExcel, error: walmartExcelError } =
    await getExcel(walmartOrders);

  if (falabellaExcelError || walmartExcelError) {
    console.log("create excel of falabella: ", falabellaExcelError);
    console.log("create excel of walmart: ", walmartExcelError);

    return new Response(JSON.stringify({ error: "Error creating excel" }), {
      status: 500,
    });
  }

  const { error: falabellaEmailError } =
    falabellaClients.length > 0
      ? await sendReportEmail(
          falabellaExcel,
          falabellaOrders!,
          falabellaClients,
          "falabella",
        )
      : { error: null };
  const { error: walmartEmailError } =
    walmartClients.length > 0
      ? await sendReportEmail(
          walmartExcel,
          walmartOrders!,
          walmartClients,
          "walmart",
        )
      : { error: null };

  if (falabellaEmailError || walmartEmailError) {
    console.log("send email of falabella: ", falabellaEmailError);
    console.log("send email of walmart: ", walmartEmailError);

    return new Response(JSON.stringify({ error: "Error sending email" }), {
      status: 500,
    });
  }

  return new Response(
    JSON.stringify({ message: "Email with reports send success" }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};

const getLastWeekOrdersQuery = async (channel: string) => {
  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("order_view")
    .select("*")
    .eq("channel", channel)
    .gte("created_at", oneWeekAgo)
    .order("created_at", { ascending: false });

  return { data, error } as { data: Order[] | null; error: string | null };
};

const getExcel = async (orders: Order[] | null) => {
  if (!orders) {
    return { excel: null, error: "No orders provided" };
  }

  const rejectedOrderIds = orders
    .filter((order) => order.paid === "rejected")
    .map((order) => order.id);

  const { data: rejections } = await supabase
    .from("Rejection")
    .select("order_id, created_at, reason")
    .in("order_id", rejectedOrderIds)
    .eq("resolved", false);

  const rejectionsMap = new Map(
    rejections?.map((rejection) => [
      rejection.order_id,
      {
        rejected_at: rejection.created_at,
        reason: rejection.reason,
      },
    ]) || [],
  );

  if (!orders) {
    return { excel: null, error: "No orders provided" };
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reporte");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Numero de Orden", key: "order_number", width: 15 },
      { header: "Rut o Pasaporte", key: "identification", width: 15 },
      { header: "Nombres y Apellidos", key: "full_name", width: 30 },
      { header: "Email", key: "email", width: 25 },
      { header: "Whatsapp", key: "phone_number", width: 15 },
      { header: "Imei", key: "imei", width: 20 },
      { header: "Fecha de ingreso", key: "created_at", width: 20 },
      { header: "Fecha de registro o rechazo", key: "status_date", width: 25 },
      { header: "Estado de registro", key: "status", width: 20 },
      { header: "Motivo de rechazo", key: "rejected_reason", width: 30 },
      { header: "Canal", key: "channel", width: 15 },
    ];

    orders.forEach((order) => {
      const imeis = order.imei.map((i) => i.imei_number).join(", ");
      const identification = order.rut || order.passport_number;
      const fullName = `${order.personal?.first_name.toUpperCase()} ${order.personal?.last_name.toUpperCase()}`;
      const status = order.registered ? "Registrado" : paidStatus[order.paid];
      const rejection =
        order.paid === "rejected" ? rejectionsMap.get(order.id) : null;
      const statusDate = order.registered
        ? order.registered_at
        : rejection?.rejected_at;

      worksheet.addRow({
        id: order.id,
        order_number: order.order_number,
        identification,
        full_name: fullName,
        email: order.email,
        phone_number: order.phone_number,
        imei: imeis,
        created_at: new Date(order.created_at).toLocaleString(),
        status_date: statusDate ? new Date(statusDate).toLocaleString() : "",
        status,
        rejected_reason: rejection?.reason || "",
        channel: order.channel,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    const buffer = await workbook.xlsx.writeBuffer();

    return {
      excel: buffer,
      error: null,
    };
  } catch (error) {
    console.error("Error generating Excel:", error);
    return {
      excel: null,
      error: "Error generating Excel file",
    };
  }
};

const sendReportEmail = async (
  ordersExcel: ExcelJS.Buffer | null,
  orders: Order[],
  clients: User[],
  channel: string,
) => {
  const ordersIds = orders.map((order) => order.id);
  const { data: resolvedRejections } = await supabase
    .from("Rejection")
    .select("order_id")
    .eq("resolved", true)
    .in("order_id", ordersIds);

  const totalResolved = new Set(
    resolvedRejections?.map((r) => r.order_id) || [],
  ).size;
  const totalNotResolved = orders.filter(
    (order) => order.paid === "rejected",
  ).length;
  const totalRejected = totalResolved + totalNotResolved;

  const { count: totalRegister } = await supabase
    .from("Order")
    .select("*", { count: "exact", head: true })
    .match({ channel, registered: true });

  const totalWeekRegister = orders.filter((order) => order.registered).length;

  const conversionRate =
    orders.length > 0
      ? ((totalWeekRegister / orders.length) * 100).toFixed(2)
      : "0.00";

  const metrics = {
    totalRegister: totalRegister as number,
    totalWeekRegister,
    totalRejected,
    totalResolved: totalResolved || 0,
    conversionRate,
  };

  const toEmails = clients.map((client) => client.email);

  const sendEmail = await resend.emails.send({
    from: "registrodeimei.cl <no-reply@correot.registrodeimei.cl>",
    // to: toEmails,
    to: ["linyers666@gmail.com", ...toEmails],
    subject: `Informe semanal de su servicio ${channel.charAt(0).toUpperCase() + channel.slice(1)}`,
    html: ReportEmail({
      ...metrics,
      channel,
    }),
    attachments: [
      {
        content: ordersExcel as Buffer,
        filename: `${channel}-reporte-semanal.xlsx`,
      },
    ],
  });

  if (sendEmail.error) {
    return { error: sendEmail.error };
  }

  return { error: null };
};

const ReportEmail = (data: {
  totalRegister: number;
  totalWeekRegister: number;
  totalRejected: number;
  totalResolved: number;
  conversionRate: string;
  channel: string;
}) => {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleDateString("es-AR", { month: "long" });
    return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
  };

  const dateInterval = `${formatDate(startDate)} al ${formatDate(endDate)}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informe semanal de su servicio de homologación - Registro de IMEI</title>
      </head>
      <body style="background-color: #f3f4f6; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 32px;">
            <img 
              src="https://registrodeimei.cl/wp-content/uploads/2024/11/registro-de-imei-4.png" 
              alt="Registro de IMEI Logo" 
              width="80" 
              style="width: 80px; height: auto; object-fit: cover;"
            />
          </div>

          <!-- Heading -->
          <h1 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 16px 0;">
            Informe Semanal de su Servicio
          </h1>

          <!-- Intro Text -->
          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 16px;">
            Estimado equipo ${data.channel.charAt(0).toUpperCase() + data.channel.slice(1)},
          </p>

          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
            Esperamos que se encuentren bien. Como parte de nuestro compromiso con la transparencia y calidad de servicio, 
            le compartimos el informe semanal de las métricas de su formulario de homologación:
          </p>

          <!-- Stats Box -->
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="font-size: 16px; line-height: 24px; color: #374151; margin: 8px 0;">
              <strong>Homologaciones totales:</strong> ${data.totalRegister}
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #374151; margin: 8px 0;">
              <strong>Clientes homologados (${dateInterval}):</strong> ${data.totalWeekRegister}
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #374151; margin: 8px 0;">
              <strong>Rechazos en form:</strong> ${data.totalRejected}
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #374151; margin: 8px 0;">
              <strong>Subsanados:</strong> ${data.totalResolved}
            </p>
            <p style="font-size: 16px; line-height: 24px; color: #374151; margin: 8px 0; font-weight: bold;">
              <strong>Tasa de conversión del formulario:</strong> ${data.conversionRate}%
            </p>
          </div>

          <!-- Excel Note -->
          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
            Adjunto encontrará la planilla detallada correspondiente a estas estadísticas para su revisión.
          </p>

          <!-- Closing -->
          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 8px;">
            Quedamos a su disposición para cualquier consulta o aclaración que necesite sobre este informe.
          </p>

          <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
            Saludos cordiales,<br />
            Equipo de Registro de IMEI
          </p>

          <!-- Footer -->
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Av. Gral. Bustamante 16, 7500776 Providencia, Región Metropolitana
          </p>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Registrodeimei.cl es un producto de MBSERVICES.
          </p>
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            © 2025 MBSERVICES. All rights reserved.
          </p>
          <p style="font-size: 10px; color: #9ca3af; margin: 8px 0 0 0;">
            Desarrollado por <a href="https://ridgeseo.com" style="color: #9ca3af; text-decoration: none;">ridgeseo.com</a>
          </p>
        </div>
      </body>
    </html>
  `;
};

export const config: Config = {
  schedule: "0 12 * * 2",
};
