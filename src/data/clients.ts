import onboardingUrl from "@/utils/onboarding-url";
import {
  ChannelType,
  IOrder,
  OrderAnalitycs,
  PaymentStatus,
  RejectionAnalitycs,
} from "../types/client";
import supabase from "./supabase";
import { v4 as uuidv4 } from "uuid";
import { rejectedRegister, rejectedRegisterBusiness } from "@/assets/mails";
import {
  generateRejectedTokenBusiness,
  generateRejectedTokenPersonal,
} from "@/utils/generate-rejected-token";

export interface ClientFilters {
  month?: string;
  channel?: string;
  type?: string;
  payment?: string;
  status?: string;
}

export interface GetClientsParams {
  channel: string;
  query?: string;
  filters?: ClientFilters;
  page?: number;
  limit?: number;
}

export async function getClients({
  channel,
  query,
  filters,
  page = 1,
  limit = 10,
}: GetClientsParams): Promise<
  | {
      data: IOrder[];
      count: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  | undefined
> {
  try {
    const queryBuilder = supabase
      .from("Order")
      .select(
        `
        id,
        order_number,
        total_paid,
        paid,
        imei_excel_url,
        created_at,
        has_registration,
        has_antivirus,
        has_insurance,
        registered,
        purchase_receipt_url,
        import_receipt_url,
        registrant_name,
        email,
        phone_number,
        channel,
        purchase_number,
        reject_reason,
        Imei (
          imei_number,
          brand,
          model,
          imei_image,
          type
        ),
        Account (
          id,
          rut,
          is_business,
          Personal (
            first_name,
            last_name,
            nationality,
            id_card_url
          ),
          Business (
            business_name
          )
        )
      `,
        { count: "exact" },
      )
      .not("Account", "is", null)
      .order("created_at", { ascending: false });

    // Apply base channel filter
    if (channel !== "base") {
      queryBuilder.eq("channel", channel);
    }

    // Apply search query if provided
    if (query) {
      queryBuilder.or(
        `Account.rut.ilike.%${query}%,Account.Personal.first_name.ilike.%${query}%,Account.Personal.last_name.ilike.%${query}%,Account.Business.business_name.ilike.%${query}%,Imei.imei_number.ilike.%${query}%`,
      );
    }

    // Apply filters if provided
    if (filters) {
      if (filters.month) {
        queryBuilder.ilike("created_at", `${filters.month}%`);
      }
      if (filters.channel && channel === "base") {
        queryBuilder.eq("channel", filters.channel);
      }
      if (filters.type) {
        queryBuilder.eq("Account.is_business", filters.type === "business");
      }
      if (filters.payment) {
        queryBuilder.eq("paid", filters.payment);
      }
      if (filters.status) {
        queryBuilder.eq("registered", filters.status === "registered");
      }
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(error.message);
    }

    return {
      data,
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  } catch (error) {
    console.error("Get Clients Error:", error);
    throw new Error("Get clients failed");
  }
}

export interface ClientStatsFilters {
  month?: string;
  year?: string;
}

export async function getClientsStats(
  channel: string,
  filters?: ClientStatsFilters,
): Promise<OrderAnalitycs[]> {
  try {
    const queryBuilder = supabase
      .from("Order")
      .select(
        `
        Account (is_business, rut),
        registered,
        channel,
        total_paid,
        paid,
        registered_at,
        created_at
      `,
      )
      .not("Account", "is", null);

    if (channel !== "base") {
      queryBuilder.eq("channel", channel);
    }

    if (filters) {
      if (filters.month && filters.year) {
        const startDate = `${filters.year}-${filters.month}-01`;
        const endDate = new Date(
          parseInt(filters.year),
          parseInt(filters.month),
          0,
        ).toISOString();
        queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
      } else if (filters.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
      }
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(error.message);
    }

    const processedData = data.map((item) => ({
      is_business: item.Account.is_business,
      rut: item.Account.rut,
      registered: item.registered,
      channel: item.channel,
      total_paid: item.total_paid,
      paid: item.paid,
      registered_at: item.registered_at,
      created_at: item.created_at,
    }));

    return processedData;
  } catch (error) {
    console.error("Get All Clients Error:", error);
    throw new Error("Get all clients failed");
  }
}

export async function getRejectionsStats(
  filters?: ClientStatsFilters,
): Promise<RejectionAnalitycs[]> {
  try {
    const queryBuilder = supabase.from("Rejection").select(
      `
        reason,
        created_at,
        resolved_at,
        resolved
      `,
    );

    if (filters) {
      if (filters.month && filters.year) {
        const startDate = `${filters.year}-${filters.month}-01`;
        const endDate = new Date(
          parseInt(filters.year),
          parseInt(filters.month),
          0,
        ).toISOString();
        queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
      } else if (filters.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
      }
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error(error.message);
    }

    const processedData = data.map((item) => ({
      reason: item.reason,
      created_at: item.created_at,
      resolved_at: item.resolved_at,
      resolved: item.resolved,
    }));

    return processedData;
  } catch (error) {
    console.error("Get All Rejections Error:", error);
    throw new Error("Get all Rejections failed");
  }
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

const transformToPersonalUser = (formData: IOrder) => {
  const p_imeis = formData.Imei.map(
    (imei) =>
      imei.model && {
        imei_number: imei.imei_number,
        brand: imei.brand,
        model: imei.model,
      },
  );
  return {
    p_rut: formData.Account?.rut,
    p_email: formData.email,
    p_has_registration: formData.has_registration,
    p_total_paid: formData.total_paid,
    p_paid: formData.paid,
    p_first_name: formData.Account?.Personal?.first_name,
    p_last_name: formData.Account?.Personal?.last_name,
    p_phone_number: formData.phone_number,
    p_nationality: formData.Account?.Personal?.nationality,
    p_has_antivirus: formData.has_antivirus,
    p_has_insurance: formData.has_insurance,
    p_is_business: false,
    p_purchase_receipt_url: formData.purchase_receipt_url,
    p_imeis,
  };
};

const transformToBusinessUser = (formData: IOrder) => {
  const p_imeis = formData.Imei.map(
    (imei) =>
      imei.model && {
        imei_number: imei.imei_number,
        brand: imei.brand,
        model: imei.model,
      },
  );
  return {
    p_rut: formData.Account?.rut,
    p_email: formData.email,
    p_has_registration: formData.has_registration,
    p_total_paid: formData.total_paid,
    p_paid: formData.paid,
    p_business_name: formData.Account?.Business?.business_name,
    p_is_business: true,
    p_imei_excel_url: formData.imei_excel_url,
    p_import_receipt_url: formData.import_receipt_url,
    p_imeis,
  };
};

export async function createPersonalUser(formData) {
  const body = transformToPersonalUser(formData);
  const { data, error } = await supabase.rpc("create_personal_user", body);
  if (error) return;
  return data; // Account id and order id
}

export async function createBusinessUser(formData) {
  const body = transformToBusinessUser(formData);
  const { data, error } = await supabase.rpc("create_business_user", body);

  if (error) return;
  return data; // Account id and order id
}

export async function updatePersonalUser(formData: IOrder, orderId: number) {
  const transformedData = transformToPersonalUser(formData);
  const body = (({
    p_rut,
    p_total_paid,
    p_paid,
    p_first_name,
    p_last_name,
    p_has_antivirus,
    p_purchase_receipt_url,
    p_imeis,
  }) => ({
    p_order_id: orderId,
    p_rut,
    p_total_paid,
    p_paid,
    p_first_name,
    p_last_name,
    p_has_antivirus,
    p_purchase_receipt_url,
    p_imeis,
  }))(transformedData);
  const { data, error } = await supabase.rpc("update_personal_user", body);
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBusinessUser(formData: IOrder, orderId: number) {
  const transformedData = transformToBusinessUser(formData);
  const body = (({
    p_rut,
    p_total_paid,
    p_paid,
    p_business_name,
    p_imei_excel_url,
    p_import_receipt_url,
    p_imeis,
  }) => ({
    p_order_id: orderId,
    p_rut,
    p_total_paid,
    p_paid,
    p_business_name,
    p_imei_excel_url,
    p_import_receipt_url,
    p_imeis,
  }))(transformedData);
  const { data, error } = await supabase.rpc("update_business_user", body);
  if (error) throw new Error(error.message);
  return data; // Account id and order id
}

export const uploadPersonalUserIdCard = async (file: File): Promise<string> => {
  const uuidFile = uuidv4().slice(0, 8).toUpperCase();
  const timestamp = new Date().getTime();
  const dotIndex = file.name.lastIndexOf(".");
  const extension = file.name.slice(dotIndex);
  const { data: uploadData, error } = await supabase.storage
    .from("imeis")
    .upload(
      `personal/id_cards/${uuidFile}-${timestamp}-id_card${extension}`,
      file,
    );
  if (error) return "";

  const { data: publicUrlData } = supabase.storage
    .from("imeis")
    .getPublicUrl(uploadData.path);
  return publicUrlData.publicUrl;
};

export const uploadPersonalPurchaseReceipt = async (
  file: File,
): Promise<string> => {
  const uuidFile = uuidv4().slice(0, 8).toUpperCase();
  const timestamp = new Date().getTime();
  const dotIndex = file.name.lastIndexOf(".");
  const extension = file.name.slice(dotIndex);
  const { data: uploadData, error } = await supabase.storage
    .from("imeis")
    .upload(
      `personal/receipts/${uuidFile}-${timestamp}-purchase_receipt${extension}`,
      file,
    );
  if (error) return "";

  const { data: publicUrlData } = supabase.storage
    .from("imeis")
    .getPublicUrl(uploadData.path);
  return publicUrlData.publicUrl;
};

export const uploadBusinessImportReceipt = async (
  file: File,
): Promise<string> => {
  const uuidFile = uuidv4().slice(0, 8).toUpperCase();
  const timestamp = new Date().getTime();
  const dotIndex = file.name.lastIndexOf(".");
  const extension = file.name.slice(dotIndex);
  const { data: uploadData, error } = await supabase.storage
    .from("imeis")
    .upload(
      `business/receipts/${uuidFile}-${timestamp}-import_receipt${extension}`,
      file,
    );
  if (error) return "";

  const { data: publicUrlData } = supabase.storage
    .from("imeis")
    .getPublicUrl(uploadData.path);
  return publicUrlData.publicUrl;
};

export const uploadImeiImage = async (file: File): Promise<string> => {
  if (file) return "";
  return "example_url";
};

export const uploadExcelImeisFile = async (file: File) => {
  const uuidFile = uuidv4().slice(0, 8).toUpperCase();
  const timestamp = new Date().getTime();
  const dotIndex = file.name.lastIndexOf(".");
  const extension = file.name.slice(dotIndex);
  const { data: uploadData, error } = await supabase.storage
    .from("imeis")
    .upload(`business/excels/${uuidFile}-${timestamp}-excel${extension}`, file);
  if (error) return;

  const { data: publicUrlData } = supabase.storage
    .from("imeis")
    .getPublicUrl(uploadData.path);
  return publicUrlData.publicUrl;
};

export const rejectClient = async (
  order: IOrder,
  formData: { reason: string; fields: string[] },
) => {
  try {
    const { reason, fields } = formData;

    const { error: orderError } = await supabase
      .from("Order")
      .update({
        paid: "rejected",
        registered: false,
      })
      .eq("id", order.id);

    if (orderError) throw new Error(orderError.message);

    const { data: rejection, error: rejectionError } = await supabase
      .from("Rejection")
      .insert({
        order_id: order.id,
        reason,
        fields,
      })
      .select("id")
      .single();

    if (rejectionError) throw new Error(rejectionError.message);

    await sendRejectedEmail(order, formData, rejection.id);

    return { error: null };
  } catch (error) {
    console.error("Reject Client Error:", error);
    return { error: error };
  }
};

const sendRejectedEmail = async (
  order: IOrder,
  formData: { reason: string; fields: string[] },
  rejectionId: number,
) => {
  const rejectedToken = order.Account?.is_business
    ? await generateRejectedTokenBusiness(order, formData.fields, rejectionId)
    : await generateRejectedTokenPersonal(order, formData.fields, rejectionId);
  const rejectedLink = `${onboardingUrl}/order?token=${rejectedToken}`;

  await sendEmailUser(
    order.email as string,
    `Registro rechazado, Orden nº ${order.order_number}`,
    order.Account?.is_business
      ? rejectedRegisterBusiness(
          order?.Account?.Business?.business_name as string,
          formData,
          rejectedLink,
        )
      : rejectedRegister(
          order?.Account?.Personal?.first_name as string,
          order?.Account?.Personal?.last_name as string,
          formData,
          rejectedLink,
        ),
  );
};
